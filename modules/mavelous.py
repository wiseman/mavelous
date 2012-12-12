import collections
import logging
import os
import sys
import threading

import mavlinkv10

# FIXME: Please.
sys.path.insert(0, os.path.join(
    os.path.dirname(os.path.realpath(__file__)), 'lib'))
import mavelous_server


logger = logging.getLogger(__name__)

g_module_context = None


class MetaMessage(object):
  def __init__(self, msg_type=None, data=None):
    self.msg_type = msg_type
    self.data = data or {}

  def get_type(self):
    return self.msg_type

  def to_dict(self):
    d = dict(self.data.items())
    d['mavpackettype'] = self.msg_type
    return d


class MessageMemo(object):
  """Mavlink message memory.

  Keeps track of the most recent Mavlink message of each type.

  All operations are threadsafe.
  """
  def __init__(self):
    # Messages is keyed by message type, contains entries of the form
    # (time, sequence_#, message).
    self._messages = dict({})
    self._time = 0
    self._lock = threading.Lock()

  def add_message(self, message):
    """Adds a message to the memo."""
    with self._lock:
      message_type = message.get_type().upper()
      if message_type == 'GPS_RAW_INT':
        # Our idea of time comes from the GPS_RAW_INT message.
        self._time = message.time_usec
      if message_type in self._messages:
        (unused_oldtime, n, unused_oldm) = self._messages[message_type]
        self._messages[message_type] = (self._time, n + 1, message)
      else:
        self._messages[message_type] = (self._time, 0, message)

  def get_messages(self, message_types=None):
    """Gets messages from the memo.

    Args:
      message_types: If specified, should be a sequence of message types to
          return.  If unspecified, all messages will be returned.

    Returns:
      A collection of message entries of the form (time, seq #, message).
    """
    with self._lock:
      if message_types is None:
        return self._messages.values()
      else:
        msgs = self._messages
        return [msgs[t.upper()] for t in message_types if t.upper() in msgs]


class LinkStateThread(threading.Thread):
  def __init__(self, parent, module_context):
    self._running_flag = False
    self.parent = parent
    self.module_context = module_context
    self.stop = threading.Event()
    threading.Thread.__init__(self, target=self.run_method)
    self.daemon = True

  def run_method(self):
    try:
      while (not self.stop.wait(1)):
        self.update_meta_linkquality()
    finally:
      self._running_flag = False

  def terminate(self):
    logger.info('Terminating metalinkquality')
    self.stop.set()

  def update_meta_linkquality(self):
    master = self.module_context.mav_master[0]
    d = {
      'master_in': self.module_context.status.counters['MasterIn'][0],
      'master_out': self.module_context.status.counters['MasterOut'],
      'mav_loss': master.mav_loss,
      'packet_loss': master.packet_loss()
      }
    msg = MetaMessage(msg_type='META_LINKQUALITY', data=d)
    self.parent.handle_message(msg)


class ModuleState(object):
  def __init__(self, module_context):
    self.client_waypoint = None
    self.client_waypoint_seq = 0
    self.wp_change_time = 0
    self.waypoints = []
    self.fence_change_time = 0
    self.server = None
    self._message_memo = MessageMemo()
    self._message_handlers = collections.defaultdict(list)
    self.module_context = module_context
    self.linkstatethread = LinkStateThread(self, module_context)
    self.linkstatethread.start()

  def terminate(self):
    logger.info('mavelous module state terminate')
    self.server.terminate()
    self.linkstatethread.terminate()

  def handle_message(self, message):
    """Processes an incoming Mavlink message."""
    self._message_memo.add_message(message)
    message_type = message.get_type()
    if message_type in self._message_handlers:
      logger.info('Calling handlers for message %s', message)
      # Make a copy before iterating in case a handler calls
      # remove_handler.
      handlers = self._message_handlers[message_type][:]
      for handler in handlers:
        handler(self, message)

  def add_message_handler(self, message_type, handler):
    """Registers a handler function for a Mavlink message type."""
    self._message_handlers[message_type].append(handler)

  def remove_message_handler(self, message_type, handler):
    """Removed a previously registered handler function."""
    self._message_handlers[message_type].remove(handler)

  def get_messages(self, message_types=None):
    """Gets the most recent messages of each type.

    Args:
      message_types: If specified, should be a sequence of message types to
          return.  If unspecified, all messages will be returned.

    Returns:
      A collection of message entries of the form (time, seq #, message).
    """
    return self._message_memo.get_messages(message_types=message_types)

  def rcoverride(self, msg):
    def validate(rc_msg, key):
      if key in rc_msg:
        # 0 means go back to non-overridden value.
        if rc_msg[key] == 0:
          return 0
        else:
          return max(1000, min(2000, rc_msg[key]))
      else:
        # Mavlink defines -1 to mean do not change overridden
        # value. Unfortunately Mavlink also defines this field to be
        # unsigned. See https://github.com/mavlink/mavlink/issues/72
        return 65535

    msg = mavlinkv10.MAVLink_rc_channels_override_message(
      self.module_context.status.target_system,
      self.module_context.status.target_component,
      validate(msg, 'ch1'),
      validate(msg, 'ch2'),
      validate(msg, 'ch3'),
      validate(msg, 'ch4'),
      validate(msg, 'ch5'),
      validate(msg, 'ch6'),
      validate(msg, 'ch7'),
      validate(msg, 'ch8'))
    self.module_context.queue_message(msg)

  def command_long(self, m):
    if m['command'] == 'NAV_LOITER_UNLIM':
      msg = mavlinkv10.MAVLink_command_long_message(
        self.module_context.status.target_system,  # target_system
        self.module_context.status.target_component,  # target_component
        mavlinkv10.MAV_CMD_NAV_LOITER_UNLIM,  # command
        0,  # confirmation
        0,  # param1
        0,  # param2
        0,  # param3
        0,  # param4
        0,  # param5
        0,  # param6
        0)  # param7
      self.module_context.queue_message(msg)
    elif m['command'] == 'NAV_RETURN_TO_LAUNCH':
      msg = mavlinkv10.MAVLink_command_long_message(
        self.module_context.status.target_system,  # target_system
        self.module_context.status.target_component,  # target_component
        mavlinkv10.MAV_CMD_NAV_RETURN_TO_LAUNCH,  # command
        0,  # confirmation
        0,  # param1
        0,  # param2
        0,  # param3
        0,  # param4
        0,  # param5
        0,  # param6
        0)  # param7
      self.module_context.queue_message(msg)
    elif m['command'] == 'NAV_LAND':
      msg = mavlinkv10.MAVLink_command_long_message(
        self.module_context.status.target_system,    # target_system
        self.module_context.status.target_component,  # target_component
        mavlinkv10.MAV_CMD_NAV_LAND,  # command
        0,  # confirmation
        0,  # param1
        0,  # param2
        0,  # param3
        0,  # param4
        0,  # param5
        0,  # param6
        0)  # param7
      self.module_context.queue_message(msg)
    elif m['command'] == 'COMPONENT_ARM_DISARM':
      # First, decode component, a required field
      if 'component' not in m:
        return
      if m['component'] == 'default':
        component = self.module_context.status.target_component
      elif m['component'] == 'SYSTEM_CONTROL':
        component = mavlinkv10.MAV_COMP_ID_SYSTEM_CONTROL
      elif type(m['component']) == int:
        component = m['component']
      else:
        return
      # then find the value of param1 from the field 'setting':
      if 'setting' not in m:
        return
      if m['setting'] == 0 or m['setting'] == 'DISARM':
        param1 = 0
      elif m['setting'] == 1 or m['setting'] == 'ARM':
        param1 = 1
      else:
        return
      # finally form a message
      msg = mavlinkv10.MAVLink_command_long_message(
        self.module_context.status.target_system,  # target_system
        component,  # target_component
        mavlinkv10.MAV_CMD_COMPONENT_ARM_DISARM,  # command
        0,  # confirmation
        param1,  # param1
        0,  # param2
        0,  # param3
        0,  # param4
        0,  # param5
        0,  # param6
        0)  # param7
      logger.info(msg)
      self.module_context.queue_message(msg)

  def get_wp_count(self):
    msg = mavlinkv10.MAVLink_mission_request_list_message(
      self.module_context.status.target_system,
      self.module_context.status.target_component)
    self.module_context.queue_message(msg)

  def get_wp(self, index):
    logger.info('get_wp')
    msg = mavlinkv10.MAVLink_mission_request_message(
      self.module_context.status.target_system,
      self.module_context.status.target_component,
      index)
    logger.info('get_wp about to queue')
    self.module_context.queue_message(msg)

  def guide(self, command):
    # First draft, assumes the command has a location and we want to
    # fly to the location right now.
    seq = 0
    frame = mavlinkv10.MAV_FRAME_GLOBAL_RELATIVE_ALT
    cmd = mavlinkv10.MAV_CMD_NAV_WAYPOINT
    param1 = 0  # Hold time in seconds.
    param2 = 5  # Acceptance radius in meters.
    param3 = 0  # Pass through the WP.
    param4 = 0  # Desired yaw angle at WP.
    # Expects float, but json sometimes decodes to int:
    x = float(command['location']['lat'])
    y = float(command['location']['lon'])
    z = float(command['location']['alt'])
    self.client_waypoint = command['location']
    self.client_waypoint_seq += 1
    # APM specific current value, 2 means this is a "guided mode"
    # waypoint and not for the mission.
    current = 2
    autocontinue = 0
    msg = mavlinkv10.MAVLink_mission_item_message(
      self.module_context.status.target_system,
      self.module_context.status.target_component,
      seq, frame, cmd, current, autocontinue, param1, param2, param3, param4,
      x, y, z)
    self.module_context.queue_message(msg)
    msg = MetaMessage(
      msg_type='META_WAYPOINT',
      data={'waypoint': {'lat': x, 'lon': y, 'alt': z}})
    self.handle_message(msg)


def name():
  """Returns the module name."""
  return 'mavelous'


def description():
  """Returns the module description."""
  return 'modest map display'


def init(module_context):
  """Initialise module."""
  global g_module_context
  g_module_context = module_context
  # FIXME: Someday mavproxy should be changed to set logging level and
  # format via command line options and environment variables.
  logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s:%(levelname)s:%(module)s:%(lineno)d: %(message)s')
  state = ModuleState(module_context)
  g_module_context.mavelous_state = state
  state.server = mavelous_server.start_server(
    '0.0.0.0', port=9999, module_state=state)
  print 'Mavelous is running at http://localhost:9999'


def unload():
  """Unload module.

  Called by mavproxy.
  """
  logger.info('mavelous module unload')
  global g_module_context
  g_module_context.mavelous_state.terminate()


def mavlink_packet(m):
  """Handle an incoming mavlink packet.

  Called by mavproxy.
  """
  global g_module_context
  #logger.info(m)
  state = g_module_context.mavelous_state
  state.handle_message(m)
  # if the waypoints have changed, redisplay
  if state.wp_change_time != g_module_context.status.wploader.last_change:
    state.wp_change_time = g_module_context.status.wploader.last_change
    state.waypoints = g_module_context.status.wploader.wpoints[:]

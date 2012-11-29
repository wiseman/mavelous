import json
import logging
import os
import os.path
import threading
import types

import cherrypy
from ws4py.server import cherrypyserver
from ws4py import websocket

logger = logging.getLogger(__name__)

STATIC_DIR = os.path.join(os.path.dirname(__file__), 'mavelous_web')


class Error(Exception):
  pass


# Just redirects / to /index.html.
class Root(object):
  @cherrypy.expose()
  def index(self):
    raise cherrypy.HTTPRedirect('/index.html')


class WebSocketHandler(websocket.WebSocket):
  def opened(self):
    print 'WOOJJW websocket opened'

  def closed(self, code, reason=None):
    print 'WOOJJW websocket closed %s %s' % (code, reason)

  def received_message(self, message):
    msgtypes = [str(message)]
    messages = cherrypy.request.app.root.get_latest_messages(msgtypes)
    self.send(json.dumps(messages))


class MavelousApi(object):
  def __init__(self, module_state):
    self.module_state = module_state

  def get_latest_messages(self, msgtypes):
    # Treat '*' as a wildcard.
    if not msgtypes or msgtypes[0] == '*':
      message_types = None
    else:
      message_types = msgtypes[0].split('+')
    results = {}
    for (time, seq_num, message) in self.module_state.get_messages(
      message_types=message_types):
      results[message.get_type()] = response_dict_for_message(
        message, time, seq_num)
    return results

  @cherrypy.expose
  def ws(self):
    # you can access the class instance through
    unused_handler = cherrypy.request.ws_handler

  @cherrypy.expose()
  @cherrypy.tools.json_out()
  def latest_messages(self, *msgtypes, **unused_kw_args):
    return self.get_latest_messages(msgtypes)

  @cherrypy.expose()
  def guide(self):
    command = read_json_body()
    self.module_state.guide(command)
    return 'OK'

  @cherrypy.expose()
  def command_long(self):
    # FIXME: I couldn't figure out how to get jquery to send a
    # Content-Type: application/json, which would have let us use
    # request.json.  And for some reason the data is in the key name.
    command = read_json_body()
    self.module_state.command_long(command)
    return 'OK'

  @cherrypy.expose()
  def rcoverride(self):
    command = read_json_body()
    self.module_state.rcoverride(command)
    return 'OK'

  @cherrypy.expose()
  @cherrypy.tools.json_out()
  def get_mission(self):
    handler = MissionMessageHandler()
    self.module_state.add_message_handler('MISSION_COUNT', handler)
    self.module_state.get_wp_count()
    return handler.results()


class MissionMessageHandler(object):
  def __init__(self):
    self._mission_item_count = None
    self._mission_items = []
    self._complete = False
    self._condvar = threading.Condition()

  def __call__(self, state, message):
    """Called by mavelous.ModuleState to handle messages.

    Expects to get one MISSION_COUNT message, then multiple
    MISSION_ITEM messages.
    """
    with self._condvar:
      message_type = message.get_type()
      if message_type == 'MISSION_COUNT':
        state.add_message_handler('MISSION_ITEM', self)
        self._mission_item_count = message.count
        # Spam all our waypoint request messages to reduce overall
        # latency. Works in SITL, needs to be tested in the real thing.
        for i in range(message.count):
          state.get_wp(i)
      elif message_type == 'MISSION_ITEM':
        self._mission_items.append(message)
        if len(self._mission_items) == self._mission_item_count:
          # We're done; clean up.
          self._complete = True
          state.remove_message_handler('MISSION_COUNT', self)
          state.remove_message_handler('MISSION_ITEM', self)
          self._condvar.notifyAll()
      else:
        raise Error('Unexpected message type %s', message)

  def wait(self):
    with self._condvar:
      while not self._complete:
        self._condvar.wait()

  def results(self):
    self.wait()
    with self._condvar:
      results = [m.to_dict() for m in sorted(
          self._mission_items, key=lambda x: x.seq)]
      return results


def nul_terminate(s):
  nul_pos = s.find('\0')
  if nul_pos >= 0:
    return s[:nul_pos]
  else:
    return s


def response_dict_for_message(msg, time, index):
  mdict = msg.to_dict()
  for key, value in mdict.items():
    if isinstance(value, types.StringTypes):
      mdict[key] = nul_terminate(value)
    resp = {
      'time_usec': time,
      'index': index,
      'msg': mdict
      }
  return resp


def read_json_body():
  cl = cherrypy.request.headers['Content-Length']
  rawbody = cherrypy.request.body.read(int(cl))
  return json.loads(rawbody)


def start_server(address, port, module_state):
  cherrypy.config.update({
      'server.socket_host': address,
      'server.socket_port': port
      })
  # Turn off autoreload, which doesn't work for us.
  cherrypy.engine.autoreload.unsubscribe()

  cherrypyserver.WebSocketPlugin(cherrypy.engine).subscribe()
  cherrypy.tools.websocket = cherrypyserver.WebSocketTool()

  # / serves static files
  cherrypy.tree.mount(Root(), '/', config={
      '/': {
        'tools.staticdir.on': True,
        'tools.staticdir.dir': STATIC_DIR
        }
      })
  # /mavelousapi is handled by MavelousApi.
  cherrypy.tree.mount(MavelousApi(module_state), '/mavelousapi', config={
      '/ws': {
        'tools.websocket.on': True,
        'tools.websocket.handler_cls': WebSocketHandler
        }
      })
  cherrypy.engine.start()
  return None

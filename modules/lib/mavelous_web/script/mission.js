goog.provide('mavelous');
goog.provide('mavelous.Mission');
goog.provide('mavelous.MissionItem');
goog.provide('mavelous.MissionItemType');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.object');


/** @enum {string} */
mavelous.Error = {
  INVALID_MISSION_ITEM_TYPE: 'Invalid mission item type',
  INVALID_FIELD_NAME: 'Invalid mission item field name'
};



/**
 * @param {mavelous.MissionItemType} type The type.
 * @param {object=} opt_values Field values.
 * @constructor
 */
mavelous.MissionItem = function(type, opt_values) {
  if (!(type in goog.object.transpose(mavelous.MissionItemType))) {
    throw Error(mavelous.Error.INVALID_MISSION_ITEM_TYPE + ' ' + type);
  }
  this.type_ = type;
  this.checked = true;
  this.initializeFieldValues_();
  for (var fieldName in opt_values) {
    this.setFieldValue(fieldName, opt_values[fieldName]);
  }
};


/**
 * @private
 */
mavelous.MissionItem.prototype.initializeFieldValues_ = function() {
  this.fieldValues = {};
  var fields = this.getFields();
  for (var i = 0; i < fields.length; i++) {
    this.setFieldValue(fields[i], null);
  }
};


/**
 * @param {mavelous.MissionItemType} type The new type.
 */
mavelous.MissionItem.prototype.setType = function(type) {
  goog.asserts.assert(
      goog.array.contains(
      goog.object.getValues(mavelous.MissionItemType), type),
      'Not a mavelous.MissionItemType: ' + type);
  this.type_ = type;
  this.initializeFieldValues_();
};


/**
 * @return {Array.<string>} The field names.
 */
mavelous.MissionItem.prototype.getFields = function() {
  return this.type_.fields;
};


/**
 * @param {string} fieldName The name of the field to retrieve.
 * @return {object} The field value.
 */
mavelous.MissionItem.prototype.getFieldValue = function(fieldName) {
  this.checkFieldName_(fieldName);
  return this.fieldValues[fieldName];
};


/**
 * @param {string} fieldName The name of the field.
 * @param {object} fieldValue the value of the field.
 */
mavelous.MissionItem.prototype.setFieldValue = function(fieldName, fieldValue) {
  this.checkFieldName_(fieldName);
  this.fieldValues[fieldName] = fieldValue;
};


/**
 * @param {string} fieldName The field name.
 * @private
 */
mavelous.MissionItem.prototype.checkFieldName_ = function(fieldName) {
  if (!this.type_.fields.hasOwnProperty(fieldName)) {
    throw Error(mavelous.Error.INVALID_FIELD_NAME + ' ' + fieldName);
  }
};


/**
 * @return {mavelous.MisionItemType} The mission item type.
 */
mavelous.MissionItem.prototype.getTypeName = function() {
  return this.type_.name;
};



/**
 * @param {Array.<mavelous.MissionItem>} items  The items.
 * @constructor
 */
mavelous.Mission = function(items) {
  /**
   * @type {Array.<mavelous.MissionItem>}
   * @private
   */
  this.items_ = goog.array.clone(items);
};


mavelous.Mission.parseFromMavlink = function(jsonMissionItems) {
  var missionItems = [];
  for (var i = 0; i < jsonMissionItems.length; i++) {
    var message = jsonMissionItems[i];
    var type = mavelous.MissionItemType.findByCommandId(message.command);
    values = {
      'target_system': message['target_system'],
      'target_component': message['target_component'],
      'seq': message['seq'],
      'autocontinue': message['autocontinue'],
      'frame': message['frame'],
      'current': message['current'],
      'p1': message['param1'],
      'p2': message['param2'],
      'p3': message['param3'],
      'p4': message['param4'],
      'x': message['x'],
      'y': message['y'],
      'z': message['z']
    };
    var item_values = {};
    for (var v in values) {
      if (v in type.fields) {
        item_values[v] = values[v];
      }
    }
    var missionItem = new mavelous.MissionItem(type, item_values);
    missionItems.push(missionItem);
  }
  goog.array.sort(missionItems, function(a, b) { return a.seq - b.seq; });
  console.log(missionItems);
  var mission = new mavelous.Mission(missionItems);
  console.log(mission);
  return mission;
};


/** @return {Array.<mavelous.MissionItem>} All the items on this list. */
mavelous.Mission.prototype.getItems = function() {
  // This ensures that a client cannot change the order of the items, but a
  // client will be able to mutate the items themselves.
  return goog.array.clone(this.items_);
};


/** @return {number} Number of items that have been checked off. */
mavelous.Mission.prototype.getNumChecked = function() {
  var numChecked = goog.array.reduce(this.items_, function(sum, item) {
    return item.checked ? sum + 1 : sum;
  }, 0);
  return /** @type {number} */ (numChecked);
};


/**
 * @param {string} name The name of the type.
 * @param {dict=} opt_fields The fields associated with the type.
 * @return {object} The type object.
 * @private
 */
mavelous.makeMissionItemType_ = function(name, cmd_id, opt_fields) {
  goog.asserts.assertString(name, 'name is not a string: ' + name);
  goog.asserts.assertNumber(cmd_id, 'cmd_id is not a number: ' + cmd_id);
  if (goog.isDef(opt_fields)) {
    goog.asserts.assertObject(
        opt_fields, 'opt_fields is not an object: ' + opt_fields);
  }
  fields = {
    'target_system': null,
    'target_component': null,
    'seq': null,
    'autocontinue': null,
    'frame': null,
    'current': null
  };
  opt_fields = opt_fields || {};
  goog.object.extend(fields, opt_fields);
  return {
    'cmd_id': cmd_id,
    'name': name,
    'fields': fields
  };
};


mavelous.missionItemFieldDisplayName = function(type, field) {
  return mavelous.MissionItemType[type].fields[field];
};


/** @enum {dict} */
mavelous.MissionItemType = {
  WAYPOINT: mavelous.makeMissionItemType_(
      'WAYPOINT', 16, {
        p1: 'Delay',
        p2: 'Hit rad',
        p4: 'Yaw ang',
        x: 'Lat',
        y: 'Lon',
        z: 'Alt'
      }),
  LOITER_UNLIM: mavelous.makeMissionItemType_(
      'LOITER_UNLIM', 17, {
        x: 'Lat',
        y: 'Lat',
        z: 'Alt'
      }),
  LOITER_TURNS: mavelous.makeMissionItemType_(
      'LOITER_TURNS', 18, {
        p1: 'Turns',
        x: 'Lat',
        y: 'Lon',
        z: 'Alt'
      }),
  LOITER_TIME: mavelous.makeMissionItemType_(
      'LOITER_TIME', 19, {
        p1: 'Time (s)',
        p3: 'Rad',
        p4: 'Yaw per'
      }),
  RETURN_TO_LAUNCH: mavelous.makeMissionItemType_('RETURN_TO_LAUNCH', 20),
  LAND: mavelous.makeMissionItemType_('LAND', 21),
  TAKEOFF: mavelous.makeMissionItemType_(
      'TAKEOFF', 22, {
        z: 'Alt'
      }),
  ROI: mavelous.makeMissionItemType_(
      'ROI', 80, {
        x: 'Lat',
        y: 'Lon',
        z: 'Alt'
      }),
  PATHPLANNING: mavelous.makeMissionItemType_('PATHPLANNING', 81),
  CONDITION_DELAY: mavelous.makeMissionItemType_(
      'CONDITION_DELAY', 112, {
        p1: 'Time (s)'
      }),
  CONDITION_CHANGE_ALT: mavelous.makeMissionItemType_(
      'CONDITION_CHANGE_ALT', 113, {
        p1: 'Rate (cm/s)',
        z: 'Alt'
      }),
  CONDITION_DISTANCE: mavelous.makeMissionItemType_(
      'CONDITION_DISTANCE', 114, {
        p1: 'Dist (m)'
      }),
  CONDITION_YAW: mavelous.makeMissionItemType_(
      'CONDITION_YAW', 115, {
        p1: 'Deg',
        p2: 'Sec',
        p3: 'Dir (1=CW)',
        p4: 'Rel/abs'
      }),
  DO_SET_MODE: mavelous.makeMissionItemType_('DO_SET_MODE', 176),
  DO_JUMP: mavelous.makeMissionItemType_(
      'DO_JUMP', 177, {
        p1: 'Missionitem #',
        p2: 'Repeat #'
      }),
  DO_CHANGE_SPEED: mavelous.makeMissionItemType_(
      'DO_CHANGE_SPEED', 178, {
        p1: 'Speed (m/s)'
      }),
  DO_SET_HOME: mavelous.makeMissionItemType_(
      'DO_SET_HOME', 179, {
        p1: 'Current (1)/Spec (0)'
      }),
  DO_SET_PARAMETER: mavelous.makeMissionItemType_(
      'DO_SET_PARAMETER', 180, {
        p1: '#',
        p2: 'Value'
      }),
  DO_SET_RELAY: mavelous.makeMissionItemType_(
      'DO_SET_RELAY', 181, {
        p1: 'Off (0)/on (1)'
      }),
  DO_REPEAT_RELAY: mavelous.makeMissionItemType_(
      'DO_REPEAT_RELAY', 182, {
        p2: 'Repeat #',
        p3: 'Delay (s)'
      }),
  DO_SET_SERVO: mavelous.makeMissionItemType_(
      'DO_SET_SERVO', 183, {
        p1: 'Serial #',
        p2: 'PWM'
      }),
  DO_REPEAT_SERVO: mavelous.makeMissionItemType_(
      'DO_REPEAT_SERVO', 184, {
        p1: 'Serial #',
        p2: 'PWM',
        p3: 'Repeat #',
        p4: 'Delay (s)'
      }),
  // FIXME: MAV_CMD_DO_CONTROL_VIDEO?
  DO_DIGICAM_CONFIGURE: mavelous.makeMissionItemType_(
      'DO_DIGICAM_CONFIGURE', 202),
  DO_DIGICAM_CONTROL: mavelous.makeMissionItemType_('DO_DIGICAM_CONTROL', 203),
  DO_MOUNT_CONFIGURE: mavelous.makeMissionItemType_('DO_MOUNT_CONFIGURE', 204),
  DO_MOUNT_CONTROL: mavelous.makeMissionItemType_('DO_MOUNT_CONTROL', 205)
};


mavelous.MissionItemType.findByCommandId = function(cmd_id) {
  goog.asserts.assertNumber(cmd_id, 'cmd_id is not a number: ' + cmd_id);
  for (var typeName in mavelous.MissionItemType) {
    if (mavelous.MissionItemType[typeName].cmd_id == cmd_id) {
      return mavelous.MissionItemType[typeName];
    }
  }
};

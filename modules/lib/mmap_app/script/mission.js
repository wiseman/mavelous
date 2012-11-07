goog.provide('mavelous');
goog.provide('mavelous.Mission');
goog.provide('mavelous.MissionItem');
goog.provide('mavelous.MissionItemType');

goog.require('goog.array');


/** @enum {string} */
mavelous.Error = {
  INVALID_MISSION_ITEM_TYPE: 'Invalid mission item type',
  INVALID_FIELD_NAME: 'Invalid mission item field name'
};



/**
 * @param {string} id The ID.
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
    goog.array.contains(goog.object.getValues(mavelous.MissionItemType), type),
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
 * @param {dict} opt_fields The fields associated with the type.
 * @return {object} The type object.
 * @private
 */
mavelous.makeMissionItemType_ = function(name, opt_fields) {
  return {
    name: name,
    fields: opt_fields || {}
  };
};


mavelous.missionItemFieldDisplayName = function(type, field) {
  return mavelous.MissionItemType[type].fields[field];
};


/** @enum {dict} */
mavelous.MissionItemType = {
  WAYPOINT: mavelous.makeMissionItemType_(
    'WAYPOINT', {
      p1: 'Delay',
      p2: 'Hit rad',
      p4: 'Yaw ang',
      x: 'Lat',
      y: 'Lon',
      z: 'Alt'
    }),
  LOITER_UNLIM: mavelous.makeMissionItemType_(
    'LOITER_UNLIM', {
      x: 'Lat',
      y: 'Lat',
      z: 'Alt'
    }),
  LOITER_TURNS: mavelous.makeMissionItemType_(
    'LOITER_TURNS', {
      p1: 'Turns',
      x: 'Lat',
      y: 'Lon',
      z: 'Alt'
    }),
  LOITER_TIME: mavelous.makeMissionItemType_(
    'LOITER_TIME', {
      p1: 'Time (s)',
      p3: 'Rad',
      p4: 'Yaw per'
    }),
  RETURN_TO_LAUNCH: mavelous.makeMissionItemType_('RETURN_TO_LAUNCH'),
  LAND: mavelous.makeMissionItemType_('LAND'),
  TAKEOFF: mavelous.makeMissionItemType_(
    'TAKEOFF', {
      z: 'Alt'
    }),
  ROI: mavelous.makeMissionItemType_(
    'ROI', {
      x: 'Lat',
      y: 'Lon',
      z: 'Alt'
    }),
  PATHPLANNING: mavelous.makeMissionItemType_('PATHPLANNING'),
  CONDITION_DELAY: mavelous.makeMissionItemType_(
    'CONDITION_DELAY', {
      p1: 'Time (s)'
    }),
  CONDITION_CHANGE_ALT: mavelous.makeMissionItemType_(
    'CONDITION_CHANGE_ALT', {
      p1: 'Rate (cm/s)',
      z: 'Alt'
    }),
  CONDITION_DISTANCE: mavelous.makeMissionItemType_(
    'CONDITION_DISTANCE', {
      p1: 'Dist (m)'
    }),
  CONDITION_YAW: mavelous.makeMissionItemType_(
    'CONDITION_YAW', {
      p1: 'Deg',
      p2: 'Sec',
      p3: 'Dir (1=CW)',
      p4: 'Rel/abs'
    }),
  DO_SET_MODE: mavelous.makeMissionItemType_('DO_SET_MODE'),
  DO_JUMP: mavelous.makeMissionItemType_(
    'DO_JUMP', {
      p1: 'Missionitem #',
      p2: 'Repeat #'
    }),
  DO_CHANGE_SPEED: mavelous.makeMissionItemType_(
    'DO_CHANGE_SPEED', {
      p1: 'Speed (m/s)'
    }),
  DO_SET_HOME: mavelous.makeMissionItemType_(
    'DO_SET_HOME', {
      p1: 'Current (1)/Spec (0)'
    }),
  DO_SET_PARAMETER: mavelous.makeMissionItemType_(
    'DO_SET_PARAMETER', {
      p1: '#',
      p2: 'Value'
    }),
  DO_SET_RELAY: mavelous.makeMissionItemType_(
    'DO_SET_RELAY', {
      p1: 'Off (0)/on (1)'
    }),
  DO_REPEAT_RELAY: mavelous.makeMissionItemType_(
    'DO_REPEAT_RELAY', {
      p2: 'Repeat #',
      p3: 'Delay (s)'
    }),
  DO_SET_SERVO: mavelous.makeMissionItemType_(
    'DO_SET_SERVO', {
      p1: 'Serial #',
      p2: 'PWM'
    }),
  DO_REPEAT_SERVO: mavelous.makeMissionItemType_(
    'DO_REPEAT_SERVO', {
      p1: 'Serial #',
      p2: 'PWM',
      p3: 'Repeat #',
      p4: 'Delay (s)'
    }),
  DO_DIGICAM_CONFIGURE: mavelous.makeMissionItemType_('DO_DIGICAM_CONFIGURE'),
  DO_DIGICAM_CONTROL: mavelous.makeMissionItemType_('DO_DIGICAM_CONTROL'),
  DO_MOUNT_CONFIGURE: mavelous.makeMissionItemType_('DO_MOUNT_CONFIGURE'),
  DO_MOUNT_CONTROL: mavelous.makeMissionItemType_('DO_MOUNT_CONTROL')
};



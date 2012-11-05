goog.provide('mavelous');
goog.provide('mavelous.Mission');
goog.provide('mavelous.Waypoint');
goog.provide('mavelous.WaypointType');
goog.provide('mavelous.ui');
goog.provide('mavelous.ui.Input');
goog.provide('mavelous.ui.Label');
goog.provide('mavelous.ui.Mission');
goog.provide('mavelous.ui.MissionRenderer');
goog.provide('mavelous.ui.WaypointRenderer');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.ui.BidiInput');
goog.require('goog.ui.Checkbox');
goog.require('goog.ui.Checkbox.State');
goog.require('goog.ui.Container');
goog.require('goog.ui.ContainerRenderer');
goog.require('goog.ui.Control');
goog.require('goog.ui.ControlRenderer');
goog.require('goog.ui.FlatMenuButtonRenderer');
goog.require('goog.ui.Select');
goog.require('goog.ui.registry');


/** @enum {string} */
mavelous.Error = {
  INVALID_WAYPOINT_TYPE: 'Invalid waypoint type',
  INVALID_FIELD_NAME: 'Invalid waypoint field name'
};


/**
 * @param {string} id The ID.
 * @param {mavelous.WaypointType} type The type.
 * @param {object} opt_values Field values.
 * @constructor
 */
mavelous.Waypoint = function(id, type, opt_values) {
  if (!(type in goog.object.transpose(mavelous.WaypointType))) {
    throw Error(mavelous.Error.INVALID_WAYPOINT_TYPE + ' ' + type);
  }
  this.id = id;
  this.type = type;
  this.checked = true;
  this.fieldValues = {};

  var fields = this.getFields();
  for (var i = 0; i < fields.length; i++) {
    this.setFieldValue(fields[i], null);
  }
  for (var fieldName in opt_values) {
    this.setFieldValue(fieldName, opt_values[fieldName]);
  }
};


/**
 * @return {Array.<string>} The field names.
 */
mavelous.Waypoint.prototype.getFields = function() {
  return this.type.fields;
};


mavelous.Waypoint.prototype.getFieldValue = function(fieldName) {
  this.checkFieldName_(fieldName);
  return this.fieldValues[fieldName];
};


mavelous.Waypoint.prototype.setFieldValue = function(fieldName, fieldValue) {
  this.checkFieldName_(fieldName);
  this.fieldValues[fieldName] = fieldValue;
};


mavelous.Waypoint.prototype.checkFieldName_ = function(fieldName) {
  if (!this.type.fields.hasOwnProperty(fieldName)) {
    throw Error(mavelous.Error.INVALID_FIELD_NAME + ' ' + fieldName);
  }
};


mavelous.Waypoint.prototype.getTypeName = function() {
  return this.type.name;
};


/**
 * @param {Array.<mavelous.Waypoint>} items  The items.
 * @constructor
 */
mavelous.Mission = function(items) {
  /**
   * @type {Array.<mavelous.Waypoint>}
   * @private
   */
  this.items_ = goog.array.clone(items);
};

/** @return {Array.<mavelous.Waypoint>} All the items on this list. */
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
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
mavelous.ui.WaypointRenderer = function() {
  goog.base(this);
};
goog.inherits(mavelous.ui.WaypointRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(mavelous.ui.WaypointRenderer);

/** @type {string} */
mavelous.ui.WaypointRenderer.CSS_CLASS = 'mavelous-waypoint';

/** @inheritDoc */
mavelous.ui.WaypointRenderer.prototype.getCssClass = function() {
  return mavelous.ui.WaypointRenderer.CSS_CLASS;
};

/**
 * @param {mavelous.ui.Waypoint} waypoint  The item.
 * @return {Element}  The new UI element.
 */
mavelous.ui.WaypointRenderer.prototype.createDom = function(waypoint) {
  var el = goog.base(this, 'createDom', waypoint);
  // Admittedly, this violates the protected visibility of setElementInternal(),
  // but waypoint needs to have a DOM before its addChild() method can be
  // invoked later in this method.
  waypoint.setElementInternal(el);

  var dom = waypoint.getDomHelper();
  var waypointModel = waypoint.getModel();

  var isItemChecked = waypoint.isItemChecked();
  var checkboxState = isItemChecked ?
      goog.ui.Checkbox.State.CHECKED : goog.ui.Checkbox.State.UNCHECKED;
  var checkbox = new goog.ui.Checkbox(checkboxState, dom);
  waypoint.addChild(checkbox, true /* opt_render */);

  var typeSelect = new goog.ui.Select(
    null, null, goog.ui.FlatMenuButtonRenderer.getInstance(), dom);
  var selectedItem = null;
  for (var waypointType in mavelous.WaypointType) {
    var menuItem = new goog.ui.MenuItem(waypointType);
    typeSelect.addItem(menuItem);
    if (waypointType == waypointModel.getTypeName()) {
      selectedItem = menuItem;
    }
  }
  if (selectedItem) {
    typeSelect.setSelectedItem(selectedItem);
  }
  waypoint.addChild(typeSelect, true);

  for (var fieldName in waypointModel.getFields()) {
    waypoint.addChild(new mavelous.ui.Label(fieldName), true);
    var value = waypointModel.getFieldValue(fieldName);
    var input = new mavelous.ui.Input(value);
    waypoint.addChild(input, true);
  }

  waypoint.setChecked(isItemChecked);

  return el;
};

/**
 * @param {mavelous.ui.Waypoint} waypoint  The item.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 */
mavelous.ui.WaypointRenderer.prototype.decorate = function(
    waypoint, element) {
  console.log('Decorating');
  goog.base(this, 'decorate', waypoint, element);

  var checkbox = new goog.ui.Checkbox();
  waypoint.addChild(checkbox);
  checkbox.decorate(goog.dom.getFirstElementChild(element));
  waypoint.getModel().checked = checkbox.isChecked();

  var label = new mavelous.ui.Label();
  waypoint.addChild(label);
  label.decorate(goog.dom.getNextElementSibling(checkbox.getElement()));
  waypoint.getModel().type = label.getLabelText();

  // Note that the following approach would not have worked because using
  // goog.ui.decorate() creates a checkbox that is already in the document, so
  // it cannot be added to waypoint because it is not in the document yet,
  // as it is in the process of being decorated. In this case, decorate() must
  // be called after addChild(), as demonstrated in the working code earlier.
  //
  // var checkboxEl = goog.dom.getFirstElementChild(element);
  // var checkbox = /** @type {goog.ui.Checkbox} */ goog.ui.decorate(checkboxEl);
  // waypoint.addChild(checkbox);
  // waypoint.getModel().checked = checkbox.isChecked();

  return element;
};


mavelous.makeWaypointType = function(name, opt_fields) {
  return {
    name: name,
    fields: opt_fields || {}
  };
}

/** @enum {Object} */
mavelous.WaypointType = {
  WAYPOINT: mavelous.makeWaypointType(
    'WAYPOINT', {
      p1: 'Delay',
      p2: 'Hit rad',
      p4: 'Yaw ang',
      x: 'Lat',
      y: 'Lon',
      z: 'Alt'
    }),
  LOITER_UNLIM: mavelous.makeWaypointType(
    'LOITER_UNLIM', {
      x: 'Lat',
      y: 'Lat',
      z: 'Alt'
    }),
  LOITER_TURNS: mavelous.makeWaypointType(
    'LOITER_TURNS', {
      p1: 'Turns',
      x: 'Lat',
      y: 'Lon',
      z: 'Alt'
    }),
  LOITER_TIME: mavelous.makeWaypointType(
    'LOITER_TIME', {
      p1: 'Time (s)',
      p3: 'Rad',
      p4: 'Yaw per'
    }),
  RETURN_TO_LAUNCH: mavelous.makeWaypointType('RETURN_TO_LAUNCH'),
  LAND: mavelous.makeWaypointType('LAND'),
  TAKEOFF: mavelous.makeWaypointType(
    'TAKEOFF', {
      z: 'Alt'
    }),
  ROI: mavelous.makeWaypointType(
    'ROI', {
      x: 'Lat',
      y: 'Lon',
      z: 'Alt'
    }),
  PATHPLANNING: mavelous.makeWaypointType('PATHPLANNING'),
  CONDITION_DELAY: mavelous.makeWaypointType(
    'CONDITION_DELAY', {
      p1: 'Time (s)'
    }),
  CONDITION_CHANGE_ALT: mavelous.makeWaypointType(
    'CONDITION_CHANGE_ALT', {
      p1: 'Rate (cm/s)',
      z: 'Alt'
    }),
  CONDITION_DISTANCE: mavelous.makeWaypointType(
    'CONDITION_DISTANCE', {
      p1: 'Dist (m)'
    }),
  CONDITION_YAW: mavelous.makeWaypointType(
    'CONDITION_YAW', {
      p1: 'Deg',
      p2: 'Sec',
      p3: 'Dir (1=CW)',
      p4: 'Rel/abs'
    }),
  DO_SET_MODE: mavelous.makeWaypointType('DO_SET_MODE'),
  DO_JUMP: mavelous.makeWaypointType(
    'DO_JUMP', {
      p1: 'Waypoint #',
      p2: 'Repeat #'
    }),
  DO_CHANGE_SPEED: mavelous.makeWaypointType(
    'DO_CHANGE_SPEED', {
      p1: 'Speed (m/s)'
    }),
  DO_SET_HOME: mavelous.makeWaypointType(
    'DO_SET_HOME', {
      p1: 'Current (1)/Spec (0)'
    }),
  DO_SET_PARAMETER: mavelous.makeWaypointType(
    'DO_SET_PARAMETER', {
      p1: '#',
      p2: 'Value'
    }),
  DO_SET_RELAY: mavelous.makeWaypointType(
    'DO_SET_RELAY', {
      p1: 'Off (0)/on (1)'
    }),
  DO_REPEAT_RELAY: mavelous.makeWaypointType(
    'DO_REPEAT_RELAY', {
      p2: 'Repeat #',
      p3: 'Delay (s)'
    }),
  DO_SET_SERVO: mavelous.makeWaypointType(
    'DO_SET_SERVO', {
      p1: 'Serial #',
      p2: 'PWM'
    }),
  DO_REPEAT_SERVO: mavelous.makeWaypointType(
    'DO_REPEAT_SERVO', {
      p1: 'Serial #',
      p2: 'PWM',
      p3: 'Repeat #',
      p4: 'Delay (s)'
    }),
  DO_DIGICAM_CONFIGURE: mavelous.makeWaypointType('DO_DIGICAM_CONFIGURE'),
  DO_DIGICAM_CONTROL: mavelous.makeWaypointType('DO_DIGICAM_CONTROL'),
  DO_MOUNT_CONFIGURE: mavelous.makeWaypointType('DO_MOUNT_CONFIGURE'),
  DO_MOUNT_CONTROL: mavelous.makeWaypointType('DO_MOUNT_CONTROL')
};


/**
 * A control that displays a ChecklistItem.
 * @param {mavelous.Waypoint=} item The item to display.
 * @param {mavelous.ui.WaypointRenderer=} renderer The renderer to use.
 * @constructor
 * @extends {goog.ui.Control}
 */
mavelous.ui.Waypoint = function(item, renderer) {
  goog.base(this, null /* content */, renderer);
  this.setSupportedState(goog.ui.Component.State.CHECKED, true);
  this.setAutoStates(goog.ui.Component.State.CHECKED, false);
  this.setSupportedState(goog.ui.Component.State.FOCUSED, false);

  if (!item) {
    item = {id: 'temp-' + goog.ui.IdGenerator.getInstance().getNextUniqueId(),
            text: '',
            checked: false};
  }

  this.setModel(item);
};
goog.inherits(mavelous.ui.Waypoint, goog.ui.Control);

/**
 * @return {!mavelous.Waypoint} The model.
 * @override
 */
mavelous.ui.Waypoint.prototype.getModel;


/** @return {boolean} Whether it's checked. */
mavelous.ui.Waypoint.prototype.isItemChecked = function() {
  return this.getModel().checked;
};


/** @inheritDoc */
mavelous.ui.Waypoint.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  var checkbox = this.getChildAt(0);
  this.getHandler().listen(checkbox,
      [goog.ui.Component.EventType.CHECK, goog.ui.Component.EventType.UNCHECK],
      this.onCheckChange_);
};

/**
 * Update the internal ChecklistItem when the checked state of the checkbox
 * changes.
 * @param {goog.events.Event} e The event.
 * @private
 */
mavelous.ui.Waypoint.prototype.onCheckChange_ = function(e) {
  var isChecked = (e.type == goog.ui.Component.EventType.CHECK);
  this.getModel().checked = isChecked;
  this.setChecked(isChecked);
};

goog.ui.registry.setDefaultRenderer(mavelous.ui.Waypoint,
    mavelous.ui.WaypointRenderer);

goog.ui.registry.setDecoratorByClassName(
  mavelous.ui.WaypointRenderer.CSS_CLASS,
  function() { return new mavelous.ui.Waypoint(); });


/**
 * This is a simple component that displays some inline text.
 * @param {string=} labelText The label text.
 * @constructor
 * @extends {goog.ui.Component}
 */
mavelous.ui.Label = function(labelText) {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.labelText_ = goog.isDef(labelText) ? labelText : '';
};
goog.inherits(mavelous.ui.Label, goog.ui.Component);

mavelous.ui.Label.CSS_CLASS = 'example-label';

/** @return {string} */
mavelous.ui.Label.prototype.getLabelText = function() {
  return this.labelText_;
};

/** @inheritDoc */
mavelous.ui.Label.prototype.createDom = function() {
  var el = this.dom_.createDom('span',
                               undefined /* opt_attributes */,
                               this.labelText_);
  this.decorateInternal(el);
};

/** @inheritDoc */
mavelous.ui.Label.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
  this.labelText_ = element.firstChild.nodeValue;
  goog.dom.classes.add(element, mavelous.ui.Label.CSS_CLASS);
};


/**
 * @constructor
 * @extends {goog.ui.BidiInput}
 */
mavelous.ui.Input = function(value) {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.value_ = goog.isDef(value) ? value : '';
};
goog.inherits(mavelous.ui.Input, goog.ui.BidiInput);

/** @inheritDoc */
mavelous.ui.Input.prototype.createDom = function() {
  this.setElementInternal(
    this.getDomHelper().createDom('input', {'type': 'text', 'value': this.value_}));
  this.init_();
};


/**
 * @constructor
 * @extends {goog.ui.ContainerRenderer}
 */
mavelous.ui.MissionRenderer = function() {
  goog.base(this);
};
goog.inherits(mavelous.ui.MissionRenderer, goog.ui.ContainerRenderer);
goog.addSingletonGetter(mavelous.ui.MissionRenderer);

/** @type {string} */
mavelous.ui.MissionRenderer.CSS_CLASS = 'mavelous-mission';

/** @inheritDoc */
mavelous.ui.MissionRenderer.prototype.getCssClass = function() {
  return mavelous.ui.MissionRenderer.CSS_CLASS;
};

/**
 * @param {mavelous.ui.Mission} checklistContainer The container.
 * @return {Element} The new element.
 */
mavelous.ui.MissionRenderer.prototype.createDom = function(checklistContainer) {
  var el = goog.base(this, 'createDom', checklistContainer);
  checklistContainer.setElementInternal(el);

  var checklist = checklistContainer.getModel();
  var items = checklist.getItems();
  goog.array.forEach(items, function(item) {
    var control = new mavelous.ui.Waypoint(item);
    checklistContainer.addChild(control, true /* opt_render */);
  });

  return el;
};

/**
 * @param {mavelous.ui.Mission} checklistContainer
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 */
mavelous.ui.MissionRenderer.prototype.decorate = function(
    checklistContainer, element) {
  console.log('Decorating');
  goog.base(this, 'decorate', checklistContainer, element);

  var items = [];
  checklistContainer.forEachChild(function(child) {
    items.push((/** @type {mavelous.ui.Waypoint} */ (child)).getModel());
  });
  var checklist = new mavelous.Mission(items);
  checklistContainer.setModel(checklist);

  return element;
};


/**
 * @param {mavelous.Mission=} checklist
 * @constructor
 * @extends {goog.ui.Container}
 */
mavelous.ui.Mission = function(checklist) {
  goog.base(this, goog.ui.Container.Orientation.VERTICAL,
      mavelous.ui.MissionRenderer.getInstance());
  this.setModel(checklist || null);
  this.setFocusable(false);
};
goog.inherits(mavelous.ui.Mission, goog.ui.Container);

/**
 * @return {mavelous.Mission}
 * @override
 */
mavelous.ui.Mission.prototype.getModel;

/** @inheritDoc */
mavelous.ui.Mission.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this,
      [goog.ui.Component.EventType.CHECK, goog.ui.Component.EventType.UNCHECK],
      this.onCheckChange_);
};

/**
 * @param {goog.events.Event} e
 * @private
 */
mavelous.ui.Mission.prototype.onCheckChange_ = function(e) {
  // The mavelous.ui.Mission class chooses to keep CHECK and UNCHECK events to
  // itself by preventing such events from bubbling upward. Instead, it expects
  // clients to listen to its custom CHECKED_COUNT_CHANGED events for updates.
  e.stopPropagation();
  this.dispatchEvent(new goog.events.Event(
      mavelous.ui.Mission.EventType.CHECKED_COUNT_CHANGED, this));
};


/** @enum {string} */
mavelous.ui.Mission.EventType = {
  CHECKED_COUNT_CHANGED: goog.events.getUniqueId('checked-count-changed')
};

goog.ui.registry.setDefaultRenderer(mavelous.ui.Mission,
    mavelous.ui.MissionRenderer);

goog.ui.registry.setDecoratorByClassName(mavelous.ui.MissionRenderer.CSS_CLASS,
    function() { return new mavelous.ui.Mission(); })


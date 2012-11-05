goog.provide('mavelous.ui');
goog.provide('mavelous.ui.Input');
goog.provide('mavelous.ui.Label');
goog.provide('mavelous.ui.Mission');
goog.provide('mavelous.ui.MissionItemRenderer');
goog.provide('mavelous.ui.MissionRenderer');

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

goog.require('mavelous.Mission');
goog.require('mavelous.MissionItem');
goog.require('mavelous.MissionItemType');

/**
 * @constructor
 * @extends {goog.ui.ControlRenderer}
 */
mavelous.ui.MissionItemRenderer = function() {
  goog.base(this);
};
goog.inherits(mavelous.ui.MissionItemRenderer, goog.ui.ControlRenderer);
goog.addSingletonGetter(mavelous.ui.MissionItemRenderer);

/** @type {string} */
mavelous.ui.MissionItemRenderer.CSS_CLASS = 'mavelous-missionitem';

/** @inheritDoc */
mavelous.ui.MissionItemRenderer.prototype.getCssClass = function() {
  return mavelous.ui.MissionItemRenderer.CSS_CLASS;
};

/**
 * @param {mavelous.ui.MissionItem} missionItem  The item.
 * @return {Element}  The new UI element.
 */
mavelous.ui.MissionItemRenderer.prototype.createDom = function(missionItem) {
  var el = goog.base(this, 'createDom', missionItem);
  // Admittedly, this violates the protected visibility of setElementInternal(),
  // but missionItem needs to have a DOM before its addChild() method can be
  // invoked later in this method.
  missionItem.setElementInternal(el);

  var dom = missionItem.getDomHelper();
  var missionItemModel = missionItem.getModel();

  var isItemChecked = missionItem.isItemChecked();
  var checkboxState = isItemChecked ?
      goog.ui.Checkbox.State.CHECKED : goog.ui.Checkbox.State.UNCHECKED;
  var checkbox = new goog.ui.Checkbox(checkboxState, dom);
  missionItem.addChild(checkbox, true /* opt_render */);

  var typeSelect = new goog.ui.Select(
    null, null, goog.ui.FlatMenuButtonRenderer.getInstance(), dom);
  var selectedItem = null;
  for (var missionItemType in mavelous.MissionItemType) {
    var menuItem = new goog.ui.MenuItem(missionItemType);
    typeSelect.addItem(menuItem);
    if (missionItemType == missionItemModel.getTypeName()) {
      selectedItem = menuItem;
    }
  }
  if (selectedItem) {
    typeSelect.setSelectedItem(selectedItem);
  }
  missionItem.addChild(typeSelect, true);

  for (var field in missionItemModel.getFields()) {
    var displayName = mavelous.missionItemFieldDisplayName(missionItemModel.getTypeName(), field);
    missionItem.addChild(new mavelous.ui.Label(displayName), true);
    var value = missionItemModel.getFieldValue(field);
    var input = new mavelous.ui.Input(value);
    missionItem.addChild(input, true);
  }

  missionItem.setChecked(isItemChecked);

  return el;
};

/**
 * @param {mavelous.ui.MissionItem} missionItem  The item.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 */
mavelous.ui.MissionItemRenderer.prototype.decorate = function(
    missionItem, element) {
  goog.base(this, 'decorate', missionItem, element);

  var checkbox = new goog.ui.Checkbox();
  missionItem.addChild(checkbox);
  checkbox.decorate(goog.dom.getFirstElementChild(element));
  missionItem.getModel().checked = checkbox.isChecked();

  var label = new mavelous.ui.Label();
  missionItem.addChild(label);
  label.decorate(goog.dom.getNextElementSibling(checkbox.getElement()));
  missionItem.getModel().type = label.getLabelText();

  // Note that the following approach would not have worked because using
  // goog.ui.decorate() creates a checkbox that is already in the document, so
  // it cannot be added to missioniTem because it is not in the document yet,
  // as it is in the process of being decorated. In this case, decorate() must
  // be called after addChild(), as demonstrated in the working code earlier.
  //
  // var checkboxEl = goog.dom.getFirstElementChild(element);
  // var checkbox = /** @type {goog.ui.Checkbox} */ goog.ui.decorate(checkboxEl);
  // missionItem.addChild(checkbox);
  // missionItem.getModel().checked = checkbox.isChecked();

  return element;
};


/**
 * A control that displays a MissionItem.
 * @param {mavelous.MissionItem} item The item to display.
 * @param {mavelous.ui.MissionitemRenderer} renderer The renderer to use.
 * @constructor
 * @extends {goog.ui.Control}
 */
mavelous.ui.MissionItem = function(item, renderer) {
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
goog.inherits(mavelous.ui.MissionItem, goog.ui.Control);

/**
 * @return {!mavelous.MissionItem} The model.
 * @override
 */
mavelous.ui.MissionItem.prototype.getModel;


/** @return {boolean} Whether it's checked. */
mavelous.ui.MissionItem.prototype.isItemChecked = function() {
  return this.getModel().checked;
};


/** @inheritDoc */
mavelous.ui.MissionItem.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  var checkbox = this.getChildAt(0);
  this.getHandler().listen(checkbox,
      [goog.ui.Component.EventType.CHECK, goog.ui.Component.EventType.UNCHECK],
      this.onCheckChange_);
};

/**
 * Update the internal MissionItem when the checked state of the checkbox
 * changes.
 * @param {goog.events.Event} e The event.
 * @private
 */
mavelous.ui.MissionItem.prototype.onCheckChange_ = function(e) {
  var isChecked = (e.type == goog.ui.Component.EventType.CHECK);
  this.getModel().checked = isChecked;
  this.setChecked(isChecked);
};

goog.ui.registry.setDefaultRenderer(mavelous.ui.MissionItem,
    mavelous.ui.MissionItemRenderer);

goog.ui.registry.setDecoratorByClassName(
  mavelous.ui.MissionItemRenderer.CSS_CLASS,
  function() { return new mavelous.ui.MissionItem(); });


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
 * @param {mavelous.ui.Mission} missionContainer The container.
 * @return {Element} The new element.
 */
mavelous.ui.MissionRenderer.prototype.createDom = function(missionContainer) {
  var el = goog.base(this, 'createDom', missionContainer);
  missionContainer.setElementInternal(el);

  var mission = missionContainer.getModel();
  var items = mission.getItems();
  goog.array.forEach(items, function(item) {
    var control = new mavelous.ui.MissionItem(item);
    missionContainer.addChild(control, true /* opt_render */);
  });

  return el;
};

/**
 * @param {mavelous.ui.Mission} missionContainer
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 */
mavelous.ui.MissionRenderer.prototype.decorate = function(
    missionContainer, element) {
  console.log('Decorating');
  goog.base(this, 'decorate', missionContainer, element);

  var items = [];
  missionContainer.forEachChild(function(child) {
    items.push((/** @type {mavelous.ui.MissionItem} */ (child)).getModel());
  });
  var mission = new mavelous.Mission(items);
  missionContainer.setModel(mission);

  return element;
};


/**
 * @param {mavelous.Mission} mission
 * @constructor
 * @extends {goog.ui.Container}
 */
mavelous.ui.Mission = function(mission) {
  goog.base(this, goog.ui.Container.Orientation.VERTICAL,
      mavelous.ui.MissionRenderer.getInstance());
  this.setModel(mission || null);
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

goog.ui.registry.setDefaultRenderer(
  mavelous.ui.Mission,
  mavelous.ui.MissionRenderer);

goog.ui.registry.setDecoratorByClassName(
  mavelous.ui.MissionRenderer.CSS_CLASS,
  function() { return new mavelous.ui.Mission(); });



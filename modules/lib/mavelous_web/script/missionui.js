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


/**
 * @return {string} The CSS class name.
 * @override
 * @export
 */
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
  goog.dom.classes.add(checkbox.getElement(), 'mavelous-missionitem-field');

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
  goog.events.listen(
      typeSelect, goog.ui.Component.EventType.ACTION,
      function(e) {
        this.changeMissionItemType(e.target.getValue());
      },
      false,
      missionItem);
  if (selectedItem) {
    typeSelect.setSelectedItem(selectedItem);
  }
  missionItem.addChild(typeSelect, true);
  goog.dom.classes.add(typeSelect.getElement(), 'mavelous-missionitem-field');
  this.populateFields(missionItem);
  missionItem.setChecked(isItemChecked);
  return el;
};


/**
 * @param {mavelous.MissionItem} missionItem The mission item.
 */
mavelous.ui.MissionItemRenderer.prototype.populateFields =
    function(missionItem) {
  var missionItemModel = missionItem.getModel();
  for (var field in missionItemModel.getFields()) {
    var displayName = mavelous.missionItemFieldDisplayName(
        missionItemModel.getTypeName(), field);
    if (!goog.isNull(displayName)) {
      var label = new mavelous.ui.Label(displayName);
      missionItem.addChild(label, true);
      goog.dom.classes.add(label.getElement(), 'mavelous-missionitem-field');
      var value = missionItemModel.getFieldValue(field);
      var input = new mavelous.ui.Input(value);
      missionItem.addChild(input, true);
      input.setSupportedState(goog.ui.Component.State.FOCUSED, true);
      goog.dom.classes.add(input.getElement(), 'mavelous-missionitem-field');
      missionItem.addField(label);
      missionItem.addField(input);
    }
  }

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
  missionItem.getModel().setType(label.getLabelText());

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
  //this.setSupportedState(goog.ui.Component.State.CHECKED, true);
  //this.setAutoStates(goog.ui.Component.State.CHECKED, false);
  //this.setSupportedState(goog.ui.Component.State.FOCUSED, false);

  if (!item) {
    item = {id: 'temp-' + goog.ui.IdGenerator.getInstance().getNextUniqueId(),
      text: '',
      checked: false};
  }
  this.fields = [];
  this.setModel(item);
};
goog.inherits(mavelous.ui.MissionItem, goog.ui.Control);


/**
 * @return {!mavelous.MissionItem} The model.
 * @override
 * @export
 */
mavelous.ui.MissionItem.prototype.getModel;


/**
 * @param {goog.ui.Control} field The field control to add.
 */
mavelous.ui.MissionItem.prototype.addField = function(field) {
  this.fields.push(field);
};


/**
 * @param {mavelous.MissionItemType} itemType The mission item type.
 */
mavelous.ui.MissionItem.prototype.changeMissionItemType = function(itemType) {
  this.getModel().setType(mavelous.MissionItemType[itemType]);
  for (var i = 0; i < this.fields.length; i++) {
    this.removeChild(this.fields[i], false);
    this.fields[i].dispose();
  }
  goog.array.clear(this.fields);
  this.getRenderer().populateFields(this);
};


/** @return {boolean} Whether it's checked. */
mavelous.ui.MissionItem.prototype.isItemChecked = function() {
  return this.getModel().checked;
};


/**
 * @override
 * @export
 */

mavelous.ui.MissionItem.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  var checkbox = this.getChildAt(0);
  this.getHandler().listen(checkbox,
      [goog.ui.Component.EventType.CHECK, goog.ui.Component.EventType.UNCHECK],
      this.onCheckChange_);
  this.setAllowTextSelection(true);
};

/**
 * Update the internal MissionItem when the checked state of the checkbox
 * changes.
 * @param {goog.events.Event} e The event.
 * @private
 */
// mavelous.ui.MissionItem.prototype.onCheckChange_ = function(e) {
//   var isChecked = (e.type == goog.ui.Component.EventType.CHECK);
//   this.getModel().checked = isChecked;
//   this.setChecked(isChecked);
// };

goog.ui.registry.setDefaultRenderer(mavelous.ui.MissionItem,
    mavelous.ui.MissionItemRenderer);

goog.ui.registry.setDecoratorByClassName(
    mavelous.ui.MissionItemRenderer.CSS_CLASS,
    function() { return new mavelous.ui.MissionItem(); });



/**
 * This is a simple component that displays some inline text.
 * @param {string=} opt_labelText The label text.
 * @constructor
 * @extends {goog.ui.Component}
 */
mavelous.ui.Label = function(opt_labelText) {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.labelText_ = goog.isDef(opt_labelText) ? opt_labelText : '';
};
goog.inherits(mavelous.ui.Label, goog.ui.Component);


/** @type {string} */
mavelous.ui.Label.CSS_CLASS = 'example-label';


/** @return {string} The label text.*/
mavelous.ui.Label.prototype.getLabelText = function() {
  return this.labelText_;
};


/** @export */
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
 * @param {string} value The initial value.
 * @constructor
 * @extends {goog.ui.Control}
 */
mavelous.ui.Input = function(value) {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.value_ = goog.isDef(value) ? value : '';
};
goog.inherits(mavelous.ui.Input, goog.ui.Control);


/** @inheritDoc */
mavelous.ui.Input.prototype.createDom = function() {
  this.setElementInternal(
      this.getDomHelper().createDom(
          'input',
          {
            'type': 'text',
            'size': '5',
            'value': this.value_
          }));
  goog.style.setUnselectable(this.getElement(), false, true);
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
 * @param {mavelous.ui.Mission} missionContainer The container.
 * @param {Element} element Element to decorate.
 * @return {Element} Decorated element.
 */
mavelous.ui.MissionRenderer.prototype.decorate = function(
    missionContainer, element) {
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
 * @inheritDoc
 */
goog.ui.ContainerRenderer.prototype.initializeDom = function(container) {
  var elem = container.getElement();

  // IE doesn't support outline:none, so we have to use the hideFocus property.
  if (goog.userAgent.IE) {
    elem.hideFocus = true;
  }

  // Set the ARIA role.
  var ariaRole = this.getAriaRole();
  if (ariaRole) {
    goog.dom.a11y.setRole(elem, ariaRole);
  }
};



/**
 * @param {mavelous.Mission} mission The mission.
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
 * @return {mavelous.Mission} The model.
 * @override
 * @export
 */
mavelous.ui.Mission.prototype.getModel;


/** @inheritDoc */
mavelous.ui.Mission.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  //goog.style.setUnselectable(this.getElement(), true, false);
};


/** @enum {string} */
// mavelous.ui.Mission.EventType = {
//   CHECKED_COUNT_CHANGED: goog.events.getUniqueId('checked-count-changed')
// };

goog.ui.registry.setDefaultRenderer(
    mavelous.ui.Mission,
    mavelous.ui.MissionRenderer);

goog.ui.registry.setDecoratorByClassName(
    mavelous.ui.MissionRenderer.CSS_CLASS,
    function() { return new mavelous.ui.Mission(); });

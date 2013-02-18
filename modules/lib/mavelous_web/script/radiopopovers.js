goog.provide('Mavelous.RadioButtonPopoverView');
goog.provide('Mavelous.SelectedModel');


/**
 * A simple selection model.
 * @param {{selected: boolean}=} opt_properties Model properties.
 * @constructor
 * @extends {Backbone.Model}
 */
Mavelous.SelectedModel = function(opt_properties) {
  goog.base(this, opt_properties);
};
goog.inherits(Mavelous.SelectedModel, Backbone.Model);


/**
 * @override
 * @export
 */
Mavelous.SelectedModel.prototype.defaults = function() {
  return {
    'selected': false
  };
};


/**
 * Select.
 */
Mavelous.SelectedModel.prototype.select = function() {
  this.set('selected', true);
};


/**
 * Deselect.
 */
Mavelous.SelectedModel.prototype.deselect = function() {
  this.set('selected', false);
};



/**
 * A radio button popover view.
 * @param {Object} properties View properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.RadioButtonPopoverView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.RadioButtonPopoverView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.RadioButtonPopoverView.prototype.initialize = function() {
  this.popovers = this.options['popovers'];
};


/**
 * Setup a button to be backed by a selection model.
 *
 * @param {Object} btn button.
 * @param {number} index beep.
 * @return {Mavelous.SelectedModel} The new model.
 * @private
 */
Mavelous.RadioButtonPopoverView.prototype.registerButton_ = function(
    btn, index) {
  var mdl = new Mavelous.SelectedModel();
  mdl.set('index', index);
  btn.$el.click(goog.bind(this.onButtonClick_, this, index));
  btn.selectedModel = mdl;
  mdl.bind('change', btn.onSelectedChange, btn);
  return mdl;
};


/**
 * Handles button clicks.
 * @param {number} btnindex The button index.
 * @private
 */
Mavelous.RadioButtonPopoverView.prototype.onButtonClick_ = function(btnindex) {
  window.console.log('radio button click ' + btnindex.toString());
  var selected = this.buttons[btnindex].get('selected');
  if (selected) {
    /* Unset this button - no buttons are selected. */
    this.buttons[btnindex].deselect();
    window.console.log('btn deselect ' + btnindex.toString());
  } else {
    /* Unset all of the other buttons, then set this one. */
    _.each(this.buttons,
           function(b) {
             if (b.get('selected')) {
               var idx = b.get('index');
               b.deselect();
               window.console.log('btn deselect ' + idx.toString());
              }
           });
    this.buttons[btnindex].select();
    window.console.log('btn select ' + btnindex.toString());
  }
};



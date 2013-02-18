goog.provide('Mavelous.PopoverView');
goog.provide('Mavelous.SelectionModel');


/**
 * A simple selection model.
 * @param {{selected: boolean}=} opt_properties Model properties.
 * @constructor
 * @extends {Backbone.Model}
 */
Mavelous.SelectionModel = function(opt_properties) {
  goog.base(this, opt_properties);
};
goog.inherits(Mavelous.SelectionModel, Backbone.Model);


/**
 * @override
 * @export
 */
Mavelous.SelectionModel.prototype.defaults = function() {
  return {
    'selected': false
  };
};


/**
 * popover Backbone view.
 * @param {Object} properties The view properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.PopoverView = function(properties) {
  this.template = '<div class="popover"><div class="arrow"></div>' +
        '<div class="popover-inner"><h3 class="popover-title"></h3>' +
        '<div class="popover-content"><p></p></div></div></div>';
  goog.base(this, properties);
};
goog.inherits(Mavelous.PopoverView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.PopoverView.prototype.initialize = function() {
  this.$el = null;
  this.btn = this.options['btn'];
  this.placement = this.options['placement'] || 'bottom';
  this.delegate = this.options['delegate'];
  this.selectionModel = new Mavelous.SelectionModel();
  this.radioBtnController = this.options['radioBtnController'];

  this.selectionModel.bind('change', this.onSelectionChange_, this);
  this.btn.$el.click(
      goog.bind(this.radioBtnController.onButtonClick,
                this.radioBtnController, this));
};

Mavelous.PopoverView.prototype.select = function () {
  this.selectionModel.set('selected', true);
};

Mavelous.PopoverView.prototype.deselect = function () {
  this.selectionModel.set('selected', false);
};

Mavelous.PopoverView.prototype.selected = function () {
  return this.selectionModel.get('selected');
};
/**
 * Handles selection change.
 */
Mavelous.PopoverView.prototype.onSelectionChange_ = function() {
  if (this.selectionModel.get('selected')) {
    this.createElement();
    var inner = this.$el.find('.popover-inner');
    this.delegate.popoverCreated(inner);
  } else {
    this.delegate.popoverDestroyed();
    this.destroyElement();
  }
};

Mavelous.PopoverView.prototype.createElement= function () {
  this.$el = $(this.template);
  this.$el.removeClass('fade top bottom left right in');
  this.$el
    .remove()
    .css({ top: 0, left: 0, display: 'block' })
    .appendTo(document.body);

  this.$el
    .css(this.placementStyle(this.placement))
    .addClass(this.placement)
    .addClass('in');
};

Mavelous.PopoverView.prototype.placementStyle = function (placement) {
  var pos = $.extend({}, this.btn.$el.offset(),
      { width: this.btn.$el[0].offsetWidth,
        height: this.btn.$el[0].offsetHeight
      });
  var actualWidth = this.$el[0].offsetWidth;
  var actualHeight = this.$el[0].offsetHeight;
  switch (placement) {
    case 'bottom':
      return {top: pos.top + pos.height,
        left: pos.left + pos.width / 2 - actualWidth / 2};
    case 'top':
      return {top: pos.top - actualHeight,
        left: pos.left + pos.width / 2 - actualWidth / 2};
    case 'left':
      return {top: pos.top + pos.height / 2 - actualHeight / 2,
        left: pos.left - actualWidth};
    case 'right':
      return {top: pos.top + pos.height / 2 - actualHeight / 2,
        left: pos.left + pos.width};
  }
};

Mavelous.PopoverView.prototype.destroyElement = function () {
  if (this.$el) {
    this.$el.remove();
  }
};

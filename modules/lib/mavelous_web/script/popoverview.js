goog.provide('Mavelous.PopoverView');

/**
 * Primary flight display Backbone view.
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
  this.btn = this.options['btn'];
  this.placement = this.options['placement'] || 'bottom';
  this.delegate = this.options['delegate'];
  this.selectionModel = this.options['selectionModel'];
};


/**
 * Handles selection change.
 */
Mavelous.PopoverView.prototype.onSelectedChange = function() {
  if (this.selectedModel.get('selected')) {
    this.trigger('selected', true);
  } else {
    this.$el.popover('hide');
  }
};

Mavelous.PopoverView.prototype.content = function(c) {
  if (this.selectedModel.get('selected')) {
    this.$el.popover('show', c);
  }
};

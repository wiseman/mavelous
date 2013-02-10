goog.provide('Mavelous.PopoverView');

/**
 * Primary flight display Backbone view.
 * @param {Object} properties The view properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.PopoverView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.PopoverView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.PopoverView.prototype.initialize = function() {
  this.parentel = this.options['button'].$el;
};


/**
 * @override
 * @export
 */
Mavelous.PopoverView.prototype.initialize = function() {
  _.extend(this, Backbone.Events);
  this.$el = this.options['button'].$el;
  var t = this.options['button'].popoverTitle;
  if (typeof t == 'undefined') t = 'need a popoverTitle in button view!';
  this.$el.popover({
    'animation': false,
    'placement': 'bottom',
    'title': t,
    'trigger': 'manual'
  });
  this.on('content', this.onContent, this);
  this.options['button'].registerPopover(this);
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
    this.$el.popover('show', function(e) {
      (e.find('.popover-content > *')).html(c);
    });
  }
};

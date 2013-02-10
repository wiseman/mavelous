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


/**
 * Handles new HTML content.
 * @param {string} c The new HTML.
 */
Mavelous.PopoverView.prototype.onContent = function(c) {
  if (this.selectedModel.get('selected')) {
    this.$el.popover('show', function(pel) {
      pel.find('.popover-content > *').html(c);
    });
  }
};


Mavelous.PopoverView.prototype.element = function(k) {
  if (this.selectedModel.get('selected')) {
    this.$el.popover('show', k);
  }
};


Mavelous.PopoverView.prototype.content = function(k) {
  this.element(function(e) { k(e.find('.popover-content > *')); });
};

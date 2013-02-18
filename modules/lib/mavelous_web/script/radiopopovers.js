goog.provide('Mavelous.RadioButtonPopoverView');


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
  /* create child views with the given prototypes and this object as
   * the parent controller. children will connect their click handlers
   * to onButtonClick in initialize. */
  var prototypes = this.options['popovers'];
  var self = this;
  this.popoverViews = goog.array.map(prototypes, function (proto) {
    goog.object.extend(proto, {'radioBtnController': self });
    return new Mavelous.PopoverView(proto);
  });
};

/**
 * Handles button clicks.
 * @param {number} btnindex The button index.
 * @private
 */
Mavelous.RadioButtonPopoverView.prototype.onButtonClick = function( clickedview ) {
  var selected = clickedview.selected();
  if (selected) {
    /* delselect this popover */
    clickedview.deselect();
  } else {
    /* deselect other popovers, then select this one. */
    goog.array.map(this.popoverViews, function(childview) {
      if (childview.selected()) {
        childview.deselect();
       }
    });
    clickedview.select();
  }
};



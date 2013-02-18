goog.provide('Mavelous.CommStatusPopoverViewDelegate');

/**
 * Communication status popover Backbone view.
 * @param {Object} properties The view properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.CommStatusPopoverViewDelegate = function(properties) {
  this.popoverTitle = 'Link Info';
  this.$el = null;
  goog.base(this, properties);
};
goog.inherits(Mavelous.CommStatusPopoverViewDelegate, Backbone.View);

Mavelous.CommStatusPopoverViewDelegate.prototype.initialize = function() {
  this.packetLossModel = this.options['packetLossModel'];
  this.packetLossModel.bind('change', this.render, this);
};

Mavelous.CommStatusPopoverViewDelegate.prototype.popoverCreated = function(el) {
  this.$el = el;
  this.$el.find('.popover-title').text(this.popoverTitle);
  this.render();
};

Mavelous.CommStatusPopoverViewDelegate.prototype.popoverDestroyed = function() {
  this.$el = null;
};

/**
 * Renders the popover.
 */
Mavelous.CommStatusPopoverViewDelegate.prototype.render = function() {
  if (this.$el) {
    var delta = this.packetLossModel.getDelta();
    var c = this.packetLossString_(delta);
    this.$el.find('.popover-content').html(c);
  }
};

/**
 * @param {Object} stats Communications stats.
 * @return {string} A text description of the communications stats.
 * @private
 */
Mavelous.CommStatusPopoverViewDelegate.prototype.packetLossString_ = function(stats) {
  return ('In last ' + stats.period + 's, ' +
          stats.master_in + ' packets received, ' +
          stats.master_out + ' sent, ' + stats.mav_loss + ' lost');
};


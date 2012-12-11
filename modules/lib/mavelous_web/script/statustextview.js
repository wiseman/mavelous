goog.provide('Mavelous.StatustextView');



/**
 * Displays STATUSTEXT messages.
 * @param {{text: {String}}} attrs The model attributes.
 * @constructor
 */
Mavelous.StatustextView = function(attrs) {
  goog.base(this, attrs);
};
goog.inherits(Mavelous.MavlinkMessage, Backbone.Model);


/**
 * @inheritDoc
 */
Mavelous.StatustextView.prototype.initialize = function() {
  var mavlinkSrc = this.options.mavlinkSrc;
  /** @type {!jQuery} */
  this.$el = $('#statustextview');
  /** @type {Mavelous.MavlinkMessage} */
  this.statusText = mavlinkSrc.subscribe('STATUSTEXT',
                                         this.onStatusTextChange, this);
  this.onStatusTextChange();
};


/**
 * Updates status text.
 */
Mavelous.onStatusTextChange.prototype.onStatusTextChange = function() {
  clearTimeout(this.timeout);
  var el = this.$el;
  el.html(this.statusText.get('text'));
  el.css('padding', 10);
  this.timeout = setTimeout(function() {
    el.html('');
    el.css('padding', 0);
  }, 4000);
};

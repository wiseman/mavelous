goog.provide('Mavelous.StatustextView');



/**
 * Displays STATUSTEXT messages.
 * @param {{mavlinkSrc: Mavelous.MavlinkAPI}} attrs The model attributes.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.StatustextView = function(attrs) {
  goog.base(this, attrs);
};
goog.inherits(Mavelous.StatustextView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.StatustextView.prototype.initialize = function() {
  var mavlinkSrc = this.options['mavlinkSrc'];
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
Mavelous.StatustextView.prototype.onStatusTextChange = function() {
  clearTimeout(this.timeout);
  var el = this.$el;
  el.html(this.statusText.get('text'));
  el.css('padding', 10);
  this.timeout = setTimeout(function() {
    el.html('');
    el.css('padding', 0);
  }, 4000);
};

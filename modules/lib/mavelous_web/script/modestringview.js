goog.provide('Mavelous.ModeStringView');

goog.require('Mavelous.util');



/**
 * Displays the vehicle armed/disarmed mode.
 * @param {Object} properties The view properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.ModeStringView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.ModeStringView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.ModeStringView.prototype.initialize = function() {
  var mavlinkSrc = this.options['mavlinkSrc'];
  this.$el = this.options['el'];
  this.heartbeat = mavlinkSrc.subscribe('HEARTBEAT',
                                        this.onHeartbeat, this);
};


/**
 * Handles HEARTBEAT messages.
 */
Mavelous.ModeStringView.prototype.onHeartbeat = function() {
  var modestring = Mavelous.util.heartbeat.modestring(this.heartbeat);
  var armed = Mavelous.util.heartbeat.armed(this.heartbeat);
  if (modestring) {
    if (armed) {
      modestring += ' <span class="ok">ARMED</span>';
    } else {
      modestring += ' <span class="slow">DISARMED</span>';
    }
    this.$el.html(modestring);
  }
};

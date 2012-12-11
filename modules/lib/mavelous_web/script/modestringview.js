goog.provide('Mavelous.ModeStringView');

goog.require('Mavelous.util');



/**
 * Displays the vehicle armed/disarmed mode.
 * @constructor
 */
Mavelous.ModeStringView = Backbone.View.extend({

  initialize: function() {
    var mavlinkSrc = this.options.mavlinkSrc;
    this.$el = this.options.el;
    this.heartbeat = mavlinkSrc.subscribe('HEARTBEAT',
                                          this.onHeartbeat, this);
  },

  onHeartbeat: function() {
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
  }

});

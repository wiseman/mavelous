
$(function () {
  window.ModeStringView = Backbone.View.extend({
  
    initialize: function () {
      var mavlinkSrc = this.options.mavlinkSrc;
      this.$el = $('#modestringview');
      this.heartbeat = mavlinkSrc.subscribe('HEARTBEAT',
                            this.onHeartbeat , this);
    },

    onHeartbeat : function () {
      var modestring = mavlinkModestring(this.heartbeat);
      if (modestring) {
        this.$el.html(modestring);
      }
    },

  });
});

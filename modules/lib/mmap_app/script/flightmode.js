
$(function () {
  window.Mavelous = window.Mavelous || {};

  Mavelous.FlightModeButtonView = Backbone.View.extend({

    initialize: function () {
      var mavlinkSrc = this.options.mavlinkSrc;
      this.$el = this.options.el;
      this.heartbeat = mavlinkSrc.subscribe('HEARTBEAT',
                            this.onHeartbeat , this);
    },

    registerPopover: function (p) {
      this.popover = p;
      this.popover.on('selected', this.popoverRender, this);
    },

    onHeartbeat : function () {
      var modestring = mavutil.heartbeat.modestring(this.heartbeat);
      var armed = mavutil.heartbeat.armed(this.heartbeat);
      if (modestring) {
        this.$el.removeClass('btn-success btn-warning');
        if (armed) {
          this.$el.addClass('btn-success');
        } else {
          this.$el.addClass('btn-warning');
        }
        this.$el.html(modestring);
      }
    },

    popoverRender: function () {
      var loiter = 
        '<a class="btn" id="flightmode-btn-loiter" href="#">Loiter</a>';
      var rtl =
        '<a class="btn" id="flightmode-btn-rtl" href="#">RTL</a>';
      var arm = 
        '<a class="btn" id="flightmode-btn-arm" href="#">Arm</a>';
      if (this.popover) {
        // disable temporarily - this content is not useful.
        // this.popover.trigger('content', loiter + rtl + arm);
      }
    }
  });
});

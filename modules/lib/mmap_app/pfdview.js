
$(function(){
  window.Mavelous = window.Mavelous || {};
  
  Mavelous.PFDView = Backbone.View.extend({

    pfd: null,

    initialize: function() {
      var mavlinkSrc = this.options.mavlinkSrc;

      // Too bad backbone doesn't pass the model to event handlers; we
      // wouldn't need to keep these handles to models.
      this.attitude = mavlinkSrc.subscribe('ATTITUDE', this.onAttitudeChange, this);
      this.vfrHud = mavlinkSrc.subscribe('VFR_HUD', this.onVfrHudChange, this);
      this.navControllerOutput = mavlinkSrc.subscribe(
        'NAV_CONTROLLER_OUTPUT', this.onNavControllerOutputChange, this);

      /* Create pfd object */
      this.pfd = new pfd.PFD(this.options.container);

      /* Set off each callback to initialize view */
      this.onAttitudeChange();
      this.onVfrHudChange();
      this.onNavControllerOutputChange();
    },

    onAttitudeChange: function() {
      this.pfd.setAttitude(this.attitude.get('pitch'),
                           this.attitude.get('roll'));
      this.pfd.draw();
    },

    onVfrHudChange: function () {
      var alt = this.vfrHud.get('alt');
      this.pfd.setAltitude(alt);
      var airSpeed = this.vfrHud.get('airspeed');
      this.pfd.setSpeed(airSpeed);
      this.pfd.draw();
    },

    onNavControllerOutputChange: function() {
      var alt_error = this.navControllerOutput.get('alt_error');
      var aspd_error = this.navControllerOutput.get('aspd_error');
      if (Math.abs(alt_error) > 0) {
        this.pfd.setTargetAltitude(this.vfrHud.get('alt') + alt_error);
      }
      if (Math.abs(aspd_error) > 0) {
        this.pfd.setTargetSpeed(this.vfrHud.get('airspeed') + aspd_error);
      }
    }
  });

});

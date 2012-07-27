
$(function(){
  window.Mavelous = window.Mavelous || {};
  
  Mavelous.PFDView = Backbone.View.extend({

    pfd: null,

    initialize: function() {
      this.el = this.options.el;
      this.settingsModel = this.options.settingsModel;
      this.settingsModel.bind('change', this.onSettingsChange, this);
      this.onSettingsChange();

      var mavlinkSrc = this.options.mavlinkSrc;
      // Too bad backbone doesn't pass the model to event handlers; we
      // wouldn't need to keep these handles to models.
      this.attitude = mavlinkSrc.subscribe('ATTITUDE',
          this.onAttitudeChange, this);
      this.vfrHud = mavlinkSrc.subscribe('VFR_HUD',
        this.onVfrHudChange, this);
      this.navControllerOutput = mavlinkSrc.subscribe(
        'NAV_CONTROLLER_OUTPUT', this.onNavControllerOutputChange, this);

      /* Create pfd object */
      this.pfd = new Mavelous.PFD(this.options.drawingid);

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
    },

    onSettingsChange: function () {
      var position = this.settingsModel.get('position');
      switch(position) {
        case this.settingsModel.TOPLEFT:
          this.el.css('float', 'left');
          console.log('pfdview float left');
          break;
        case this.settingsModel.TOPRIGHT:
          this.el.css('float', 'right');
          console.log('pfdview float right');
          break;
        case this.settingsModel.BOTTOMLEFT:
          break;
        case this.settingsModel.BOTTOMRIGHT:
          break;
        default:
          console.log('pfdview fail');
      }

    }
  });

});


$(function(){

  window.PFDView = Backbone.View.extend({
    pfd: null,

    initialize: function() {
      /* Set local models passed in as options */
      this.attitudeModel   = this.options.attitudeModel;
      this.vfrHudModel     = this.options.vfrHudModel;
      this.statusTextModel = this.options.statusTextModel;
      this.navControllerOutputModel = this.options.navControllerOutputModel;
      this.heartbeatModel  = this.options.heartbeatModel;

      /* Create pfd object */
      this.pfd = new pfd.PFD('pfd');

      /* Register callbacks */
      this.attitudeModel.bind  ('change', this.onAttitudeChange,   this);
      this.vfrHudModel.bind    ('change', this.onVfrHudChange,     this);
      this.statusTextModel.bind('change', this.onStatusTextChange, this);
      this.heartbeatModel.bind ('change', this.onHeartbeatChange,  this);
      this.navControllerOutputModel.bind('change', this.onNavControllerOutputChange, this);

      /* Set off each callback to initialize view */
      this.onAttitudeChange();
      this.onVfrHudChange();
      this.onStatusTextChange();
      this.onHeartbeatChange();
      this.onNavControllerOutputChange();
      console.log('pfd view initialized');
    },

    onAttitudeChange: function() {
      var att = this.attitudeModel.toJSON();
      this.pfd.setAttitude( att.pitch, att.roll );
      this.pfd.draw();
    },

    onVfrHudChange: function () {
      var alt = this.vfrHudModel.get('alt');
      this.pfd.setAltitude(alt);
      var air = this.vfrHudModel.get('airspeed');
      this.pfd.setSpeed(air);
      this.pfd.draw();
    },

    onStatusTextChange: function () {
      var text = this.statusTextModel.get('text');
      this.pfd.setStatusText(text);
    },

    onHeartbeatChange: function () {
      var modestring = this.heartbeatModel.modestring();
      this.pfd.setFlightMode(modestring);
    },

    onNavControllerOutputChange: function() {
      var alt_error = this.navControllerOutputModel.get('alt_error');
      var aspd_error = this.navControllerOutputModel.get('aspd_error');
      if (Math.abs(alt_error) > 0) {
        this.pfd.setTargetAltitude(this.vfrHudModel.get('alt') + alt_error);
      }
      if (Math.abs(aspd_error) > 0) {
        this.pfd.setTargetAltitude(this.vfrHudModel.get('airspeed') + aspd_error);
      }
    }
  });

});

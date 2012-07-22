
$(function(){

  window.PFDView = Backbone.View.extend({
    /* Constants: */
    MAV_MODE_FLAG_CUSTOM_MODE_ENABLED: 1,
    MAV_TYPE_FIXED_WING: 1,
    MAV_TYPE_QUADROTOR: 2,

    /* Flight mode lookup tables: */
    arduPlaneFlightModes: {
      0: 'MANUAL',
      1: 'CIRCLE',
      2: 'STABILIZE',
      5: 'FBWA',
      6: 'FBWB',
      7: 'FBWC',
      10: 'AUTO',
      11: 'RTL',
      12: 'LOITER',
      13: 'TAKEOFF',
      14: 'LAND',
      15: 'GUIDED',
      16: 'INITIALIZING'
    },
    arduCopterFlightModes: {
      0: 'STABILIZE',
      1: 'ACRO',
      2: 'ALT_HOLD',
      3: 'AUTO',
      4: 'GUIDED',
      5: 'LOITER',
      6: 'RTL',
      7: 'CIRCLE',
      8: 'POSITION',
      9: 'LAND',
      10: 'OF_LOITER',
      11: 'APPROACH'
    },

    pfd: null,

    modestring: function(msg) {
      var base_mode = msg.get('base_mode');
      var type = msg.get('type');
      var custom_mode = msg.get('custom_mode');

      if (!(base_mode && type && custom_mode)) {
        return;
      }

      if (!base_mode & this.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED) {
        return ('BaseMode('+ base_mode + ')');
      } else if (type == this.MAV_TYPE_QUADROTOR &&
                 custom_mode in this.arduCopterFlightModes) {
        return this.arduCopterFlightModes[msg.custom_mode];
      } else if (type == this.MAV_TYPE_FIXED_WING &&
                 custom_mode in this.arduPlaneFlightModes) {
        return this.arduPlaneFlightModes[msg.custom_mode];
      }
      return ('CustomMode(' + msg.custom_mode + ')');
    },

    initialize: function() {
      var mavlinkSrc = this.options.mavlinkSrc;

      // Too bad backbone doesn't pass the model to event handlers; we
      // wouldn't need to keep these handles to models.
      this.attitude = mavlinkSrc.subscribe('ATTITUDE', this.onAttitudeChange, this);
      this.vfrHud = mavlinkSrc.subscribe('VFR_HUD', this.onVfrHudChange, this);
      this.statusText = mavlinkSrc.subscribe('STATUSTEXT', this.onStatusTextChange, this);
      this.navControllerOutput = mavlinkSrc.subscribe(
        'NAV_CONTROLLER_OUTPUT', this.onNavControllerOutputChange, this);
      this.heartbeat = mavlinkSrc.subscribe('HEARTBEAT', this.onHeartbeatChange, this);

      /* Create pfd object */
      this.pfd = new pfd.PFD('pfd');

      /* Set off each callback to initialize view */
      this.onAttitudeChange();
      this.onVfrHudChange();
      this.onStatusTextChange();
      this.onHeartbeatChange();
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

    onStatusTextChange: function () {
      var text = this.statusText.get('text');
      this.pfd.setStatusText(text);
    },

    onHeartbeatChange: function () {
      var modestring = this.modestring(this.heartbeat);
      this.pfd.setFlightMode(modestring);
    },

    onNavControllerOutputChange: function() {
      var alt_error = this.navControllerOutput.get('alt_error');
      var aspd_error = this.navControllerOutput.get('aspd_error');
      if (Math.abs(alt_error) > 0) {
        this.pfd.setTargetAltitude(this.vfrHud.get('alt') + alt_error);
      }
      if (Math.abs(aspd_error) > 0) {
        this.pfd.setTargetAltitude(this.vfrHud.get('airspeed') + aspd_error);
      }
    }
  });

});

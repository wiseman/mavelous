
$(function(){
  window.AttitudeModel = Backbone.Model.extend({

    defaults: function() {
      return {
        time_boot_ms: 0,
        roll: 0,
        pitch: 0,
        yaw: 0,
        rollspeed: 0,
        pitchspeed: 0,
        yawspeed: 0
      };
    },

    initialize: function() {
      console.log("attitude model initialize");
    }
  });

});

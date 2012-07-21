
$(function(){
  window.HeartbeatModel = Backbone.Model.extend({

    defaults: function() {
      return {
        type: 0,
        ardupilot: 0,
        base_mode: 0,
        custom_mode: 0,
        system_status: 0,
        mavlink_version: 0
      };
    },
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

    modestring: function() {
      var msg = this.toJSON();
      if (!msg.base_mode & this.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED) {
        return ('BaseMode('+ msg.base_mode.toString() + ')');
      } else if (  msg.type == this.MAV_TYPE_QUADROTOR
                && msg.custom_mode in this.arduCopterFlightModes) {
        return this.arduCopterFlightModes[msg.custom_mode];
      } else if (  msg.type == this.MAV_TYPE_FIXED_WING
                && msg.custom_mode in this.arduPlaneFlightModes) {
        return this.arduPlaneFlightModes[msg.custom_mode];
      }
      return ('CustomMode(' + msg.custom_mode.toString() + ')');
    },

    initialize: function() {
      console.log("heartbeat model initialize");
    }
  });

  window.ModeTextView = Backbone.View.extend({
    template: _.template($('#modetexttemplate').html()),

    initialize: function() {
      $("#modetextview").replaceWith(this.render().el);
      this.model.bind('change', this.render, this);
    },

    render: function() {
      this.$el.html(this.template({modestring: this.model.modestring()}));
      return this;
    }

  });
});
  

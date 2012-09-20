
$(function () {
  window.Mavelous = window.Mavelous || {};

  Mavelous.FlightModeModel = Backbone.Model.extend({
    defaults: function () {
      return {
        armed: false,
        arming: false,
        modestring: 'None'
      };
    },
    initialize: function () {
      var mavlinkSrc = this.get('mavlinkSrc');
      this.heartbeat = mavlinkSrc.subscribe('HEARTBEAT',
                            this.onHeartbeat , this);
      this.on('change:armed', this.onChangeArmed, this);
    },
    onHeartbeat: function () {
      var modestring = mavutil.heartbeat.modestring(this.heartbeat);
      var armed = mavutil.heartbeat.armed(this.heartbeat);
      this.set({ armed: armed, modestring: modestring });
    },
    requestArm: function () {
      console.log('requested to arm');
      // Send RC override:
      // rc 3 1000, rc 4 2000
      var data = JSON.stringify({
        'ch3': 1000,
        'ch4': 2000
      });
      $.ajax({ type: 'POST',
               url: '/rcoverride',
               data: data});
    },

    requestDisarm: function () {
      console.log('requested to disarm');
      var data = JSON.stringify({
        'ch3': 1000,
        'ch4': 1000
      });
      $.ajax({ type: 'POST',
               url: '/rcoverride',
               data: data});
    }
  });

  var ArmingButtonView = Backbone.View.extend({
    initialize: function () {
      this.model.on('change:armed', this.onChange, this);
      this.$el.click(_.bind(this.onClick, this));
      this.onChange();
    },
    onClick: function () {
      if (this.model.get('armed')) {
        this.model.requestDisarm();
      } else {
        this.model.requestArm();
      }
    },
    onChange: function () {
      this.$el.removeClass('btn-success btn-warning');
      if (this.model.get('armed')) {
          this.$el.html('Click to Disarm');
          this.$el.addClass('btn-warning');
      } else {
          this.$el.html('Click to Arm');
          this.$el.addClass('btn-success');
      }
    }
  });

      // this.armedModel = new Backbone.Model({ 'armed': false });
  Mavelous.FlightModeButtonView = Backbone.View.extend({

    initialize: function () {
      this.$el = this.options.el;
      this.model.on('change', this.onChange, this);
    },

    registerPopover: function (p) {
      this.popover = p;
      this.popover.on('selected', this.popoverRender, this);
    },

    onChange: function () {
      this.$el.removeClass('btn-success btn-warning');
      if (this.model.get('armed')) {
          this.$el.addClass('btn-success');
      } else {
          this.$el.addClass('btn-warning');
      }
      this.$el.html(this.model.get('modestring'));
    },

    popoverTitle: "Flight Mode",
    popoverRender: function () {
      var loiter = 
        '<a class="btn" id="flightmode-btn-loiter" href="#">Loiter</a>';
      var rtl =
        '<a class="btn" id="flightmode-btn-rtl" href="#">RTL</a>';
      var arm = 
        '<p><a class="btn" id="flightmode-btn-arm" href="#">Arm</a></p>';
      if (this.popover) {
        this.popover.content(function (e) {
          e.html(arm + '<br />' + loiter + rtl );
        });

        this.armingButtonView = new ArmingButtonView({
          el: $('#flightmode-btn-arm'),
          model: this.model
        });

        $('#flightmode-btn-loiter').click(
              _.bind(this.onButton, this, 'loiter'));
        $('#flightmode-btn-rtl').click(
              _.bind(this.onButton, this, 'rtl'));
      }
    },

    onButton: function (b) {
      if (b == 'loiter') {
        console.log('clicked loiter');
      } else if (b == 'rtl') {
        console.log('clicked rtl');
      } else if (b == 'arm') {
        console.log('clicked arm');
      }
    }
  });
});

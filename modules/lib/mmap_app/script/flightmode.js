
$(function () {
  window.Mavelous = window.Mavelous || {};

  Mavelous.FlightModeModel = Backbone.Model.extend({
    defaults: function () {
      return {
        armed: false,
        arming: false,
        disarming: false,
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
    onChangeArmed: function () {
      if (this.get('armed')) {
        if (this.get('arming')) {
          this.set('arming', false);
           /* No more override, use the radio controller's values. */
          this.post({ch3: 0, ch4: 0});
        }
      } else {
        if (this.get('disarming')) {
          this.set('disarming', false);
           /* No more override, use the radio controller's values. */
          this.post({ch3: 0, ch4: 0});
        }
      }
    },
    requestArm: function () {
      console.log('requested to arm');
      // Send RC override:
      // rc 3 1000, rc 4 2000
      this.post({
        'ch3': 1000,
        'ch4': 2000
      });
      this.set('arming', true);
    },

    requestDisarm: function () {
      console.log('requested to disarm');
      this.post({
        'ch3': 1000,
        'ch4': 1000
      });
      this.set('disarming', true);
    },
    post: function (override) {
      $.ajax({ type: 'POST',
               url: '/rcoverride',
               data: JSON.stringify(override) });
    }
  });

  Mavelous.CommandLongModel = Backbone.Model.extend({
    post: function (command) {
      if (typeof command == 'string') {
        $.ajax({ type: 'POST',
                 url: '/command_long',
                 data: JSON.stringify({command: command}) });
      } else {
        $.ajax({ type: 'POST',
                 url: '/command_long',
                 data: JSON.stringify(command) });
      }
    }
  });

  var ArmingButtonView = Backbone.View.extend({
    initialize: function () {
      this.model.on('change:armed change:arming change:disarming',
        this.onChange, this);
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
        if (this.model.get('disarming')) {
          this.$el.html('Disarming...');
          this.$el.addClass('btn-warning');
        } else {
          this.$el.html('Click to Disarm');
          this.$el.addClass('btn-warning');
        }
      } else {
        if (this.model.get('arming')) {
          this.$el.html('Arming...');
          this.$el.addClass('btn-success');
        } else {
          this.$el.html('Click to Arm');
          this.$el.addClass('btn-success');
        }
      }
    }
  });

  var CommandButtonView = Backbone.View.extend({
    initialize: function () {
      this.command = this.options.command;
      this.$el.click(_.bind(this.onClick, this));
    },
    onClick: function () {
      this.model.post(this.command);
    }
  });

  Mavelous.FlightModeButtonView = Backbone.View.extend({

    initialize: function () {
      this.modeModel = this.options.modeModel;
      this.commandModel = this.options.commandModel;
      this.$el = this.options.el;
      this.modeModel.on('change', this.onChange, this);
    },

    registerPopover: function (p) {
      this.popover = p;
      this.popover.on('selected', this.popoverRender, this);
    },

    onChange: function () {
      this.$el.removeClass('btn-success btn-warning');
      if (this.modeModel.get('armed')) {
          this.$el.addClass('btn-success');
      } else {
          this.$el.addClass('btn-warning');
      }
      this.$el.html(this.modeModel.get('modestring'));
    },

    popoverTitle: "Flight Commands",
    popoverRender: function () {
      var loiter = 
        '<a class="btn" id="flightmode-btn-loiter" href="#">Loiter</a>';
      var rtl =
        '<a class="btn" id="flightmode-btn-rtl" href="#">RTL</a>';
      var land =
        '<a class="btn" id="flightmode-btn-land" href="#">Land</a>';
      var arm = 
        '<p><a class="btn" id="flightmode-btn-arm" href="#">Arm</a></p>';
      if (this.popover) {
        this.popover.content(function (e) {
          e.html(arm + '<br />' + loiter + rtl + land);
        });

        this.armingButtonView = new ArmingButtonView({
          el: $('#flightmode-btn-arm'),
          model: this.modeModel
        });

        this.loiterButtonView = new CommandButtonView({
          el: $('#flightmode-btn-loiter'),
          model: this.commandModel,
          command: 'NAV_LOITER_UNLIM'
        });

        this.rtlButtonView = new CommandButtonView({
          el: $('#flightmode-btn-rtl'),
          model: this.commandModel,
          command: 'NAV_RETURN_TO_LAUNCH'
        });

        this.landButtonView = new CommandButtonView({
          el: $('#flightmode-btn-land'),
          model: this.commandModel,
          command: 'NAV_LAND'
        });

      }
    }
  });
});

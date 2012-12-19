goog.provide('Mavelous.CommandLongModel');
goog.provide('Mavelous.FlightModeButtonView');
goog.provide('Mavelous.FlightModeModel');

goog.require('Mavelous.util');

goog.require('goog.json');



/**
 * Flight mode model.
 * @param {Object} properties The model properties.
 * @extends {Backbone.Model}
 * @constructor
 */
Mavelous.FlightModeModel = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.FlightModeModel, Backbone.Model);


/**
 * @export
 */
Mavelous.FlightModeModel.prototype.defaults = function() {
  return {
    'armed': false,
    'arming': false,
    'disarming': false,
    'modestring': 'None'
  };
};


/**
 * @export
 */
Mavelous.FlightModeModel.prototype.initialize = function() {
  var mavlinkSrc = this.get('mavlinkSrc');
  this.heartbeat = mavlinkSrc.subscribe('HEARTBEAT',
                                        this.onHeartbeat, this);
  this.on('change:armed', this.onChangeArmed, this);
};


Mavelous.FlightModeModel.prototype.onHeartbeat = function() {
  var modestring = Mavelous.util.heartbeat.modestring(this.heartbeat);
  var armed = Mavelous.util.heartbeat.armed(this.heartbeat);
  this.set({ 'armed': armed, 'modestring': modestring });
};


Mavelous.FlightModeModel.prototype.onChangeArmed = function() {
  if (this.get('armed')) {
    if (this.get('arming')) {
      this.set('arming', false);
    }
  } else {
    if (this.get('disarming')) {
      this.set('disarming', false);
    }
  }
};


Mavelous.FlightModeModel.prototype.requestArm = function() {
  this.postArmRequest();
  this.set('arming', true);
};


Mavelous.FlightModeModel.prototype.requestDisarm = function() {
  this.postDisarmRequest();
  this.set('disarming', true);
};


Mavelous.FlightModeModel.prototype.postArmRequest = function() {
  $.ajax({
    type: 'POST',
    url: '/command_long',
    data: goog.json.serialize({
      command: 'COMPONENT_ARM_DISARM',
      component: 'SYSTEM_CONTROL',
      setting: 'ARM'
    })});
};


Mavelous.FlightModeModel.prototype.postDisarmRequest = function() {
  $.ajax({
    type: 'POST',
    url: '/command_long',
    data: goog.json.serialize({
      command: 'COMPONENT_ARM_DISARM',
      component: 'SYSTEM_CONTROL',
      setting: 'DISARM'
    })});
};



/**
 * Sends COMMAND_LONG mavlink message.
 * @constructor
 */
Mavelous.CommandLongModel = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.CommandLongModel, Backbone.Model);


Mavelous.CommandLongModel.prototype.post = function(command) {
  if (typeof command == 'string') {
    $.ajax({
      type: 'POST',
      url: '/command_long',
      data: goog.json.serialize({command: command})
    });
  } else {
    $.ajax({
      type: 'POST',
      url: '/command_long',
      data: goog.json.serialize(command)
    });
  }
};



/**
 * @constructor
 */
Mavelous.ArmingButtonView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.ArmingButtonView, Backbone.View);


/**
 * @export
 */
Mavelous.ArmingButtonView.prototype.initialize = function() {
  this.model.on('change:armed change:arming change:disarming',
                this.onChange, this);
  this.$el.click(_.bind(this.onClick, this));
  this.onChange();
};


Mavelous.ArmingButtonView.prototype.onClick = function() {
  if (this.model.get('armed')) {
    this.model.requestDisarm();
  } else {
    this.model.requestArm();
  }
};


Mavelous.ArmingButtonView.prototype.onChange = function() {
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
};



/**
 * @constructor
 */
Mavelous.CommandButtonView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.CommandButtonView, Backbone.View);


/**
 * @export
 */
Mavelous.CommandButtonView.prototype.initialize = function() {
  this.command = this.options['command'];
  this.$el.click(_.bind(this.onClick, this));
};


Mavelous.CommandButtonView.prototype.onClick = function() {
  this.model.post(this.command);
};



/**
 * Flight mode button Backbone view.
 * @constructor
 */
Mavelous.FlightModeButtonView = function(properties) {
  this.popoverTitle = 'Flight Commands';
  goog.base(this, properties);
};
goog.inherits(Mavelous.FlightModeButtonView, Backbone.View);


/**
 * @export
 */
Mavelous.FlightModeButtonView.prototype.initialize = function() {
  this.modeModel = this.options['modeModel'];
  this.commandModel = this.options['commandModel'];
  this.$el = this.options['el'];
  this.modeModel.on('change', this.onChange, this);
};


Mavelous.FlightModeButtonView.prototype.registerPopover = function(p) {
  this.popover = p;
  this.popover.on('selected', this.popoverRender, this);
};


Mavelous.FlightModeButtonView.prototype.onChange = function() {
  this.$el.removeClass('btn-success btn-warning');
  if (this.modeModel.get('armed')) {
    this.$el.addClass('btn-success');
  } else {
    this.$el.addClass('btn-warning');
  }
  this.$el.html(this.modeModel.get('modestring'));
};


Mavelous.FlightModeButtonView.prototype.popoverRender = function() {
  var loiter =
      '<a class="btn" id="flightmode-btn-loiter" href="#">Loiter</a>';
  var rtl =
      '<a class="btn" id="flightmode-btn-rtl" href="#">RTL</a>';
  var land =
      '<a class="btn" id="flightmode-btn-land" href="#">Land</a>';
  var arm =
      '<p><a class="btn" id="flightmode-btn-arm" href="#">Arm</a></p>';
  if (this.popover) {
    this.popover.content(function(e) {
      e.html(arm + '<br />' + loiter + rtl + land);
    });

    this.armingButtonView = new Mavelous.ArmingButtonView({
      'el': $('#flightmode-btn-arm'),
      'model': this.modeModel
    });

    this.loiterButtonView = new Mavelous.CommandButtonView({
      'el': $('#flightmode-btn-loiter'),
      'model': this.commandModel,
      'command': 'NAV_LOITER_UNLIM'
    });

    this.rtlButtonView = new Mavelous.CommandButtonView({
      'el': $('#flightmode-btn-rtl'),
      'model': this.commandModel,
      'command': 'NAV_RETURN_TO_LAUNCH'
    });

    this.landButtonView = new Mavelous.CommandButtonView({
      'el': $('#flightmode-btn-land'),
      'model': this.commandModel,
      'command': 'NAV_LAND'
    });

  }
};


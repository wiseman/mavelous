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
 * @override
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
 * @override
 * @export
 */
Mavelous.FlightModeModel.prototype.initialize = function() {
  var mavlinkSrc = this.get('mavlinkSrc');
  this.heartbeat = mavlinkSrc.subscribe('HEARTBEAT',
                                        this.onHeartbeat, this);
  this.on('change:armed', this.onChangeArmed, this);
};


/**
 * Handles HEARTBEAT mavlink messages.
 */
Mavelous.FlightModeModel.prototype.onHeartbeat = function() {
  var modestring = Mavelous.util.heartbeat.modestring(this.heartbeat);
  var armed = Mavelous.util.heartbeat.armed(this.heartbeat);
  this.set({ 'armed': armed, 'modestring': modestring });
};


/**
 * Handles changes to the FlightModeModel.
 */
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


/**
 * Requests that motors be armed.
 */
Mavelous.FlightModeModel.prototype.requestArm = function() {
  this.postArmRequest_(true);
  this.set('arming', true);
};


/**
 * Requests that motors be disarmed.
 */
Mavelous.FlightModeModel.prototype.requestDisarm = function() {
  this.postArmRequest_(false);
  this.set('disarming', true);
};


/**
 * Sends a request to the server to arm or disarm the motors.
 * @param {boolean} armed Whether to arm the motors.
 * @private
 */
Mavelous.FlightModeModel.prototype.postArmRequest_ = function(armed) {
  var setting;
  if (armed) {
    setting = 'ARM';
  } else {
    setting = 'DISARM';
  }
  $.ajax({
    type: 'POST',
    url: '/command_long',
    data: goog.json.serialize({
      command: 'COMPONENT_ARM_DISARM',
      component: 'SYSTEM_CONTROL',
      setting: setting
    })});
};



/**
 * Sends COMMAND_LONG mavlink message.
 * @param {{mavlinkSrc: Mavelous.MavlinkAPI}} properties Model properties.
 * @constructor
 * @extends {Backbone.Model}
 */
Mavelous.CommandLongModel = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.CommandLongModel, Backbone.Model);


/**
 * Sends a command to the server.
 * @param {string} command The command to send.
 */
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
 * @param {{el: jQuery, model: Backbone.Model}} properties View properties.
 * @extends {Backbone.View}
 */
Mavelous.ArmingButtonView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.ArmingButtonView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.ArmingButtonView.prototype.initialize = function() {
  this.model.on('change:armed change:arming change:disarming',
                this.onChange_, this);
  this.$el.click(goog.bind(this.onClick_, this));
  this.onChange_();
};


/**
 * Handles button clicks to arm/disarm the motors.
 * @private
 */
Mavelous.ArmingButtonView.prototype.onClick_ = function() {
  if (this.model.get('armed')) {
    this.model.requestDisarm();
  } else {
    this.model.requestArm();
  }
};


/**
 * Handles changes in the model.
 * @private
 */
Mavelous.ArmingButtonView.prototype.onChange_ = function() {
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
 * @param {{el: jQuery, model: Mavelous.CommandLongModel, command: string}}
 *     properties The view properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.CommandButtonView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.CommandButtonView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.CommandButtonView.prototype.initialize = function() {
  this.command = this.options['command'];
  this.$el.click(goog.bind(this.onClick_, this));
};


/**
 * Handles button clicks.
 * @private
 */
Mavelous.CommandButtonView.prototype.onClick_ = function() {
  this.model.post(this.command);
};



/**
 * Flight mode button Backbone view.
 * @param {{el: jQuery, modeModel: Mavelous.FlightModeModel, commandModel:
 *     Mavelous.CommandLongModel}} properties View properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.FlightModeButtonView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.FlightModeButtonView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.FlightModeButtonView.prototype.initialize = function() {
  this.modeModel = this.options['modeModel'];
  this.$el = this.options['el'];
  this.modeModel.on('change', this.onChange_, this);
};


/**
 * Handles changes to the FlightModeModel.
 * @private
 */
Mavelous.FlightModeButtonView.prototype.onChange_ = function() {
  this.$el.removeClass('btn-success btn-warning');
  if (this.modeModel.get('armed')) {
    this.$el.addClass('btn-success');
  } else {
    this.$el.addClass('btn-warning');
  }
  this.$el.html(this.modeModel.get('modestring'));
};



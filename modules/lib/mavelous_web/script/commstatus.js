goog.provide('Mavelous.CommStatusButtonView');
goog.provide('Mavelous.CommStatusModel');
goog.provide('Mavelous.PacketLossModel');

/**
 * Communication status Backbone model.
 * @param {{mavlinkSrc: Mavelous.MavlinkAPI}} properties The model properties.
 * @constructor
 * @extends {Backbone.Model}
 */
Mavelous.CommStatusModel = function(properties) {
  this.SERVER_TIMEOUT_INTERVAL = 3000;
  this.HEARTBEAT_TIMEOUT_INTERVAL = 2000;
  goog.base(this, properties);
};
goog.inherits(Mavelous.CommStatusModel, Backbone.Model);


/**
 * Communications status state.
 * @enum {number}
 */
Mavelous.CommStatusModel.State = {
  UNINITIALIZED: 0,
  OK: 1,
  TIMED_OUT_ONCE: 2,
  TIMED_OUT_MANY: 3,
  ERROR: 4
};


/**
 * @override
 * @export
 */
Mavelous.CommStatusModel.prototype.defaults = function() {
  return {
    'mav': Mavelous.CommStatusModel.State.UNINITIALIZED,
    'server': Mavelous.CommStatusModel.State.UNINITIALIZED
  };
};


/**
 * @override
 * @export
 */
Mavelous.CommStatusModel.prototype.initialize = function() {
  /* Only initialize the server.
   * Mav is uninitialized until first heartbeat. */
  var mavlink = this.get('mavlinkSrc');
  mavlink.subscribe('HEARTBEAT', this.onHeartbeat, this);
  mavlink.on('gotServerResponse', this.onServerSuccess, this);
  mavlink.on('gotServerError', this.onServerError, this);
  this.resetServerTimeout();
};


/**
 * Handles HEARTBEAT mavlink messages.
 */
Mavelous.CommStatusModel.prototype.onHeartbeat = function() {
  this.set('mav', Mavelous.CommStatusModel.State.OK);
  this.resetHeartbeatTimeout();
};


/**
 * Resets the HEARTBEAT watchdog timer.
 */
Mavelous.CommStatusModel.prototype.resetHeartbeatTimeout = function() {
  var self = this;
  clearTimeout(this.heartbeatTimeout);
  this.heartbeatTimeout = setTimeout(
      function() {
        self.onHeartbeatTimeout();
      },
      this.HEARTBEAT_TIMEOUT_INTERVAL);
};


/**
 * Fires if we haven't received a HEARTBEAT message in
 * HEARTBEAT_TIMEOUT_INTERVAL ms.
 */
Mavelous.CommStatusModel.prototype.onHeartbeatTimeout = function() {
  var mavstat = this.get('mav');
  if (mavstat === Mavelous.CommStatusModel.State.OK) {
    this.set('mav', Mavelous.CommStatusModel.State.TIMED_OUT_ONCE);
  } else if (mavstat === Mavelous.CommStatusModel.State.TIMED_OUT_ONCE) {
    this.set('mav', Mavelous.CommStatusModel.State.TIMED_OUT_MANY);
  }
  /* Do nothing if uninitialized. */
  this.resetHeartbeatTimeout();
};


/**
 * Called if we get any non-error response from the server.
 */
Mavelous.CommStatusModel.prototype.onServerSuccess = function() {
  this.set('server', Mavelous.CommStatusModel.State.OK);
  this.resetServerTimeout();
};


/**
 * Called if we get a server error.
 */
Mavelous.CommStatusModel.prototype.onServerError = function() {
  this.set('server', Mavelous.CommStatusModel.State.ERROR);
};


/**
 * Resets the server comm watchdog timer.
 */
Mavelous.CommStatusModel.prototype.resetServerTimeout = function() {
  var self = this;
  clearTimeout(this.serverTimeout);
  this.serverTimeout = setTimeout(
      function() { self.onServerTimeout(); },
      this.SERVER_TIMEOUT_INTERVAL);
};


/**
 * Fires if the server comm watchdog timer fires.
 */
Mavelous.CommStatusModel.prototype.onServerTimeout = function() {
  var serverstat = this.get('server');
  if (serverstat === Mavelous.CommStatusModel.State.OK) {
    this.set('server', Mavelous.CommStatusModel.State.TIMED_OUT_ONCE);
  } else if (serverstat === Mavelous.CommStatusModel.State.TIMED_OUT_ONCE) {
    this.set('server', Mavelous.CommStatusModel.State.TIMED_OUT_MANY);
  }
  /* Do nothing if there is an error or uninitialized. */
  this.resetServerTimeout();
};



/**
 * Packet loss Backbone model.
 * @param {Object} properties The model properties.
 * @constructor
 * @extends {Backbone.Model}
 */
Mavelous.PacketLossModel = function(properties) {
  this.period = 10; /* period should not be changed after initialization. */
  goog.base(this, properties);
};
goog.inherits(Mavelous.PacketLossModel, Backbone.Model);


/**
 * @override
 * @export
 */
Mavelous.PacketLossModel.prototype.defaults = function() {
  return {
    'history': [],
    'current': -1
  };
};


/**
 * @override
 * @export
 */
Mavelous.PacketLossModel.prototype.initialize = function() {
  this.metalinkquality = this.get('mavlinkSrc').subscribe(
      'META_LINKQUALITY', this.onMessage, this);
};


/**
 * Handles META_LINKQUALITY mavlink messages.
 */
Mavelous.PacketLossModel.prototype.onMessage = function() {
  var history = this.get('history');
  var current = this.get('current');
  var latest = this.metalinkquality.toJSON();
  var next = (current + 1) % (this.period + 1);
  history[next] = latest;
  this.set('history', history);
  this.set('current', next);
};


/**
 * Computes the change in packet comms stats since the last packet.
 * @return {?Object} The packet comms stats.
 */
Mavelous.PacketLossModel.prototype.getDelta = function() {
  var history = this.get('history');
  var current = this.get('current');
  /* current is -1 when we dont yet have info from server. */
  if (current < 0) {
    return null;
  }
  var nextposition = history[(current + 1) % (this.period + 1)];
  if (nextposition) {
    return this.diff(history[current], nextposition, this.period);
  } else {
    return this.diff(history[current], history[0], current);
  }
};


/**
 * Computes the raw change in packet comms stats.
 * @param {Object} latest The most recent META_LINKQUALITY message.
 * @param {Object} compare The previous META_LINKQUALITY message.
 * @param {?} period The period between the two messages.
 * @return {Object} The packet comms stats.
 */
Mavelous.PacketLossModel.prototype.diff = function(latest, compare, period) {
  return {
    'master_in': latest['master_in'] - compare['master_in'],
    'master_out': latest['master_out'] - compare['master_out'],
    'mav_loss': latest['mav_loss'] - compare['mav_loss'],
    'period': period };
};



/**
 * Communication status Backbone view.
 * @param {Object} properties The view properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.CommStatusButtonView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.CommStatusButtonView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.CommStatusButtonView.prototype.initialize = function() {
  this.commStatusModel = this.options['commStatusModel'];
  this.commStatusModel.bind('change', this.buttonRender, this);
};


/**
 * Renders the button.  Called when the packet loss model changes.
 */
Mavelous.CommStatusButtonView.prototype.buttonRender = function() {
  var csm = this.commStatusModel;
  var state = csm.toJSON();
  var server = state['server'];
  var mav = state['mav'];
  var UNINITIALIZED = Mavelous.CommStatusModel.State.UNINITIALIZED;
  var OK = Mavelous.CommStatusModel.State.OK;
  var TIMED_OUT_ONCE = Mavelous.CommStatusModel.State.TIMED_OUT_ONCE;
  var TIMED_OUT_MANY = Mavelous.CommStatusModel.State.TIMED_OUT_MANY;
  var ERROR = Mavelous.CommStatusModel.State.ERROR;

  if (server === OK && mav === OK) {
    this.setButton(OK);
  } else if (server === UNINITIALIZED || mav === UNINITIALIZED) {
    this.setButton(UNINITIALIZED);
  } else if (server === TIMED_OUT_MANY || mav === TIMED_OUT_MANY) {
    this.setButton(TIMED_OUT_MANY);
  } else if (server === TIMED_OUT_ONCE || mav === TIMED_OUT_ONCE) {
    this.setButton(TIMED_OUT_ONCE);
  } else if (server === ERROR || mav === ERROR) {
    this.setButton(ERROR);
  } else {
    goog.asserts.assert(false, 'Unknown comm status: ' + server + '/' + mav);
  }
};


/**
 * Updates the button view to reflect the communications state.
 * @param {Mavelous.CommStatusModel.State} state The communications state.
 */
Mavelous.CommStatusButtonView.prototype.setButton = function(state) {
  var csm = this.commStatusModel;
  this.$el.removeClass('btn-success btn-danger ' +
                       'btn-warning btn-inverse ');
  var html = 'Link: None';
  var lclass = 'btn-inverse';
  if (state === Mavelous.CommStatusModel.State.UNINITIALIZED) {
    lclass = 'btn-inverse';
    html = 'Link: None';
  } else if (state === Mavelous.CommStatusModel.State.OK) {
    lclass = 'btn-success';
    html = 'Link: Good';
  } else if (state === Mavelous.CommStatusModel.State.TIMED_OUT_ONCE) {
    lclass = 'btn-warning';
    html = 'Link: Lost';
  } else if (state === Mavelous.CommStatusModel.State.TIMED_OUT_MANY) {
    lclass = 'btn-danger';
    html = 'Link: Lost';
  } else {
    lclass = 'btn-danger';
    html = 'Link: Error';
  }
  this.$el.addClass(lclass);
  html = '<span class="hidden-phone">' + html + '</span>';
  html += '<i class="icon-signal icon-white visible-phone"></i>';
  this.$el.html(html);
};



goog.provide('Mavelous.MavlinkAPI');
goog.provide('Mavelous.MavlinkMessage');

goog.require('Mavelous.FakeVehicle');

goog.require('goog.debug.Logger');



/**
 * A mavlink message.
 * @constructor
 */
Mavelous.MavlinkMessage = Backbone.Model.extend({});



/**
 * Fetches the most recent mavlink messages of interest from the
 * server.
 *
 * @constructor
 */
Mavelous.MavlinkAPI = Backbone.Model.extend({
  initialize: function() {
    this.logger_ = goog.debug.Logger.getLogger('mavelous.MavlinkAPI');
    this.url = this.get('url');
    this.gotonline = false;
    this.online = true;
    this.failcount = 0;
    // Table of message models, keyed by message type.
    this.messageModels = {};
  },

  subscribe: function(msgType, handlerFunction, context) {
    if (!this.messageModels[msgType]) {
      this.messageModels[msgType] = new Mavelous.MavlinkMessage({
        _type: msgType,
        _index: -1});
    }
    var model = this.messageModels[msgType];
    model.bind('change', handlerFunction, context);
    return model;
  },

  handleMessages: function(msgEnvelopes) {
    _.each(msgEnvelopes, this.handleMessage, this);
  },

  handleMessage: function(msg, msgType) {
    this.trigger('gotServerResponse');
    // Update the model if this is a new message for this type.
    var msgModel = this.messageModels[msgType];
    var mdlidx = msgModel.get('_index');
    if (mdlidx === undefined || msg.index > mdlidx) {
      msgModel.set({
        _index: msg.index
      }, {
        silent: true
      });
      msgModel.set(msg.msg);
    }
  },

  update: function() {
    if (this.online) {
      this.onlineUpdate();
    } else {
      this.offlineUpdate();
    }
  },

  onlineUpdate: function() {
    $.ajax({
      context: this,
      type: 'GET',
      cache: false,
      url: this.url + _.keys(this.messageModels).join('+'),
      datatype: 'json',
      success: function(data) {
        this.gotonline = true;
        this.handleMessages(data);
      },
      error: function() {
        this.trigger('gotServerError');
        if (!this.gotonline) {
          this.failcount++;
          if (this.failcount > 5) {
            this.useOfflineMode();
          }
        }
      }
    });
  },

  offlineUpdate: function() {
    this.fakevehicle.update();
    var msgs = this.fakevehicle.requestMessages(this.messageModels);
    this.handleMessages(msgs);
  },

  useOfflineMode: function() {
    if (this.online && !this.gotonline) {
      this.logger_.info('Switching to offline mode');
      this.online = false;
      this.fakevehicle = new Mavelous.FakeVehicle({
        lat: 45.5233, lon: -122.6670
      });
    }
  }
});


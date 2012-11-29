goog.require('goog.debug.Logger');

$(function() {
  window.Mavelous = window.Mavelous || {};

  Mavelous.MavlinkMessage = Backbone.Model.extend({});

  // FIXME: I'm just extending Model to get the
  // constructor/initialize() behavior and the Events mixin.  Should
  // define an Object class that calls a constructor.
  Mavelous.MavlinkAPI = Backbone.Model.extend({
    initialize: function() {
      this.logger_ = goog.debug.Logger.getLogger('mavelous.MavlinkAPI');
      this.url = this.get('url') || '/mavelousapi/latest_messages';
      this.gotonline = false;
      this.online = true;
      this.failcount = 0;
      // Table of message models, keyed by message type.
      this.messageModels = {};
    },

    subscribe: function(msgType, handlerFunction, context) {
      this.logger_.info('subscribing to mavlink message ' + msgType);
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
      if (msgModel._index === undefined || msg.index > msgModel._index) {
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

});

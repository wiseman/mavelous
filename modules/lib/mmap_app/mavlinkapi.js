$(function(){
  
  window.MavlinkMessage = Backbone.Model.extend({});


  window.MavlinkAPI = function(url) {
    var self = this;
    this.url = url;
    // Table of message models, keyed by message type.
    this.messageModels = {};

    this.subscribe = function(msgType, handlerFunction, context) {
      if (!self.messageModels[msgType]) {
        self.messageModels[msgType] = new MavlinkMessage({
          _type: msgType,
          _index: -1});
      }
      var model = self.messageModels[msgType];
      model.bind('change', handlerFunction, context);
      return model;
    };

    this.handleMessages = function(msgEnvelopes) {
      _.each(msgEnvelopes, self.handleMessage, self);
    };

    this.handleMessage = function(msg, msgType) {
      // Update the model if this is a new message for this type.
      var msgModel = self.messageModels[msgType];
      if (msgModel._index === undefined || msg.index > msgModel._index) {
        msgModel.set({
          _index: msg.index
        }, {
          silent: true
        });
        msgModel.set(msg.msg);
      }
    };

    this.update = function () {
      $.ajax({ type : 'GET',
               url : self.url + _.keys(self.messageModels).join("+"),
               datatype: 'json',
               success: self.handleMessages,
               fail : function () { self.commStatusModel.onServerError(); }
             });
    };
  };
});

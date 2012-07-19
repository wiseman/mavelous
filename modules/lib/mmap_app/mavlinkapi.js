
$(function(){
  
  window.MavlinkAPI = function ( mtable, commStatusModel ) {
    var self = this;
    this.mtable = mtable;
    this.commStatusModel = commStatusModel;
    this.heartbeatIndex = -1;

    this.parseMsgResults = function (data) {
      // console.log({"mavlink api data": data });
      self.commStatusModel.onServerSuccess();
      /* For each messagetype in data, */
      _.each(data, function( msg, mtype ) {
        /* Find the handler for that messagetype in mtable */
        if (mtype in self.mtable) {
          /* and dispatch the message to the handler. */
          self.mtable[mtype](msg);
        }

        if (mtype == "HEARTBEAT") {
          if (msg.index > self.heartbeatIndex) {
            self.heartbeatIndex = msg.index;
            self.commStatusModel.onHeartbeat();
          }
        }
      });
    };

    this.update = function () {
      $.ajax({ type : 'GET',
               url : "mavlink/" + _.keys(self.mtable).join("+"),
               datatype: 'json',
               success: self.parseMsgResults,
               fail : function () { self.commStatusModel.onServerError(); }
             });
    };
  };

  window.sendNewMavlinkMessageToModel = function ( model ) {
    var lastidx = -1;
    return function (newmsg) {
      if (newmsg.index > lastidx) {
        lastidx = newmsg.index;
        model.set(newmsg.msg);
      }
    }
  }


});

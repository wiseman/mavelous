
$(function(){
  
  window.MavlinkAPI = function ( mtable, onfail ) {
    var self = this;
    this.mtable = mtable;
    this.onfail = onfail;

    this.parseMsgResults = function (data) {
      console.log({"mavlink api data": data });
      /* For each messagetype in data, */
      _.each(data, function( msg, mtype ) {
        /* Find the handler for that messagetype in mtable */
        if (mtype in self.mtable) {
          /* and dispatch the message to the handler. */
          self.mtable[mtype](msg);
        }
      });
    };

    this.update = function () {
      $.ajax({ type : 'GET',
               url : "mavlink/" + _.keys(self.mtable).join("+"),
               datatype: 'json',
               success: self.parseMsgResults,
               fail : self.onfail
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

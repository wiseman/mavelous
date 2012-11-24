
$(function(){ 
  var mavlinkAPI = new Mavelous.MavlinkAPI({ url: '/mavlink/' });

 // var mmapModel = new Mavelous.MMapModel({ mavlinkSrc: mavlinkAPI });

  setInterval(function() {
    mavlinkAPI.update();
  }, 100); 

});

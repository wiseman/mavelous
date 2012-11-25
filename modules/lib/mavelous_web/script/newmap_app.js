
$(function(){ 
  var mavlinkAPI = new Mavelous.MavlinkAPI({ url: '/mavlink/' });

  var mmapWindow = new Mavelous.MMapWindowingModel({ mavlinkSrc: mavlinkAPI });

  var mmap = new Mavelous.MMapView({ windowModel: mmapWindow });

  setInterval(function() {
    mavlinkAPI.update();
  }, 100); 

});

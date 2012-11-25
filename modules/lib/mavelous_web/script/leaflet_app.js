
$(function(){ 
  var mavlinkAPI = new Mavelous.MavlinkAPI({ url: '/mavlink/' });

  var mmapWindow = new Mavelous.MMapWindowingModel({ mavlinkSrc: mavlinkAPI });
  mmapWindow.set('snapToVehicle', false);

  var mmap = new Mavelous.LeafletView({ windowModel: mmapWindow });

  setInterval(function() {
    mavlinkAPI.update();
  }, 100); 

});

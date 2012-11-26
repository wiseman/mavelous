
$(function(){ 
  var mavlinkAPI = new Mavelous.MavlinkAPI({ url: '/mavlink/' });

  var lvehicle = new Mavelous.VehicleLeafletPosition({ mavlinkSrc: mavlinkAPI });
  var map = new Mavelous.LeafletView({ vehicle: lvehicle });

  setInterval(function() {
    mavlinkAPI.update();
  }, 100); 

});

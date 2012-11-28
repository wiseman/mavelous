
$(function(){ 
  var mavlinkAPI = new Mavelous.MavlinkAPI({ url: '/mavlink/' });

  var vehicle = new Mavelous.VehicleLeafletPosition({ mavlinkSrc: mavlinkAPI });
  var leafletDroneIcon = new Mavelous.LeafletDroneIconModel();
  var leafletProviders = new Mavelous.LeafletProviders();

  var mapView = new Mavelous.LeafletView({ 
    vehicle: vehicle,
    provider: leafletProviders,
    vehicleIcon: leafletDroneIcon
  });

  setInterval(function() {
    mavlinkAPI.update();
  }, 100); 

});

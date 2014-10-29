goog.require('Mavelous.LeafletDroneIconModel');
goog.require('Mavelous.MavlinkAPI');


$(function() {
  var mavlinkAPI = new Mavelous.MavlinkAPI({ 'url': '/mavlink/' });

  var vehicle = new Mavelous.VehicleLeafletPosition({
    'mavlinkSrc': mavlinkAPI
  });
  var leafletDroneIcon = new Mavelous.LeafletDroneIconModel();
  var leafletProviders = new Mavelous.LeafletProviders();

  var guideModel = new Mavelous.GuideModel({ 'mavlinkSrc': mavlinkAPI });

  var mapView = new Mavelous.LeafletView({
    'vehicle': vehicle,
    'provider': leafletProviders,
    'vehicleIcon': leafletDroneIcon,
    'guideModel': guideModel
  });

  setInterval(function() {
    mavlinkAPI.update();
  }, 100);

});

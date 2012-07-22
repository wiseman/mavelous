
$(function(){ 
  var mavlinkAPI = new MavlinkAPI('/mavlink/');

  var pfdview = new PFDView({ mavlinkSrc: mavlinkAPI });

  var mmapModel = new MMapModel({ mavlinkSrc: mavlinkAPI });
  var mmapProviderModel = new MMapProviderModel();
  var mapsettings = new MMapSettingsView({
    providerModel: mmapProviderModel,
    mapModel: mmapModel
  });
  var guideModel = new GuideModel({ mavlinkSrc: mavlinkAPI });
  var guidealtview   = new GuideAltitudeView({ model: guideModel });
  var mapview = new MMapView({
    providerModel: mmapProviderModel,
    mapModel: mmapModel,
    guideModel: guideModel
  });

  var commStatusModel = new CommStatusModel({ mavlinkSrc: mavlinkAPI });
  var commstatusview = new CommStatusView({ model: commStatusModel });
  
  var droneview = new DroneView({ mavlinkSrc: mavlinkAPI });

  var gpsTextView = new GpsTextView({ mavlinkSrc: mavlinkAPI });

  console.log('appview initialized');
  
  setInterval(function() {
    mavlinkAPI.update();
  }, 250); 

});

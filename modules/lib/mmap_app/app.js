
$(function(){ 
  var mavlinkAPI = new MavlinkAPI({ url: '/mavlink/' });

  var pfdView = new PFDView({ mavlinkSrc: mavlinkAPI });

  var mmapModel = new MMapModel({ mavlinkSrc: mavlinkAPI });
  var mmapProviderModel = new MMapProviderModel();
  var mapSettings = new MMapSettingsView({
    providerModel: mmapProviderModel,
    mapModel: mmapModel
  });
  var guideModel = new GuideModel({ mavlinkSrc: mavlinkAPI });
  var guideAltView   = new GuideAltitudeView({ model: guideModel });
  var mapView = new MMapView({
    providerModel: mmapProviderModel,
    mapModel: mmapModel,
    guideModel: guideModel
  });

  var commStatusModel = new CommStatusModel({
    mavlinkSrc: mavlinkAPI
  });
  var commStatusView = new CommStatusView({
    model: commStatusModel,
    el: $('#commstatustextview')
 });
  
  var droneView = new DroneView({ mavlinkSrc: mavlinkAPI });

  var gpsTextView = new GpsTextView({
    mavlinkSrc: mavlinkAPI,
    el: $('#gpstextview')
  });

  var modeStringView = new ModeStringView({ mavlinkSrc: mavlinkAPI });

  setInterval(function() {
    mavlinkAPI.update();
  }, 250); 

});

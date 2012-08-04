
$(function(){ 

  var mavlinkAPI = new Mavelous.MavlinkAPI({ url: '/mavlink/' });

  var pfdSettingsModel = new Mavelous.PFDSettingsModel();
  var pfdView = new Mavelous.PFDView({
    mavlinkSrc: mavlinkAPI,
    settingsModel: pfdSettingsModel,
    drawingid: 'pfdview',
    blockel: $('#pfdblock'),
    statel: $('#pfdstatus')
  });

  var mmapModel = new Mavelous.MMapModel({ mavlinkSrc: mavlinkAPI });
  var mmapProviderModel = new Mavelous.MMapProviderModel();

  var guideModel = new Mavelous.GuideModel({ mavlinkSrc: mavlinkAPI });
  var guideAltView   = new Mavelous.GuideAltitudeView({
    model: guideModel,
    input: $('#guidealt-input'),
    submit: $('#guidealt-submit'),
    text: $('#guidealt-text')
  });
  var mapView = new Mavelous.MMapView({
    providerModel: mmapProviderModel,
    mapModel: mmapModel,
    guideModel: guideModel
  });

  var commStatusModel = new Mavelous.CommStatusModel({
    mavlinkSrc: mavlinkAPI
  });
  var commStatusButtonView = new Mavelous.CommStatusButtonView({
    model: commStatusModel,
    el: $('#navbar-btn-link')
  });

  var droneView = new Mavelous.DroneView({ mavlinkSrc: mavlinkAPI });

  var gpsButtonView = new Mavelous.GpsButtonView({
    mavlinkSrc: mavlinkAPI,
    el: $('#navbar-btn-gps')
  });

  var statustextView = new Mavelous.StatustextView({ mavlinkSrc: mavlinkAPI });
  var modeStringView = new Mavelous.ModeStringView({
    mavlinkSrc: mavlinkAPI,
    el: $('#pfd_modestringview')
  });

  var modeStringButotn = new Mavelous.ModeStringButton({
    mavlinkSrc: mavlinkAPI,
    el: $('#navbar-btn-mode')
  });

  var settingsView = new Mavelous.SettingsView({
    /* Map settings: */
    mapProviderModel:  mmapProviderModel,
    mapModel:          mmapModel,
    modalToggle:       $('#navbar-a-settings'),
    modal:             $('#settings-modal'),
    mapProviderPicker: $('#settings-mapproviderpicker'),
    mapZoomSlider:     $('#settings-mapzoom'),
    mapZoomValue:      $('#settings-mapzoom-value'),
    /* PFD settings: */
    pfdSettingsModel:  pfdSettingsModel,
    pfdPositionLeft:   $('#settings-pfdpos-left'),
    pfdPositionRight:  $('#settings-pfdpos-right'),
    pfdPositionUp:     $('#settings-pfdpos-up'),
    pfdPositionDown:   $('#settings-pfdpos-down')
  });

  window.router = new Mavelous.AppRouter({
    pfdSettingsModel: pfdSettingsModel
  });

  Backbone.history.start();
  router.navigate('overview');

  setInterval(function() {
    mavlinkAPI.update();
  }, 100); 


});

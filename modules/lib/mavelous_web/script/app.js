
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

  var guideModel = new Mavelous.GuideModel({ mavlinkSrc: mavlinkAPI });
  var guideAltView   = new Mavelous.GuideAltitudeView({
    model: guideModel,
    input: $('#guidealt-input'),
    submit: $('#guidealt-submit'),
    text: $('#guidealt-text')
  });

  var vehicle = new Mavelous.VehicleLeafletPosition({ mavlinkSrc: mavlinkAPI });
  var map = new Mavelous.LeafletView({ vehicle: vehicle });

  var commStatusModel = new Mavelous.CommStatusModel({
    mavlinkSrc: mavlinkAPI
  });

  var packetLossModel = new Mavelous.PacketLossModel({
    mavlinkSrc: mavlinkAPI
  });

  var commStatusButtonView = new Mavelous.CommStatusButtonView({
    commStatusModel: commStatusModel,
    packetLossModel: packetLossModel,
    el: $('#navbar-btn-link')
  });

  var gpsButtonView = new Mavelous.GpsButtonView({
    mavlinkSrc: mavlinkAPI,
    el: $('#navbar-btn-gps')
  });

  var statustextView = new Mavelous.StatustextView({ mavlinkSrc: mavlinkAPI });

  var modeStringView = new Mavelous.ModeStringView({
    mavlinkSrc: mavlinkAPI,
    el: $('#pfd_modestringview')
  });

  var flightModeModel = new Mavelous.FlightModeModel({
    mavlinkSrc: mavlinkAPI
  });
  var flightCommandModel = new Mavelous.CommandLongModel({
    mavlinkSrc: mavlinkAPI
  });
  var flightModeButtonView = new Mavelous.FlightModeButtonView({
    el: $('#navbar-btn-mode'),
    modeModel: flightModeModel,
    commandModel: flightCommandModel
  });

  /* Radio view controller */
  var statusButtons = new Mavelous.StatusButtons({
    buttons: [ gpsButtonView, commStatusButtonView, flightModeButtonView ]
  });


  var batteryButton = new Mavelous.BatteryButton({
    mavlinkSrc: mavlinkAPI,
    el: $('#navbar-btn-battery')
  });

  var settingsView = new Mavelous.SettingsView({
    /* Map settings: */
    mapProviderModel:  undefined,
    mapModel:          undefined,
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

  if ($(window).width() > 767) {
    /* On the desktop, default to overview */
    router.navigate('overview', {trigger: true});
  } else {
    /* On tablets and phones, default to map only */
    router.navigate('maponly', {trigger: true});
  }

  setInterval(function() {
    mavlinkAPI.update();
  }, 100); 


});

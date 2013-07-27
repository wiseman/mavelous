goog.provide('Mavelous.App');

goog.require('Mavelous.AppRouter');
goog.require('Mavelous.BatteryButton');
goog.require('Mavelous.CommStatusButtonView');
goog.require('Mavelous.CommStatusPopoverViewDelegate');
goog.require('Mavelous.CommStatusModel');
goog.require('Mavelous.CommandLongModel');
goog.require('Mavelous.FlightModeButtonView');
goog.require('Mavelous.FlightModePopoverViewDelegate');
goog.require('Mavelous.FlightModeModel');
goog.require('Mavelous.GpsButtonView');
goog.require('Mavelous.GpsPopoverViewDelegate');
goog.require('Mavelous.GuideAltitudeView');
goog.require('Mavelous.GuideModel');
goog.require('Mavelous.LeafletDroneIconModel');
goog.require('Mavelous.LeafletPanControlView');
goog.require('Mavelous.LeafletPanModel');
goog.require('Mavelous.LeafletProviders');
goog.require('Mavelous.LeafletView');
goog.require('Mavelous.MavlinkAPI');
goog.require('Mavelous.ModeStringView');
goog.require('Mavelous.PFD');
goog.require('Mavelous.PFDSettingsModel');
goog.require('Mavelous.PFDView');
goog.require('Mavelous.PacketLossModel');
goog.require('Mavelous.PopoverView');
goog.require('Mavelous.RadioButtonPopoverView');
goog.require('Mavelous.SettingsView');
goog.require('Mavelous.StatustextView');
goog.require('Mavelous.VehicleLeafletPosition');

goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.async.AnimationDelay');
goog.require('goog.async.Throttle');
goog.require('goog.debug.Console');
goog.require('goog.debug.FpsDisplay');
goog.require('goog.dom');
goog.require('goog.net.jsloader');



/**
 * Mavelous App object.
 *
 * @constructor
 */
Mavelous.App = function() {
};


/**
 * Initializes and starts the app.
 */
Mavelous.App.prototype.start = function() {
  var c = new goog.debug.Console();
  c.setCapturing(true);

  var uri = new goog.Uri(window.location.href);
  this.mavlinkAPI = new Mavelous.MavlinkAPI({ 'url': '/mavlink/' });
  /* If we see "offline" query parameter in the URL, enable offline
   * mode. */
  if (goog.isDef(uri.getParameterValue('offline'))) {
    this.mavlinkAPI.useOfflineMode();
  }

  /* Check whether we're in debug mode. */
  var debugValue = uri.getParameterValue('debug');
  if (goog.isDef(debugValue)) {
    window.console.log('Enabling debug mode');
    /* ?debug with or without a value is enough to trigger fps display. */
    var fpsNode = document.getElementById('fps');
    var fpsValueNode = goog.dom.createDom('span', {'id': 'fpsvalue'});
    goog.dom.appendChild(fpsNode, fpsValueNode);
    goog.dom.appendChild(fpsNode, goog.dom.createTextNode(' fps'));
    new goog.debug.FpsDisplay().decorate(fpsValueNode);

    /* Phonegap support: If we see debug=<identifier>, load the
     * phonegap script.  You can then debug at
     * http://debug.phonegap.com/client/#<identifier> */
    if (debugValue.length > 0) {
      window.console.log('Enabling phonegap at ' +
                         'http://debug.phonegap.com/client/#' + debugValue);
      var phonegap_script_url = ('http://debug.phonegap.com/target/' +
                                 'target-script-min.js#' + debugValue);
      goog.net.jsloader.load(phonegap_script_url);
    }
  }

  this.pfdSettingsModel = new Mavelous.PFDSettingsModel();
  this.pfdView = new Mavelous.PFDView({
    'mavlinkSrc': this.mavlinkAPI,
    'settingsModel': this.pfdSettingsModel,
    'drawingid': 'pfdview',
    'blockel': $('#pfdblock'),
    'statel': $('#pfdstatus')
  });

  this.guideModel = new Mavelous.GuideModel({ 'mavlinkSrc': this.mavlinkAPI });
  this.guideAltView = new Mavelous.GuideAltitudeView({
    'model': this.guideModel,
    'input': $('#guidealt-input'),
    'submit': $('#guidealt-submit'),
    'text': $('#guidealt-text')
  });

  this.leafletDroneIcon = new Mavelous.LeafletDroneIconModel();
  this.leafletProviders = new Mavelous.LeafletProviders();

  this.vehicle = new Mavelous.VehicleLeafletPosition({
    'mavlinkSrc': this.mavlinkAPI
  });

  this.panModel = new Mavelous.LeafletPanModel({
    'vehicle': this.vehicle
  });
  this.panCtrl = new Mavelous.LeafletPanControlView({
    'model': this.panModel,
    'button': $('#mapoverlay-btn-centermap'),
    'icon': $('#mapoverlay-icon-centermap')
  });
  this.mapView = new Mavelous.LeafletView({
    'vehicle': this.vehicle,
    'provider': this.leafletProviders,
    'vehicleIcon': this.leafletDroneIcon,
    'guideModel': this.guideModel,
    'panModel': this.panModel
  });

  this.commStatusModel = new Mavelous.CommStatusModel({
    'mavlinkSrc': this.mavlinkAPI
  });

  this.packetLossModel = new Mavelous.PacketLossModel({
    'mavlinkSrc': this.mavlinkAPI
  });

  this.commStatusButtonView = new Mavelous.CommStatusButtonView({
    'commStatusModel': this.commStatusModel,
    'packetLossModel': this.packetLossModel,
    'el': $('#navbar-btn-link')
  });

  this.gpsButtonView = new Mavelous.GpsButtonView({
    'mavlinkSrc': this.mavlinkAPI,
    'el': $('#navbar-btn-gps')
  });

  this.statustextView = new Mavelous.StatustextView({
    'mavlinkSrc': this.mavlinkAPI
  });

  this.modeStringView = new Mavelous.ModeStringView({
    'mavlinkSrc': this.mavlinkAPI,
    'el': $('#pfd_modestringview')
  });

  this.flightModeModel = new Mavelous.FlightModeModel({
    'mavlinkSrc': this.mavlinkAPI
  });
  this.flightCommandModel = new Mavelous.CommandLongModel({
    'mavlinkSrc': this.mavlinkAPI
  });
  this.flightModeButtonView = new Mavelous.FlightModeButtonView({
    'el': $('#navbar-btn-mode'),
    'modeModel': this.flightModeModel
  });

  /* Radio view controller */
  this.statusButtons = new Mavelous.RadioButtonPopoverView({
    popovers: [ { btn: this.gpsButtonView,
                  delegate: new Mavelous.GpsPopoverViewDelegate({
                    'mavlinkSrc': this.mavlinkAPI
                    })
                },
                { btn: this.commStatusButtonView,
                  delegate: new Mavelous.CommStatusPopoverViewDelegate({
                    'packetLossModel': this.packetLossModel
                    })
                },
                { btn: this.flightModeButtonView,
                  delegate: new Mavelous.FlightModePopoverViewDelegate({
                    'modeModel': this.flightModeModel,
                    'commandModel': this.flightCommandModel
                    })
                }
              ]
  });

  this.batteryButton = new Mavelous.BatteryButton({
    'mavlinkSrc': this.mavlinkAPI,
    'el': $('#navbar-btn-battery')
  });

  this.settingsView = new Mavelous.SettingsView({
    /* Map settings: */
    'map': this.mapView.map,
    'mapView': this.mapView,
    'mapProviderModel': this.leafletProviders,
    'vehicleIconModel': this.leafletDroneIcon,
    'modalToggle': $('#navbar-a-settings'),
    'modal': $('#settings-modal'),
    'mapProviderPicker': $('#settings-mapproviderpicker'),
    'mapZoomSlider': $('#settings-mapzoom'),
    'mapZoomValue': $('#settings-mapzoom-value'),
    'mapPathPicker': $('#settings-mappathpicker'),
    'vehicleIconPicker': $('#settings-vehicleiconpicker'),
    /* PFD settings: */
    'pfdSettingsModel': this.pfdSettingsModel,
    'pfdPositionLeft': $('#settings-pfdpos-left'),
    'pfdPositionRight': $('#settings-pfdpos-right'),
    'pfdPositionUp': $('#settings-pfdpos-up'),
    'pfdPositionDown': $('#settings-pfdpos-down')
  });

  this.router = new Mavelous.AppRouter({
    'pfdSettingsModel': this.pfdSettingsModel
  });

  Backbone.history.start();

  if ($(window).width() > 767) {
    /* On the desktop, default to overview */
    this.router.navigate('overview', {'trigger': true});
  } else {
    /* On tablets and phones, default to map only */
    this.router.navigate('maponly', {'trigger': true});
  }

  // By trying to update at the maximum frame rate, but using a
  // throttle to clamp it to a max 10 Hz update rate, we end up
  // requesting new vehicle data and rendering it at a 10 Hz rate, or
  // slower if the rendering isn't keeping up.
  var MAX_UPDATES_PER_SEC = 10;
  var animationDelay = null;
  var updateThrottle = new goog.async.Throttle(
      function() {
        this.mavlinkAPI.update();
        animationDelay.start();
      },
      1000 / MAX_UPDATES_PER_SEC,
      this);
  animationDelay = new goog.async.AnimationDelay(
      function() {
        updateThrottle.fire();
      });
  animationDelay.start();
};


// Ensures the symbol will be visible after compiler renaming.
goog.exportSymbol('Mavelous.App', Mavelous.App);
goog.exportSymbol('Mavelous.App.prototype.start', Mavelous.App.prototype.start);

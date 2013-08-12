goog.provide('Mavelous.SettingsView');

goog.require('Mavelous.PFDSettingsModel');



/**
 * Settings backbone view.
 * @param {Object} properties View properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.SettingsView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.SettingsView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.SettingsView.prototype.initialize = function() {
  var self = this;
  /* Setup settings pane elements (jquery) */
  this.modalToggle = this.options['modalToggle'];
  this.modal = this.options['modal'];
  this.modalToggle.click(function() {
    self.modal.modal('toggle');
  });
  /* Leaflet map: for zoom */
  this.map = this.options['map'];
  this.mapView = this.options['mapView'];
  /* Map models: */
  this.mapProviderModel = this.options['mapProviderModel'];
  this.vehicleIconModel = this.options['vehicleIconModel'];
  /* Map settings elements (jquery): */
  this.mapProviderPicker = this.options['mapProviderPicker'];
  this.mapZoomSlider = this.options['mapZoomSlider'];
  this.mapZoomValue = this.options['mapZoomValue'];
  this.mapPathPicker = this.options['mapPathPicker'];
  this.vehicleIconPicker = this.options['vehicleIconPicker'];

  this.setupMapProviderPicker();
  this.setupMapZoomSlider();
  this.setupMapPathPicker();
  this.setupVehicleIconPicker();

  /* PFD Settings model: */
  this.pfdSettingsModel = this.options['pfdSettingsModel'];
  /* PFD Settings elements (jquery): */
  this.pfdPositionLeft = this.options['pfdPositionLeft'];
  this.pfdPositionRight = this.options['pfdPositionRight'];
  this.pfdPositionUp = this.options['pfdPositionUp'];
  this.pfdPositionDown = this.options['pfdPositionDown'];

  this.setupPFDSettings();
};


/* MAP SETTINGS ROUTINES */


/**
 * Set up the map provider picker.
 */
Mavelous.SettingsView.prototype.setupMapProviderPicker = function() {
  var self = this;
  if (this.mapProviderModel === undefined) {
    return;
  }
  _.each(Mavelous.LeafletProviders.Providers, function(provider, name) {
    self.mapProviderPicker.append('<option value="' + name + '">' +
                                  provider.description + '</option>');
  });
  this.mapProviderPicker.change(function() {
    var newprovider = self.mapProviderPicker.val();
    self.mapProviderModel.set('provider', newprovider);
  });
};


/**
 * Set up the map zoom slider.
 */
Mavelous.SettingsView.prototype.setupMapZoomSlider = function() {
  var self = this;
  if (this.map === undefined) {
    return;
  }
  this.mapZoomSlider.change(function() {
    self.map.setZoom(self.mapZoomSlider.val());
  });
  this.map.on('zoomend', this.onZoomChange, this);
};

/**
 * Set up map trail picker
 */
Mavelous.SettingsView.prototype.setupMapPathPicker = function() {
  var self = this;
  if (this.map === undefined) {
    return;
  }
  this.mapPathPicker.change(function() {
    var setting = self.mapPathPicker.val();
    self.mapView.setPathVisible(setting);
  });
};

/**
 * Set up the vehicle icon picker.
 */
Mavelous.SettingsView.prototype.setupVehicleIconPicker = function() {
  var self = this;
  if (this.vehicleIconModel === undefined) {
    return;
  }
  _.each(Mavelous.LeafletDroneIconModel.Icons, function(icon, name) {
    self.vehicleIconPicker.append('<option value="' + name + '">' +
                                  icon.description + '</option>');
  });
  this.vehicleIconPicker.change(function() {
    var newicon = self.vehicleIconPicker.val();
    self.vehicleIconModel.set('icon', newicon);
  });
};


/**
 * Handles zoom slider changes.
 */
Mavelous.SettingsView.prototype.onZoomChange = function() {
  this.mapZoomSlider.val(this.map.getZoom());
  this.mapZoomValue.html(this.map.getZoom().toString());
};

/* PFD SETTINGS ROUTINES */


/**
 * Set up the PFD settings.
 */
Mavelous.SettingsView.prototype.setupPFDSettings = function() {
  var self = this;
  this.pfdPositionLeft.click(function() {
    if (self.pfdPositionUp.hasClass('active')) {
      self.pfdSettingsModel.set('position',
                                Mavelous.PFDSettingsModel.Position.TOPLEFT);
    } else {
      self.pfdSettingsModel.set('position',
                                Mavelous.PFDSettingsModel.Position.BOTTOMLEFT);
    }
  });

  this.pfdPositionRight.click(function() {
    if (self.pfdPositionUp.hasClass('active')) {
      self.pfdSettingsModel.set('position',
                                Mavelous.PFDSettingsModel.Position.TOPRIGHT);
    } else {
      self.pfdSettingsModel.set('position',
                                Mavelous.PFDSettingsModel.Position.BOTTOMRIGHT);
    }
  });

  this.pfdPositionUp.click(function() {
    if (self.pfdPositionLeft.hasClass('active')) {
      self.pfdSettingsModel.set('position',
                                Mavelous.PFDSettingsModel.Position.TOPLEFT);
    } else {
      self.pfdSettingsModel.set('position',
                                Mavelous.PFDSettingsModel.Position.TOPRIGHT);
    }
  });

  this.pfdPositionDown.click(function() {
    if (self.pfdPositionLeft.hasClass('active')) {
      self.pfdSettingsModel.set('position',
                                Mavelous.PFDSettingsModel.Position.BOTTOMLEFT);
    } else {
      self.pfdSettingsModel.set('position',
                                Mavelous.PFDSettingsModel.Position.BOTTOMRIGHT);
    }
  });

  this.pfdSettingsModel.bind('change', this.onPFDSettingsChange, this);
  this.onPFDSettingsChange();
};


/**
 * Handles PFD settings changes.
 */
Mavelous.SettingsView.prototype.onPFDSettingsChange = function() {
  var position = this.pfdSettingsModel.get('position');
  switch (position) {
    case Mavelous.PFDSettingsModel.Position.TOPLEFT:
      this.pfdPositionLeft.button('toggle');
      this.pfdPositionUp.button('toggle');
      break;
    case Mavelous.PFDSettingsModel.Position.TOPRIGHT:
      this.pfdPositionRight.button('toggle');
      this.pfdPositionUp.button('toggle');
      break;
    case Mavelous.PFDSettingsModel.Position.BOTTOMLEFT:
      this.pfdPositionLeft.button('toggle');
      this.pfdPositionDown.button('toggle');
      break;
    case Mavelous.PFDSettingsModel.Position.BOTTOMRIGHT:
      this.pfdPositionRight.button('toggle');
      this.pfdPositionDown.button('toggle');
      break;
  }
};

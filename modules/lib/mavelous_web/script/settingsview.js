
$(function() {
  window.Mavelous = window.Mavelous || {};
  Mavelous.SettingsView = Backbone.View.extend({
    initialize: function() {
      var self = this;
      /* Setup settings pane elements (jquery) */
      this.modalToggle = this.options.modalToggle;
      this.modal = this.options.modal;
      this.modalToggle.click(function() {
        self.modal.modal('toggle');
      });
      /* Leaflet map: for zoom */
      this.map = this.options.map;
      /* Map models: */
      this.mapProviderModel = this.options.mapProviderModel;
      this.vehicleIconModel = this.options.vehicleIconModel;
      /* Map settings elements (jquery): */
      this.mapProviderPicker = this.options.mapProviderPicker;
      this.mapZoomSlider = this.options.mapZoomSlider;
      this.mapZoomValue = this.options.mapZoomValue;
      this.vehicleIconPicker = this.options.vehicleIconPicker;

      this.setupMapProviderPicker();
      this.setupMapZoomSlider();
      this.setupVehicleIconPicker();

      /* PFD Settings model: */
      this.pfdSettingsModel = this.options.pfdSettingsModel;
      /* PFD Settings elements (jquery): */
      this.pfdPositionLeft = this.options.pfdPositionLeft;
      this.pfdPositionRight = this.options.pfdPositionRight;
      this.pfdPositionUp = this.options.pfdPositionUp;
      this.pfdPositionDown = this.options.pfdPositionDown;

      this.setupPFDSettings();
    },

    /* MAP SETTINGS ROUTINES */

    setupMapProviderPicker: function() {
      var self = this;
      if (this.mapProviderModel === undefined) return;
      _.each(this.mapProviderModel.providers, function(provider, name) {
        self.mapProviderPicker.append('<option value="' + name + '">' +
            provider.description + '</option>');
      });
      this.mapProviderPicker.change(function() {
        var newprovider = self.mapProviderPicker.val();
        self.mapProviderModel.set('provider', newprovider);
      });
    },

    setupMapZoomSlider: function() {
      var self = this;
      if (this.map === undefined) return;
      this.mapZoomSlider.change(function() {
        self.map.setZoom(self.mapZoomSlider.val());
      });
      this.map.on('zoomend', this.onZoomChange, this);
    },

    setupVehicleIconPicker: function() {
      var self = this;
      if (this.vehicleIconModel === undefined) return;
      _.each(this.vehicleIconModel.icons, function(icon, name) {
        self.vehicleIconPicker.append('<option value="' + name + '">' +
            icon.description + '</option>');
      });
      this.vehicleIconPicker.change(function() {
        var newicon = self.vehicleIconPicker.val();
        self.vehicleIconModel.set('icon', newicon);
      });
    },
    onZoomChange: function() {
      this.mapZoomSlider.val(this.map.getZoom());
      this.mapZoomValue.html(this.map.getZoom().toString());
    },

    /* PFD SETTINGS ROUTINES */

    setupPFDSettings: function() {
      var self = this;
      this.pfdPositionLeft.click(function() {
        if (self.pfdPositionUp.hasClass('active')) {
          self.pfdSettingsModel.set('position',
              self.pfdSettingsModel.TOPLEFT);
        } else {
          self.pfdSettingsModel.set('position',
              self.pfdSettingsModel.BOTTOMLEFT);
        }
      });

      this.pfdPositionRight.click(function() {
        if (self.pfdPositionUp.hasClass('active')) {
          self.pfdSettingsModel.set('position',
              self.pfdSettingsModel.TOPRIGHT);
        } else {
          self.pfdSettingsModel.set('position',
              self.pfdSettingsModel.BOTTOMRIGHT);
        }
      });

      this.pfdPositionUp.click(function() {
        if (self.pfdPositionLeft.hasClass('active')) {
          self.pfdSettingsModel.set('position',
              self.pfdSettingsModel.TOPLEFT);
        } else {
          self.pfdSettingsModel.set('position',
              self.pfdSettingsModel.TOPRIGHT);
        }
      });

      this.pfdPositionDown.click(function() {
        if (self.pfdPositionLeft.hasClass('active')) {
          self.pfdSettingsModel.set('position',
              self.pfdSettingsModel.BOTTOMLEFT);
        } else {
          self.pfdSettingsModel.set('position',
              self.pfdSettingsModel.BOTTOMRIGHT);
        }
      });

      this.pfdSettingsModel.bind('change', this.onPFDSettingsChange, this);
      this.onPFDSettingsChange();
    },

    onPFDSettingsChange: function() {
      var position = this.pfdSettingsModel.get('position');
      switch (position) {
        case this.pfdSettingsModel.TOPLEFT:
          this.pfdPositionLeft.button('toggle');
          this.pfdPositionUp.button('toggle');
          break;
        case this.pfdSettingsModel.TOPRIGHT:
          this.pfdPositionRight.button('toggle');
          this.pfdPositionUp.button('toggle');
          break;
        case this.pfdSettingsModel.BOTTOMLEFT:
          this.pfdPositionLeft.button('toggle');
          this.pfdPositionDown.button('toggle');
          break;
        case this.pfdSettingsModel.BOTTOMRIGHT:
          this.pfdPositionRight.button('toggle');
          this.pfdPositionDown.button('toggle');
          break;
      }
    }
  });
});

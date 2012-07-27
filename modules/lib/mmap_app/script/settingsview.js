
$(function(){
  window.Mavelous = window.Mavelous || {};
  Mavelous.SettingsView = Backbone.View.extend({
    initialize: function () {
      var self = this;
      /* Settings pane elements (jquery): */
      this.modal       = this.options.modal;
      this.modalToggle = this.options.modalToggle;

      this.modalToggle.click(function () {
        self.modal.modal('toggle');
      });

      /* Map models: */
      this.mapProviderModel = this.options.mapProviderModel;
      this.mapModel         = this.options.mapModel;
      /* Map settings elements (jquery): */
      this.mapProviderPicker = this.options.mapProviderPicker;
      this.mapZoomSlider     = this.options.mapZoomSlider;
      this.mapZoomValue      = this.options.mapZoomValue;

      this.setupMapProviderPicker();
      this.setupMapZoomSlider();
      
      /* PFD Settings model: */
      this.pfdSettingsModel = this.options.pfdSettingsModel;
      /* PFD Settings elements (jquery): */
      this.pfdPositionLeft  = this.options.pfdPositionLeft;
      this.pfdPositionRight = this.options.pfdPositionRight;

      this.setupPFDSettings();
    },

    /* MAP SETTINGS ROUTINES */

    setupMapProviderPicker: function () {
      var self = this;
      _.each( this.mapProviderModel.providers, function (provider, name) {
        self.mapProviderPicker.append('<option value="' + name + '">' +
                        provider.description + '</option>'); 
      });
      this.mapProviderPicker.change( function() {
        var newprovider = self.mapProviderPicker.val();
        self.mapProviderModel.set('provider', newprovider);
      });
    },

    setupMapZoomSlider: function () {
      var self = this;
      this.mapZoomSlider.change(function() {
        self.mapModel.setZoom(self.mapZoomSlider.val());
      });
      this.mapModel.bind('change:zoom', this.onZoomChange, this);
      this.onZoomChange();
    },

    onZoomChange: function () {
      this.mapZoomSlider.val(this.mapModel.get('zoom'));
      this.mapZoomValue.html(this.mapModel.get('zoom').toString());
    },

    /* PFD SETTINGS ROUTINES */

    setupPFDSettings: function () {
      var self = this;
      this.pfdPositionLeft.click(function(){
        self.pfdSettingsModel.set('position', self.pfdSettingsModel.TOPLEFT);
      });

      this.pfdPositionRight.click(function(){
        self.pfdSettingsModel.set('position', self.pfdSettingsModel.TOPRIGHT);
      });

      this.pfdSettingsModel.bind('change', this.onPFDSettingsChange, this);
      this.onPFDSettingsChange();
    },

    onPFDSettingsChange: function () {
      var position = this.pfdSettingsModel.get('position');
      switch(position) {
        case this.pfdSettingsModel.TOPLEFT:
          this.pfdPositionLeft.button('toggle');
          break;
        case this.pfdSettingsModel.TOPRIGHT:
          this.pfdPositionRight.button('toggle');
          break;
        case this.pfdSettingsModel.BOTTOMLEFT:
          break;
        case this.pfdSettingsModel.BOTTOMRIGHT:
          break;
        default:
          console.log('pfdview fail');
      }
    }
  });
});

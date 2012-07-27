
$(function(){
  window.Mavelous = window.Mavelous || {};
  Mavelous.SettingsView = Backbone.View.extend({
    initialize: function () {
      var self = this;
      this.mapProviderModel = this.options.mapProviderModel;
      this.mapModel         = this.options.mapModel;

      this.modal       = this.options.modal;
      this.modalToggle = this.options.modalToggle;

      this.modalToggle.click(function () {
        self.modal.modal('toggle');
      });

      this.mapProviderPicker = this.options.mapProviderPicker;
      this.setupMapProviderPicker();
      this.mapZoomSlider = this.options.mapZoomSlider;
      this.setupMapZoomSlider();
    },

    render: function () {

    },

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
    }
  });
});

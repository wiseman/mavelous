$(function(){
  window.Mavelous = window.Mavelous || {};

  Mavelous.MMapSettingsView = Backbone.View.extend({
    template: _.template(
                'Map: <select id="mapproviderpicker"></select>' +
                'Zoom: <input id="mapzoom" type="range" min="1" max="18">'),

    initialize: function () {
      this.providerModel = this.options.providerModel;
      this.mapModel      = this.options.mapModel;
      this.mapModel.bind('change:zoom', this.onZoomChange, this);
      $('#mapsettingsview').html(this.render().el);
      this.setupProviderDropdown();
      this.setupZoomSlider();
    },

    setupProviderDropdown: function () {
      var input_el = $('#mapproviderpicker');
      var self = this;
      _.each( this.providerModel.providers, function (provider, name) {
        input_el.append('<option value="' + name + '">' +
                        provider.description + '</option>'); 
      });
      input_el.change(function() {
        var newprovider = input_el.val();
        self.providerModel.set('provider', newprovider);
      });
    },
  
    setupZoomSlider: function () {
      var self = this;
      this.zoomSlider_el = $('#mapzoom');
      this.zoomSlider_el.val(this.mapModel.get('zoom'));
      this.zoomSlider_el.change(function() {
        self.mapModel.setZoom(self.zoomSlider_el.val());
      });
    },

    onZoomChange: function () {
      var zoom = this.mapModel.get('zoom');
      this.zoomSlider_el.val(zoom);
    },

    render: function () {
      this.$el.html(this.template({}));
      return this;
    }
  });
});


$(function(){

  window.MMapView = Backbone.View.extend({
    initialize: function () {
      var self = this;

      this.providerModel = this.options.providerModel;
      this.mapModel      = this.options.mapModel;

      this.providerModel.bind('change:provider', this.onProviderChange, this);
      this.mapModel.bind('change:zoom', this.onZoomChange, this);
      this.mapModel.bind('change', this.onCenterChange, this);

      /* Setup instance variables: */
      var p = this.providerModel.getProvider();
      p.constructor( function (provider) {
       self.mapLayer    = new MM.Layer(provider);
       self.map = new MM.Map('map', self.mapLayer, undefined, []);
       self.markerLayer = new MM.MarkerLayer();
       self.map.addLayer(self.markerLayer);

       self.onZoomChange();
       self.onCenterChange();
      });

    },

    onProviderChange: function () {
      var self = this;
      console.log('MMapView.onProviderChange: ' +
            this.providerModel.get('provider'));
      var p = this.providerModel.getProvider();
      p.constructor(function (provider) {
        self.mapLayer.setProvider(provider);
      });
    },

    onZoomChange: function () {
      var z = this.mapModel.get('zoom');
      this.map.setZoom(z);
    },

    onCenterChange: function () {
      var m = this.mapModel.toJSON();
      this.map.setCenter({ lat: m.lat, lon: m.lon });
    }
  });
});

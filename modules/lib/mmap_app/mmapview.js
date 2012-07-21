
$(function(){

  window.MMapView = Backbone.View.extend({
    initialize: function () {
      var self = this;

      this.providerModel = this.options.providerModel;
      this.mapModel      = this.options.mapModel;


      /* Setup instance variables: */
      var p = this.providerModel.getProvider();
      p.constructor( function (provider) {
        self.mapLayer    = new MM.Layer(provider);
        self.map = new MM.Map('map', self.mapLayer, undefined, []);
        self.markerLayer = new MM.MarkerLayer();
        self.map.addLayer(self.markerLayer);

        self.onZoomChange();
        self.onCenterChange();

        self.providerModel.bind('change:provider',self.onProviderChange, self);
        self.mapModel.bind('change:zoom', self.onZoomChange, self);
        self.mapModel.bind('change', self.onCenterChange, self);
      });

    },

    onProviderChange: function () {
      var self = this;
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

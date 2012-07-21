
$(function(){

  window.MMapView = Backbone.View.extend({
    initialize: function () {
      var self = this;

      this.providerModel = this.options.providerModel;
      this.mapModel      = this.options.mapModel;
      this.guideModel    = this.options.guideModel;


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

    setupMapHandlers: function (map) {
        /* Need to do something to bind models to these handlers before
         * passing them to be initialzed by the MM.Map constructor... */
        self.mapHandlers =  [
          new MMHandlers.MouseWheelHandler( self.map, self.mapModel ),
          new MMHandlers.TouchHandler( self.map, self.mapModel, self.guideModel ),
          new MMHandlers.MouseWheelHandler( self.map, self.mapModel ),
        ]
    }

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

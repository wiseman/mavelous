
$(function(){

  window.MMapView = Backbone.View.extend({
    initialize: function () {
      var self = this;
      this.providerModel = this.options.providerModel;
      this.providerModel.bind('change', this.onProviderChange, this);

      /* Setup instance variables: */
      var p = this.providerModel.getProvider();
      p.constructor( function (provider) {
       self.mapLayer    = new MM.Layer(provider);
       self.map = new MM.Map('map', self.mapLayer, undefined, []);
       self.markerLayer = new MM.MarkerLayer();
       self.map.addLayer(self.markerLayer);
      });

    },

    render: function () {


    },

    onProviderChange: function () {
      var self = this;
      var p = this.providerModel.getProvider();
      p.constructor(function (provider) {
        self.mapLayer.setProvider(provider);
      });
    }

  });
});

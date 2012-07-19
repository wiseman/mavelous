
$(function(){

  window.MMapView = Backbone.View.extend({
    initialize: function () {
      this.providerModel = this.options.providerModel;
      this.providerModel.bind('change', this.onProviderChange, this);

      /* Setup instance variables: */
      var provider = this.providerModel.getProvider().constructor();

      this.mapLayer    = new MM.Layer(provider);
      this.markerLayer = new MM.MarkerLayer();
      this.map = new MM.Map('map', this.mapLayer, undefined, []);
      this.map.addLayer(this.markerLayer);

    },

    render: function () {


    },

    onProviderChange: function () {
      var provider = this.providerModel.getProvider();
      this.mapLayer.setProvider(provider.constructor());
    }

  });
});

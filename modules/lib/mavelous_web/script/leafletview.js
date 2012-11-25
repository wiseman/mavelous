
$(function(){
  window.Mavelous = window.Mavelous || {};

  Mavelous.LeafletView = Backbone.View.extend({
    initialize: function () {

      this.windowModel = this.options.windowModel;

      var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png';

      var cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18});
      this.map = new L.Map('map', {
        layers: [cloudmade],
        zoomControl: false,
        attributionControl: false
      });

      
      /* Setup instance variables: */
      this.windowModel.bind('change', this.onWindowChange , this);

      this.onWindowChange();

    },

    onWindowChange: function () {
      var m = this.windowModel.toJSON();
      console.log('leafletview: setting view to ' + m.lat.toString() + ', ' + m.lon.toString() + ' zoom '+ m.zoom.toString() );
      this.map.setView(new L.LatLng( m.lat, m.lon), m.zoom);
    },

    onProviderChange: function () {
      var p = this.providerModel.getProvider();
      p.constructor(_.bind(function (provider) {
        this.mapLayer.setProvider(provider);
      }, this));
    }

  });
});

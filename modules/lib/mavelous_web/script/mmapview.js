
$(function(){
  window.Mavelous = window.Mavelous || {};

  Mavelous.MMapView = Backbone.View.extend({
    initialize: function () {

      this.windowModel = this.options.windowModel;

      /* Setup instance variables: */
      var template = 'http://{S}tile.openstreetmap.org/{Z}/{X}/{Y}.png';
      var subdomains = [ '', 'a.', 'b.', 'c.' ];
      this.mapLayer = new MM.TemplatedLayer(template, subdomains);

      var inputhandlers = [ new Mavelous.MouseHandler()
                          , new Mavelous.TouchHandler() ];

      this.map = new MM.Map('map', this.mapLayer, null, inputhandlers)

      this.windowModel.bind('change:zoom', this.onZoomChange, this);
      this.windowModel.bind('change', this.onWindowChange , this);

      this.onWindowChange();

    },

    onZoomChange: function () {
      var z = this.windowModel.get('zoom');
      console.log('mmapview: setting zoom to ' + z.toString());
      this.map.setZoom(z);
    },

    onWindowChange: function () {
      var m = this.windowModel.toJSON();
      console.log('mmapview: setting center to ' + m.lat.toString() + ', ' + m.lon.toString());
      this.map.setCenter({ lat: m.lat, lon: m.lon });
    },

    onProviderChange: function () {
      var p = this.providerModel.getProvider();
      p.constructor(_.bind(function (provider) {
        this.mapLayer.setProvider(provider);
      }, this));
    }

  });
});

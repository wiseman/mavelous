
$(function(){
  window.Mavelous = window.Mavelous || {};

  Mavelous.MMapView = Backbone.View.extend({
    initialize: function () {
      var self = this;

      this.providerModel = this.options.providerModel;
      this.mapModel      = this.options.mapModel;
      this.guideModel    = this.options.guideModel;

      this.guideWaypoint = null;

      /* Setup instance variables: */
      var p = this.providerModel.getProvider();
      p.constructor( function (provider) {
        self.mapLayer    = new MM.Layer(provider);

        self.mapHandlers =
          [ new MMHandlers.MouseWheelHandler( self.mapModel ),
            new MMHandlers.TouchHandler( self.mapModel, self.guideModel ),
            new MMHandlers.DoubleClickHandler( self.guideModel )
          ];
        self.map = new MM.Map('map', self.mapLayer, undefined,self.mapHandlers);
        self.markerLayer = new MM.MarkerLayer();
        self.map.addLayer(self.markerLayer);

        self.onZoomChange();
        self.onCenterChange();

        self.providerModel.bind('change:provider',self.onProviderChange, self);
        self.mapModel.bind('change:zoom', self.onZoomChange, self);
        self.mapModel.bind('change', self.onCenterChange, self);
        self.guideModel.bind('change', self.onGuideWaypointChange, self);
      });

    },

    onGuideWaypointChange: function () {
      var loc = this.guideModel.toJSON();
      if (this.guideWaypoint) {
        this.guideWaypoint.coord = this.map.locationCoordinate(loc);
        this.markerLayer.repositionMarker(this.guideWaypoint);
      } else {
        this.guideWaypoint = this.createWaypoint(loc, "mapmarker.png", 50, 50);
      }
    },

    createWaypoint: function (location, imageurl, width, height) {
      var el = document.createElement('div');
      el.innerHTML = '<img src="' + imageurl + '"' +
                     ' width="' + width.toString() + '"' +
                     ' height="' + height.toString() + '">';
      el.pixelOffset = { x: -1*width/2 , y: -1*height };
      this.markerLayer.addMarker(el, location);
      return el;
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

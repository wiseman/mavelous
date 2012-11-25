

$(function(){
  window.Mavelous = window.Mavelous || {};

  Mavelous.MMapInputProxy = function (opts) {
    this.windowModel = opts.windowModel;
  };

  Mavelous.MMapInputProxy.prototype = {
    /* windowModel: model for lat/lon/zoom of center of map */
    windowModel: null,
    /* map: MM.Map provides context for point, coord, location transforms */
    map: null,
    
    /* Input Handler will give you the map context during her init. 
     * (The map context isn't available until created with input handlers in
     * constructor.) */
    mapContext: function (m) {
      this.map = m;
    },

    zoomByAbout: function (zoomOffset, point) {
      /* Transform pixel-frame point to lat/lon/zoom location */
      var loc = this.map.pointLocation(point);
      var currentCoord = this.map.coordinate;
      /* Zoom the current coordinate (zoomBy has no effects, returns new
       * MM.Coordinate) and use map's bound checker */
      var newCoord = this.map.enforceLimits(currentCoord.zoomBy(zoomOffset));
      /* Center the window at the lat/lon from the orig point. Use the bound
       * checked zoom from the new point. */
      this.windowModel.set({ lat: loc.lat, lon: loc.lon, zoom: newCoord.zoom });
    },

    panBy: function (dx, dy) {
      console.log('pan by ' + dx.toString() + ', ' + dy.toString());
      var currentCoord = this.map.coordinate;
      var pannedCoord = new MM.Coordinate( 
                              currentCoord.row    - (dy / this.map.tileSize.y),
                              currentCoord.column - (dx / this.map.tileSize.x),
                              currentCoord.zoom);
      console.log([currentCoord, pannedCoord]);
      var newCoord = this.map.enforceLimits(pannedCoord);
      var newLoc = this.map.coordinateLocation(newCoord);
      this.windowModel.set({ lat: newLoc.lat, lon: newLoc.lon });
    }
  };
});

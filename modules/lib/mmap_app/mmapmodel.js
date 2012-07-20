
$(function(){

  window.MMapModel = Backbone.Model.extend({
    defaults: function () {
      return { lat: 45.51947, lon: -122.6341, zoom: 18 };
    },

    validate: function ( attrs ) {
      if ( attrs.zoom > 19 ) return "zoom too high";
      if ( attrs.zoom < 0 )  return "zoom too low";
    },

    initialize: function () {
      console.log('mmap model initialize');
    },

    withGpsModel: function ( gps ) {
      this.gps = gps;
      this.gps.bind('change', this.onGps, this);
    },

    onGps: function () {
      var gpslat = this.gps.get('lat');
      var gpslon = this.gps.get('lon');
      console.log("mmapmodel newlat:" + gpslat.toString());
      this.set({ lat: gpslat / 1.0e7, lon: gpslon / 1.0e7});
    }
  });
});


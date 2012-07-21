
$(function(){

  window.MMapModel = Backbone.Model.extend({
    WIDE_ZOOM: 2,
    TIGHT_ZOOM: 16,
    defaults: function () {
      return { lat: 0, lon: 0, zoom: this.WIDE_ZOOM };
    },

    validate: function ( attrs ) {
      if ( attrs.zoom > 18 ) return "zoom too high";
      if ( attrs.zoom < 1 )  return "zoom too low";
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
      this.set({ lat: gpslat / 1.0e7, lon: gpslon / 1.0e7});
    }
  });
});



$(function(){

  window.MMapModel = Backbone.Model.extend({
    WIDE_ZOOM: 2,
    TIGHT_ZOOM: 16,
    gotgps: false,

    defaults: function () {
      return { lat: 0, lon: 0, zoom: this.WIDE_ZOOM };
    },

    validate: function ( attrs ) {
      if ( attrs.zoom > 18 ) return "zoom too high";
      if ( attrs.zoom < 1 )  return "zoom too low";
    },

    initialize: function () {
      this.gotgps = false;
      console.log('mmap model initialize');
    },

    withGpsModel: function ( gps ) {
      this.gps = gps;
      this.gps.bind('change', this.onGps, this);
    },

    onGps: function () {
      var gpslat = this.gps.get('lat');
      var gpslon = this.gps.get('lon');
      var state = { lat: gpslat / 1.0e7, lon: gpslon / 1.0e7 };

      if ( gpslat != 0 && gpslon != 0 && this.gotgps == false ) {
        this.gotgps = true;
        state.zoom = this.TIGHT_ZOOM;
      }
      this.set(state);
    },
    }
  });
});


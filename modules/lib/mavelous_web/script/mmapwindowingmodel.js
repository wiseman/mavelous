
$(function(){
  window.Mavelous = window.Mavelous || {};

  Mavelous.MMapWindowingModel = Backbone.Model.extend({
    WIDE_ZOOM: 2,
    TIGHT_ZOOM: 16,

    defaults: function () {
      return { lat: 0
             , lon: 0
             , zoom: this.WIDE_ZOOM
             , initialized: false
             , snapToVehicle: false
             };
    },

    validate: function ( attrs ) {
      if ( attrs.zoom > 18 ) return "zoom too high";
      if ( attrs.zoom < 1 )  return "zoom too low";
    },

    initialize: function () {
      var mavlink = this.get('mavlinkSrc');
      this.vehicleGps = mavlink.subscribe('GPS_RAW_INT',
                          this.onVehicleGps, this);
    },

    onVehicleGps: function () {
      var veh = this.vehicleGps.toJSON();
      if (this.get('initialized') === false) {
        this.set({ lat: veh.lat / 1.0e7
                 , lon: veh.lon / 1.0e7
                 , zoom: this.TIGHT_ZOOM
                 , initialized: true
                 });
      } else if (this.get('snapToVehicle')) {
        this.set({ lat: veh.lat / 1.0e7
                 , lon: veh.lon / 1.0e7
                 });
      }

    },

    zoomBy: function (delta) {
      this.set('zoom', this.get('zoom') + parseFloat(delta));
    },

    setZoom: function (z) {
      this.set('zoom', parseFloat(z));
    },

    getZoom: function () {
      return this.get('zoom');
    }
  });
});



$(function() {
  window.Mavelous = window.Mavelous || {};

  /* Simple proxy to translate from GPS_RAW_INT mavproxy positions to
   * Leaflet's L.LatLng position. */

  Mavelous.VehicleLeafletPosition = Backbone.Model.extend({
    defaults: function() {
      return { position: null, heading: 0 };
    },

    initialize: function() {
      var mavlink = this.get('mavlinkSrc');
      this.vehicleGps = mavlink.subscribe('GPS_RAW_INT',
          this.withVehicleGps, this);
      this.vehicleHead = mavlink.subscribe('VFR_HUD',
          this.withVehicleHead, this);
    },

    withVehicleGps: function() {
      var veh = this.vehicleGps.toJSON();
      this.set('position', new L.LatLng(veh.lat / 1.0e7, veh.lon / 1.0e7));
    },

    withVehicleHead: function() {
      var h = this.vehicleHead.get('heading');
      this.set('heading', h);
    }
  });
});


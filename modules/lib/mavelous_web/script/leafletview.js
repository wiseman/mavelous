
$(function(){
  window.Mavelous = window.Mavelous || {};

  var droneMarkerSm = L.Icon.extend({
    options: {
      iconUrl: 'image/drone-sm.png',
      shadowUrl: null,
      iconAnchor: new L.Point(75, 50),
      iconSize: new L.Point(150, 100)
    }
  });

  var droneMarkerTiny = L.Icon.extend({
    options: {
      iconUrl: 'image/drone-tiny.png',
      shadowUrl: null,
      iconAnchor: new L.Point(37, 25),
      iconSize: new L.Point(75, 50)
    }
  });

  Mavelous.LeafletView = Backbone.View.extend({
    initialize: function () {

      this.vehicleModel = this.options.vehicle;
      this.providerModel = this.options.provider;
      this.initializedposition = false;

      this.tileLayer = this.providerModel.getProvider();
      this.map = new L.Map('map', {
        layers: [this.tileLayer],
        zoomControl: false,
        attributionControl: false
      });

      this.providerModel.bind('change', this.providerChange, this);

      this.vehicleModel.bind('change', this.panMapToVehicle, this);
      this.vehicleModel.bind('change', this.updateVehicleMarker, this);
      this.vehicleModel.bind('change', this.updateVehiclePath, this);
    },

    providerChange: function () {
      this.map.removeLayer(this.tileLayer);
      this.tileLayer = this.providerModel.getProvider();
      this.map.addLayer(this.tileLayer);
    },

    panMapToVehicle: function () {
      var p = this.vehicleModel.get('position');
      if (!p) return;
      if ( !this.initializedposition ) {
        this.map.setView(p, 16);
        this.initializedposition = true;
      }
    },

    updateVehicleMarker: function () {
      var p = this.vehicleModel.get('position');
      var h = this.vehicleModel.get('heading');
      if (!p || !h) return;
      if (this.vehicleMarker === undefined) {
        this.vehicleMarker = new L.Marker(p,
            { icon: new droneMarkerTiny,
              iconAngle: h });
        this.map.addLayer(this.vehicleMarker);
      } else {
        this.vehicleMarker.setLatLng(p);
        this.vehicleMarker.setIconAngle(h);
      }
    },

    updateVehiclePath: function () {
      var p = this.vehicleModel.get('position');
      if (!p) return;
      if (this.vehiclePath === undefined) {
        this.vehiclePath = new L.Polyline([p], {color: 'red'});
        this.vehiclePath.addTo(this.map);
      } else {
        this.vehiclePath.addLatLng(p);
      }
    }
  });
});

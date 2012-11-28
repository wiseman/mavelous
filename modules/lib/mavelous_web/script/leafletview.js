
$(function(){
  window.Mavelous = window.Mavelous || {};
  var markerIcon = L.Icon.extend(
    { options:
      { iconUrl: 'third_party/leaflet/images/marker-icon.png'
      , shadowUrl: 'third_party/leaflet/images/marker-shadow.png'
      , iconAnchor: new L.Point(13,41)
      , iconSize: new L.Point(25,41)
      }
    });

  Mavelous.LeafletView = Backbone.View.extend({
    initialize: function () {

      this.vehicleModel = this.options.vehicle;
      this.vehicleIconModel = this.options.vehicleIcon;;
      this.providerModel = this.options.provider;
      this.guideModel = this.options.guideModel;
      this.initializedposition = false;

      this.tileLayer = this.providerModel.getProvider();
      this.map = new L.Map('map', {
        layers: [this.tileLayer],
        zoomControl: false,
        doubleClickZoom: false,
        attributionControl: false
      });


      this.providerModel.bind('change', this.providerChange, this);

      this.vehicleIconModel.bind('change', this.vehicleIconChange, this);

      this.vehicleModel.bind('change', this.panMapToVehicle, this);
      this.vehicleModel.bind('change', this.updateVehicleMarker, this);
      this.vehicleModel.bind('change', this.updateVehiclePath, this);

      this.map.addEventListener('dblclick', this.doubleClickHandler, this);

      this.guideModel.bind('change', this.updateGuideMarker, this);
    },

    doubleClickHandler: function (e) {
      this.guideModel.setTarget({ lat: e.latlng.lat, lon: e.latlng.lng })
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
            { icon: this.vehicleIconModel.getIcon(),
              iconAngle: h });
        this.map.addLayer(this.vehicleMarker);
      } else {
        this.vehicleMarker.setLatLng(p);
        this.vehicleMarker.setIconAngle(h);
      }
    },

    vehicleIconChange: function () {
      var p = this.vehicleModel.get('position');
      var h = this.vehicleModel.get('heading');
      if (!p || !h) return;
      this.map.removeLayer(this.vehicleMarker);
      this.vehicleMarker = new L.Marker(p,
          { icon: this.vehicleIconModel.getIcon(),
            iconAngle: h });
      this.map.addLayer(this.vehicleMarker);
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
    },

    updateGuideMarker: function () {
      var p = this.guideModel.toJSON();
      var latlng = new L.LatLng(p.lat, p.lon);
      if (!p) return;
      if (this.guideMarker === undefined) {
        this.guideMarker = new L.Marker(latlng,
            { icon: new markerIcon()});
        this.map.addLayer(this.guideMarker);
      } else {
        this.guideMarker.setLatLng(latlng);
      }
    },

  });
});

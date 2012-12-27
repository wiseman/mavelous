goog.provide('Mavelous.LeafletView');

var markerIcon = L.Icon.extend({
  'options': {
    'iconUrl': 'third_party/leaflet/images/marker-icon.png',
    'shadowUrl': 'third_party/leaflet/images/marker-shadow.png',
    'iconAnchor': new L.Point(13, 41),
    'iconSize': new L.Point(25, 41)
  }
});



/**
 * @param {Object} properties The view properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.LeafletView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.LeafletView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.LeafletView.prototype.initialize = function() {
  this.vehicleModel = this.options['vehicle'];
  this.vehicleIconModel = this.options['vehicleIcon'];
  this.providerModel = this.options['provider'];
  this.guideModel = this.options['guideModel'];
  this.panModel = this.options['panModel'];
  this.initializedcenter = false;

  this.tileLayer = this.providerModel.getProvider();
  this.map = new L.Map('map', {
    'layers': [this.tileLayer],
    'zoomControl': false,
    'doubleClickZoom': false,
    'attributionControl': false,
    'maxZoom': 21
  });

  this.providerModel.bind('change', this.providerChange, this);
  this.vehicleIconModel.bind('change', this.vehicleIconChange, this);
  this.panModel.bind('change:center', this.panModelChange, this);
  this.map.addEventListener(
      'dragstart',
      function() {
        this.panModel.cancelTracking();
      },
      this);
  this.vehicleModel.bind('change', this.updateVehicleMarker, this);
  this.vehicleModel.bind('change', this.updateVehiclePath, this);
  this.map.addEventListener('dblclick', this.doubleClickHandler, this);
  this.guideModel.bind('change', this.updateGuideMarker, this);
};


/**
 * Handles double clicks.
 * @param {{latlng: {lat: number, lng: number}}} e The double click event.
 */
Mavelous.LeafletView.prototype.doubleClickHandler = function(e) {
  this.guideModel.setTarget({ 'lat': e.latlng.lat, 'lon': e.latlng.lng });
};


/**
 * Called when the user selects a new map provider.
 */
Mavelous.LeafletView.prototype.providerChange = function() {
  this.map.removeLayer(this.tileLayer);
  this.tileLayer = this.providerModel.getProvider();
  this.map.addLayer(this.tileLayer);
};


/**
 * Handles pan model changes.
 */
Mavelous.LeafletView.prototype.panModelChange = function() {
  var center = this.panModel.get('center');
  if (center === undefined) return;
  if (this.initializedcenter) {
    this.map.panTo(center);
  } else {
    this.map.setView(center, 16);
    this.initializedcenter = true;
  }
};


/**
 * Called when the vehicle's position or heading changes.
 */
Mavelous.LeafletView.prototype.updateVehicleMarker = function() {
  if (!this.initializedcenter) return;
  var p = this.vehicleModel.get('position');
  var h = this.vehicleModel.get('heading');
  if (!p || !h) return;
  if (this.vehicleMarker === undefined) {
    this.vehicleMarker = new L.Marker(
        p,
        {
          'icon': this.vehicleIconModel.getIcon(),
          'iconAngle': h
        });
    this.map.addLayer(this.vehicleMarker);
  } else {
    this.vehicleMarker.setLatLng(p);
    this.vehicleMarker.setIconAngle(h);
  }
};


/**
 * Called when the user selects a new vehicle icon.
 */
Mavelous.LeafletView.prototype.vehicleIconChange = function() {
  var p = this.vehicleModel.get('position');
  var h = this.vehicleModel.get('heading');
  if (!p || !h) return;
  this.map.removeLayer(this.vehicleMarker);
  this.vehicleMarker = new L.Marker(
      p,
      {
        'icon': this.vehicleIconModel.getIcon(),
        'iconAngle': h
      });
  this.map.addLayer(this.vehicleMarker);
};


/**
 * Updates the vehicle path when the vehicle model changes.
 */
Mavelous.LeafletView.prototype.updateVehiclePath = function() {
  var p = this.vehicleModel.get('position');
  if (!p) return;
  if (this.vehiclePath === undefined) {
    this.vehiclePath = new L.Polyline([p], {'color': 'red'});
    this.vehiclePath.addTo(this.map);
  } else {
    this.vehiclePath.addLatLng(p);
  }
};


/**
 * Handles changes in the GUIDE mode waypoint.
 */
Mavelous.LeafletView.prototype.updateGuideMarker = function() {
  var p = this.guideModel.toJSON();
  var latlng = new L.LatLng(p['lat'], p['lon']);
  if (!p) return;
  if (this.guideMarker === undefined) {
    this.guideMarker = new L.Marker(latlng,
                                    { 'icon': new markerIcon()});
    this.map.addLayer(this.guideMarker);
  } else {
    this.guideMarker.setLatLng(latlng);
  }
};

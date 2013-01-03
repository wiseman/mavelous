/**
 * @fileoverview Leaflet externs.
 * @author jjwiseman@gmail.com (John Wiseman)
 * @externs
 */


/**
 * @type {Object}
 * @const
 */
var L = {};


/**
 * @type {Object}
 * @const
 */
L.Mixin = {};



/**
 * @constructor
 */
L.Mixin.Events = function() {};


/**
 * @param {string} type
 * @param {Object=} opt_data
 * @return {L.Mixin.Events}
 */
L.Mixin.Events.prototype.fire = function(type, opt_data) {};


/**
 * @type {Object}
 */
L.Browser = {};


/** @type {boolean} */
L.Browser.touch;


/** @type {boolean} */
L.Browser.android23;



/**
 * @param {Object} options
 * @constructor
 */
L.Icon = function(options) {};



/**
 * @param {number} lat
 * @param {number} lng
 * @constructor
 */
L.LatLng = function(lat, lng) {};


/** @type {number} */
L.LatLng.prototype.lat;


/** @type {number} */
L.LatLng.prototype.lng;



/**
 * @param {number} x
 * @param {number} y
 * @constructor
 */
L.Point = function(x, y) {};


/**
 * @param {L.Point} point
 * @return {L.Point}
 */
L.Point.prototype.subtract = function(point) {};



/**
 * @param {string} apiKey
 * @param {Object} config
 * @constructor
 */
L.BingLayer = function(apiKey, config) {};



/**
 * @param {string} url
 * @param {Object} config
 * @constructor
 */
L.TileLayer = function(url, config) {};



/**
 * @param {Element|string} id
 * @param {Object=} opt_config
 * @constructor
 * @extends {L.Mixin.Events}
 */
L.Map = function(id, opt_config) {};


/**
 * @param {L.ILayer} layer
 */
L.Map.prototype.addLayer = function(layer) {};


/**
 * @return {number}
 */
L.Map.prototype.getZoom = function() {};


/**
 * @param {L.LatLng} latlng
 */
L.Map.prototype.panTo = function(latlng) {};


/**
 * @param {string} type
 * @param {Function} fn
 * @param {Object=} opt_context
 */
L.Map.prototype.addEventListener = function(type, fn, opt_context) {};


/**
 * @param {L.ILayer} layer
 */
L.Map.prototype.removeLayer = function(layer) {};


/**
 * @param {L.LatLng} center
 * @param {number} zoom
 * @param {boolean=} opt_forceReset
 */
L.Map.prototype.setView = function(center, zoom, opt_forceReset) {};


/**
 * @param {number} zoom
 */
L.Map.prototype.setZoom = function(zoom) {};


/**
 * @param {L.LatLng} center
 * @param {number=} opt_zoom
 * @return {L.Point}
 * @protected
 */
L.Map.prototype._getNewTopLeftPoint = function(center, opt_zoom) {};


/**
 * @return {L.Point}
 * @protected
 */
L.Map.prototype._getTopLeftPoint = function() {};


/**
 * @param {L.Point} offset
 * @protected
 */
L.Map.prototype._rawPanBy = function(offset) {};



/**
 * @constructor
 */
L.ILayer = function() {};



/**
 * @param {L.LatLng} latlng
 * @param {Object=} opt_options
 * @constructor
 */
L.Marker = function(latlng, opt_options) {};


/**
 * @param {L.LatLng} latlng
 */
L.Marker.prototype.setLatLng = function(latlng) {};


/**
 * @param {number} angle
 */
L.Marker.prototype.setIconAngle = function(angle) {};



/**
 * @param {Array.<L.LatLng>} latlngs
 * @param {Object=} opt_options
 * @constructor
 */
L.Polyline = function(latlngs, opt_options) {};


/**
 * @param {L.Map} map
 */
L.Polyline.prototype.addTo = function(map) {};


/**
 * @param {L.LatLng} latlng
 */
L.Polyline.prototype.addLatLng = function(latlng) {};



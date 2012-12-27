goog.provide('Mavelous.LeafletDroneIconModel');



/**
 * Keeps track of which icon to use for the drone.
 *
 * @param {Object=} opt_properties Model properties.
 * @constructor
 * @extends {Backbone.Model}
 */
Mavelous.LeafletDroneIconModel = function(opt_properties) {
  goog.base(this, opt_properties);
};
goog.inherits(Mavelous.LeafletDroneIconModel, Backbone.Model);


/**
 * @override
 * @export
 */
Mavelous.LeafletDroneIconModel.prototype.defaults = function() {
  return {
    'icon': 'predatorsmall'
  };
};


/**
 * Returns the current icon object.
 * @return {Object} The current icon object.
 */
Mavelous.LeafletDroneIconModel.prototype.getIcon = function() {
  var name = this.get('icon');
  var iconSpec = Mavelous.LeafletDroneIconModel.Icons[name];
  return new iconSpec.constructor();
};


/**
 * Possible icons
 * @enum {Object}
 */
Mavelous.LeafletDroneIconModel.Icons = {
  'predatorsmall': {
    description: 'Predator (small)',
    constructor: L.Icon.extend({options: {
      'iconUrl': 'image/drone-tiny.png',
      'shadowUrl': null,
      'iconAnchor': new L.Point(37, 25),
      'iconSize': new L.Point(75, 50)
    }})
  },
  'predator': {
    description: 'Predator',
    constructor: L.Icon.extend({options: {
      'iconUrl': 'image/drone-sm.png',
      'shadowUrl': null,
      'iconAnchor': new L.Point(75, 50),
      'iconSize': new L.Point(150, 100)
    }})
  },
  'arduplane': {
    description: 'Generic Airplane',
    constructor: L.Icon.extend({options: {
      'iconUrl': 'image/plane.png',
      'shadowUrl': null,
      'iconAnchor': new L.Point(36, 38),
      'iconSize': new L.Point(73, 76)
    }})
  },
  'quad': {
    description: 'Quadcopter',
    constructor: L.Icon.extend({options: {
      'iconUrl': 'image/quad.png',
      'shadowUrl': null,
      'iconAnchor': new L.Point(37, 37),
      'iconSize': new L.Point(75, 75)
    }})
  }
};

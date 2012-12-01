
$(function() {
  window.Mavelous = window.Mavelous || {};

  Mavelous.LeafletDroneIconModel = Backbone.Model.extend({
    defaults: function() {
      return {
        icon: 'predatorsmall'
      };
    },
    icons: {
      predatorsmall: {
        description: 'Predator (small)',
        constructor: L.Icon.extend({options: {
          iconUrl: 'image/drone-tiny.png',
          shadowUrl: null,
          iconAnchor: new L.Point(37, 25),
          iconSize: new L.Point(75, 50)
        }})
      },
      predator: {
        description: 'Predator',
        constructor: L.Icon.extend({options: {
          iconUrl: 'image/drone-sm.png',
          shadowUrl: null,
          iconAnchor: new L.Point(75, 50),
          iconSize: new L.Point(150, 100)
        }})
      },
      arduplane: {
        description: 'Generic Airplane',
        constructor: L.Icon.extend({options: {
          iconUrl: 'image/plane.png',
          shadowUrl: null,
          iconAnchor: new L.Point(36, 38),
          iconSize: new L.Point(73, 76)
        }})
      },
      quad: {
        description: 'Quadcopter',
        constructor: L.Icon.extend({options: {
          iconUrl: 'image/quad.png',
          shadowUrl: null,
          iconAnchor: new L.Point(37, 37),
          iconSize: new L.Point(75, 75)
        }})
      }
    },
    getIcon: function() {
      var name = this.get('icon');
      var i = this.icons[name];
      return new i.constructor();
    }
  });

});

$(function() {
  window.Mavelous = window.Mavelous || {};


  Mavelous.Mission = Backbone.Model.extend({
    defaults: function() {
      return {
        waypoints: []
    };
  });


  Mavelous.MissionPlanner = function(map, options) {
    this.init(map, options);
  };

  Mavelous.MissionPlanner.prototype = {
    map: null,

    init: function(map, options) {
      this.map = map;
    }
  };
});

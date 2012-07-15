

$(function(){
  window.MetaWaypointModel = Backbone.Model.extend({

    defaults: function() {
      return {
        /* TODO some sort of stateful initialized flag
         * How do I hook that into the Model set({}) method?
         * Or do I do that elsewhere?  */
        waypoint: {
          alt : 0,
          lat : 0,
          lon : 0
        }
      };
    },

    initialize: function() {
      console.log("metawaypoint model initialize");
    }
  });

});

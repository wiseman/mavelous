

$(function(){
  window.MetaWaypointModel = Backbone.Model.extend({

    defaults: function() {
      return {
        /* Once initialized, a waypoint is a dict with
         * fields { alt : float, lat : float, lon : float } */
        waypoint: null
        }
    },

    initialize: function() {
      console.log("metawaypoint model initialize");
    }
  });

});

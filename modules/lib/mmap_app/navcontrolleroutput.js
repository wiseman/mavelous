
$(function(){
  window.NavControllerOutputModel = Backbone.Model.extend({

    defaults: function() {
      return {
        nav_roll: 0,
        nav_pitch: 0,
        nav_bearing: 0,
        target_bearing: 0,
        wp_dist: 0,
        alt_error: 0,
        aspd_error: 0,
        xtrack_error: 0
      };
    }
  });
});

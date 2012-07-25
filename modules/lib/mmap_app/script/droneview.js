
$(function(){
  window.Mavelous = window.Mavelous || {};
  Mavelous.DroneView = Backbone.View.extend({

    initialize: function () {
      var mavlink = this.options.mavlinkSrc;
      this.model = mavlink.subscribe('VFR_HUD', this.onHeadingChange, this);
      this.drone = document.getElementById('droneicon');
    },

    onHeadingChange: function () {
      this.rotateDrone(this.model.get('heading'));
    },

    rotateDrone : function ( angle ) {
      var rotate = 'rotate(' + (angle) + 'deg);';
      var tr = new Array(
          'transform:' + rotate,
          '-moz-transform:' + rotate,
          '-webkit-transform:' + rotate,
          '-ms-transform:' + rotate,
          '-o-transform:' + rotate
      );
      this.drone.setAttribute('style', tr.join(';'));
    }
  });
});

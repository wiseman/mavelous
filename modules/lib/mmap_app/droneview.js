
$(function(){

  window.DroneView = Backbone.View.extend({

    initialize: function () {
      this.drone = document.getElementById('droneicon');
      this.model.bind('change:heading', this.onHeadingChange, this);
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

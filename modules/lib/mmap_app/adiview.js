
$(function(){

  window.ADIView = Backbone.View.extend({
    adi: null,

    initialize: function() {
      this.adi = new pfd.ADI('adi');
      this.model.bind('change', this.render, this);
    },

    render: function() {
      var mdl = this.model.toJSON();
      this.adi.setAttitude( mdl.pitch, mdl.roll );
      this.adi.draw();
      return this;
    }

  });

});


$(function(){

  window.ADIView = Backbone.View.extend({
    adi: null,

    initialize: function() {
      this.adi = this.options.adi;
      this.model.bind('change', this.render, this);
    },

    render: function() {
      var mdl = this.model.toJSON();
      console.log('adiview render pitch ' + mdl.pitch.toString() );
      this.adi.setAttitude( mdl.pitch, mdl.roll );
      return this;
    }

  });

});

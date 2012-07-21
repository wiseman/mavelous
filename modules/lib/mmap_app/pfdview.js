
$(function(){

  window.PFDView = Backbone.View.extend({
    pfd: null,

    initialize: function() {
      this.pfd = new pfd.PFD('pfd');
      this.model.bind('change', this.render, this);
    },

    render: function() {
      var mdl = this.model.toJSON();
      this.pfd.setAttitude( mdl.pitch, mdl.roll );
      this.pfd.draw();
      return this;
    }

  });

});


$(function(){
  window.VfrHudModel = Backbone.Model.extend({

    defaults: function() {
      return {
        airspeed: 0,
        groundspeed: 0,
        heading: 0,
        throttle: 0,
        alt: 0,
        climb: 0
      };
    },

    initialize: function() {
      console.log("vfr hud model initialize");
    }
  });
 
  window.VfrHudTextView = Backbone.View.extend({
    template: _.template($('#vfrhudtexttemplate').html()),

    initialize: function() {
      $("#vfrhudtextview").replaceWith(this.render().el);
      this.model.bind('change', this.render, this);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }

  });
});

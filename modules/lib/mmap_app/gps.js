
$(function(){
  window.GpsRawIntModel = Backbone.Model.extend({

    defaults: function() {
      return {
        time_usec: 0,
        fix_type: 0,
        lat: 0,
        lon: 0,
        alt: 0,
        eph: 0,
        epv: 0,
        vel: 0,
        cog: 0,
        satellites_visible: 0
      };
    },

    initialize: function() {
      console.log("gps raw int model initialize");
    }
  });

  window.GpsTextView = Backbone.View.extend({
    template: _.template($('#gpstexttemplate').html()),

    initialize: function() {
      $("#gpstextview").replaceWith(this.render().el);
      this.model.bind('change', this.render, this);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }

  });
});

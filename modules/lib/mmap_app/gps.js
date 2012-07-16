
$(function(){
  window.GpsRawIntModel = Backbone.Model.extend({

    defaults: function() {
      return {
        time_usec: 0,
        fix_type: null,
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
      var mdl = this.model.toJSON();
        if (mdl.fix_type >= 3) {
          mdl.fix_type_html = '<span class="ok">3D</span>';
        } else if (mdl.fix_type == 2) {
          mdl.fix_type_html = '<span class="slow">2D</span>';
        } else if (mdl.fix_type == null) {
          mdl.fix_type_html = '<span class="slow">?</span>';
        } else {
          mdl.fix_type_html = '<span class="error">' + mdl.fix_type + '</span>';
        }
      this.$el.html(this.template(mdl));
      return this;
    }

  });
});


$(function(){
  window.Mavelous = window.Mavelous || {};
  
  Mavelous.GpsTextView = Backbone.View.extend({
    template: _.template($('#gpstexttemplate').html()),
    
    initialize: function() {
      var mavlink = this.options.mavlinkSrc;
      this.gps = mavlink.subscribe('GPS_RAW_INT', this.render, this);
      this.render();
    },
    
    render: function() {
      var gps = this.gps;
      var fix_type = gps.get('fix_type');
      if (fix_type >= 3) {
        gps.fix_type_html = '<span class="ok">3D</span>';
      } else if (fix_type == 2) {
        gps.fix_type_html = '<span class="slow">2D</span>';
      } else if (fix_type === null || fix_type === undefined) {
        gps.fix_type_html = '<span class="slow">?</span>';
      } else {
        gps.fix_type_html = '<span class="error">' + fix_type + '</span>';
      }
      this.$el.html(this.template(gps));
      return this;
    }

  });

  Mavelous.GpsButtonView = Backbone.View.extend({
    
    initialize: function() {
      var mavlink = this.options.mavlinkSrc;
      this.$el = this.options.el;
      this.gps = mavlink.subscribe('GPS_RAW_INT', this.render, this);
      this.render();
    },
    
    render: function() {
      var gps = this.gps;
      var fix_type = gps.get('fix_type');
      this.$el.removeClass('btn-success btn-danger btn-warning btn-inverse');
      if (fix_type >= 3) {
        /* 3D Fix */
        this.$el.addClass('btn-success');
        this.$el.html('GPS: 3D');
      } else if (fix_type == 2) {
        /* 2D Fix */
        this.$el.addClass('btn-warning');
        this.$el.html('GPS: 2D');
      } else if (fix_type = 1) {
        /* Nofix */
        this.$el.addClass('btn-danger');
        this.$el.html('GPS: No Lock');
      } else {
        /* NO GPS */
        this.$el.addClass('btn-inverse');
        this.$el.html('GPS: None');
      }
      return this;
    }

  });
});

$(function() {
  window.Mavelous = window.Mavelous || {};

  Mavelous.GpsTextView = Backbone.View.extend({

    initialize: function() {
      var mavlink = this.options.mavlinkSrc;
      this.gps = mavlink.subscribe('GPS_RAW_INT', this.render, this);
      this.render();
    },

    render: function() {
      var gps = this.gps;
      var fix_type = gps.get('fix_type');
      var lclass = 'slow';
      var text = 'GPS: ?';
      if (fix_type >= 3) {
        lclass = 'ok';
        text = 'GPS: 3D';
      } else if (fix_type == 2) {
        lclass = 'slow';
        text = 'GPS: 2D';
      } else if (fix_type === null || fix_type === undefined) {
        lclass = 'slow';
        text = 'GPS: ?';
      } else {
        lclass = 'error';
        text = 'GPS: ' + fix_type;
      }
      var html = '<span class="' + lclass + '">';
      html += '<span class="hidden-phone">' + text + '</span>';
      html += '<i class="icon-globe icon-white visible-phone"></i>';
      html += '</span>';
      this.$el.html(html);
      return this;
    }

  });

  Mavelous.GpsButtonView = Backbone.View.extend({
    initialize: function() {
      var mavlink = this.options.mavlinkSrc;
      this.gps = mavlink.subscribe('GPS_RAW_INT', this.onGPS, this);
      this.stat = mavlink.subscribe('GPS_STATUS', this.onStatus, this);
    },

    registerPopover: function(p) {
      this.popover = p;
      this.popover.on('selected', this.renderPopover, this);
    },

    renderFixType: function(fix_type) {
      this.$el.removeClass('btn-success btn-danger btn-warning btn-inverse');
      var lclass = 'btn-inverse';
      var html = 'GPS: None';
      if (fix_type >= 3) {
        /* 3D Fix */
        lclass = 'btn-success';
        html = 'GPS: 3D';
      } else if (fix_type == 2) {
        /* 2D Fix */
        lclass = 'btn-warning';
        html = 'GPS: 2D';
      } else if (fix_type = 1) {
        /* Nofix */
        lclass = 'btn-danger';
        html = 'GPS: No Lock';
      }
      this.$el.addClass(lclass);
      html = '<span class="hidden-phone">' + html + '</span>';
      html += '<i class="icon-globe icon-white visible-phone"></i>';
      this.$el.html(html);
      return this;
    },

    onGPS: function() {
      var fix_type = this.gps.get('fix_type');
      this.renderFixType(fix_type);
      this.renderPopover(); /* XXX need to tie the loop properly. */
    },

    onStatus: function() {
      this.renderPopover();
    },
    popoverTitle: 'GPS Info',
    renderPopover: function() {
      var stat = this.stat.toJSON();

      var lat = (this.gps.get('lat') / 10e6).toFixed(7);
      var lon = (this.gps.get('lon') / 10e6).toFixed(7);

      var content = '';
      if ('satellites_visible' in stat) {
        var visible = stat.satellites_visible.toString();
        content += ('Satellites: ' + visible +
                    '<br /> Coordinates: ' + lat + ', ' + lon);
      }

      var eph = this.gps.get('eph');
      if (typeof eph != 'undefined' && eph != 65535) {
        content += ('<br />HDOP: ' + (eph / 100).toFixed(2) + 'm');
      }
      var epv = this.gps.get('epv');
      if (typeof epv != 'undefined' && epv != 65535) {
        content += ('<br />VDOP: ' + (epv / 100).toFixed(2) + 'm');
      }

      if (this.popover) {
        this.popover.trigger('content', content);
      }
    }
  });
});

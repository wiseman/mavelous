goog.provide('Mavelous.GpsPopoverViewDelegate');

/**
 * @param {{mavlinkSrc: Mavelous.MavlinkAPI, el: jQuery}} properties View
 *     properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.GpsPopoverViewDelegate = function(properties) {
  this.popoverTitle = 'GPS Info';
  goog.base(this, properties);
};
goog.inherits(Mavelous.GpsPopoverViewDelegate , Backbone.View);

Mavelous.GpsPopoverViewDelegate.prototype.initialize = function() {
  var mavlink = this.options['mavlinkSrc'];
  this.gps = mavlink.subscribe('GPS_RAW_INT', this.render, this);
  this.stat = mavlink.subscribe('GPS_STATUS', this.render, this);
};

Mavelous.GpsPopoverViewDelegate.prototype.popoverCreated = function(el) {
  this.$el = el;
  this.$el.find('.popover-title').text(this.popoverTitle);
  this.render();
};

Mavelous.GpsPopoverViewDelegate.prototype.popoverDestroyed = function() {
  this.$el = null;
};

Mavelous.GpsPopoverViewDelegate.prototype.render = function() {
  if (this.$el) {
    var stat = this.stat.toJSON();

    var lat = (this.gps.get('lat') / 10e6).toFixed(7);
    var lon = (this.gps.get('lon') / 10e6).toFixed(7);

    var content = '';
    if ('satellites_visible' in stat) {
      var visible = stat['satellites_visible'].toString();
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
    this.$el.find('.popover-content').html(content);
  }
};


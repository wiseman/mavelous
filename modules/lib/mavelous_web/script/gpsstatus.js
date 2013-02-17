goog.provide('Mavelous.GpsButtonView');
goog.provide('Mavelous.GpsTextView');

/**
 * @param {{mavlinkSrc: Mavelous.MavlinkAPI, el: jQuery}} properties View
 *     properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.GpsButtonView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.GpsButtonView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.GpsButtonView.prototype.initialize = function() {
  var mavlink = this.options['mavlinkSrc'];
  this.gps = mavlink.subscribe('GPS_RAW_INT', this.onGPS_, this);
};


/**
 * Renders the GPS fix type into the button.
 * @param {number} fix_type The GPS fix type (from the GPS_RAW_INT mavlink
 *     message).
 * @private
 */
Mavelous.GpsButtonView.prototype.renderFixType_ = function(fix_type) {
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
  } else if (fix_type == 1) {
    /* Nofix */
    lclass = 'btn-danger';
    html = 'GPS: No Lock';
  }
  this.$el.addClass(lclass);
  html = '<span class="hidden-phone">' + html + '</span>';
  html += '<i class="icon-globe icon-white visible-phone"></i>';
  this.$el.html(html);
};


/**
 * Handles GPS_RAW_INT mavlink messages.
 * @private
 */
Mavelous.GpsButtonView.prototype.onGPS_ = function() {
  var fix_type = this.gps.get('fix_type');
  this.renderFixType_(fix_type);
};

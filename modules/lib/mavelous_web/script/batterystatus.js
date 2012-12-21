goog.provide('Mavelous.BatteryButton');



/**
 * Battery status button.
 * @param {{mavlinkSrc: Mavelous.MavlinkAPI, el: (Element|jQuery)}} properties
 *     Button properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.BatteryButton = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.BatteryButton, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.BatteryButton.prototype.initialize = function() {
  var mavlink = this.options['mavlinkSrc'];
  this.sysstatus = mavlink.subscribe('SYS_STATUS', this.onSysStatus, this);
  this.$el = this.options['el'];
};


/**
 * Handles SYS_STATUS mavlink messages.
 */
Mavelous.BatteryButton.prototype.onSysStatus = function() {
  var stat = this.sysstatus;
  var remaining = stat.get('battery_remaining');
  var voltage = stat.get('voltage_battery');
  if (remaining < 30) {
    this.setButton_('btn-warning', remaining.toFixed(0) + '%');
  } else if (remaining < 20) {
    this.setButton_('btn-danger',
                    remaining.toFixed(0) + '% ' + voltage.toFixed(1) + 'v');
  } else if (remaining === undefined) {
    this.setButton_('btn-inverse', 'Unknown');
  } else {
    this.setButton_('btn-success', remaining.toFixed(0) + '%');
  }
};


/**
 * Sets the button state.
 * @param {string} cssClass The CSS class.
 * @param {string} textLabel The button label.
 * @private
 */
Mavelous.BatteryButton.prototype.setButton_ = function(cssClass, textLabel) {
  this.$el.removeClass('btn-success btn-warning btn-danger btn-inverse');
  this.$el.addClass(cssClass);
  var html = '<span class="hidden-phone">Batt: ' + textLabel + '</span>';
  html += '<i class="icon-fire icon-white visible-phone"></i>';
  this.$el.html(html);
};

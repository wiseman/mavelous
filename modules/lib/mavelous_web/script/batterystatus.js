goog.provide('Mavelous.BatteryButton');



/**
 * Battery status button.
 * @constructor
 */
Mavelous.BatteryButton = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.BatteryButton, Backbone.View);


Mavelous.BatteryButton.prototype.initialize = function() {
  var mavlink = this.options.mavlinkSrc;
  this.sysstatus = mavlink.subscribe('SYS_STATUS', this.onSysStatus, this);
  this.$el = this.options.el;
};


Mavelous.BatteryButton.prototype.onSysStatus = function() {
  var stat = this.sysstatus;
  var remaining = stat.get('battery_remaining');
  var voltage = stat.get('voltage_battery');
  if (remaining < 30) {
    this.setButton('btn-warning', remaining.toFixed(0) + '%');
  } else if (remaining < 20) {
    this.setButton('btn-danger',
                   remaining.toFixed(0) + '% ' + voltage.toFixed(1) + 'v');
  } else if (remaining === undefined) {
    this.setButton('btn-inverse', 'Unknown');
  } else {
    this.setButton('btn-success', remaining.toFixed(0) + '%');
  }
};


Mavelous.BatteryButton.prototype.setButton = function(c, text) {
  this.$el.removeClass('btn-success btn-warning btn-danger btn-inverse');
  this.$el.addClass(c);
  var html = '<span class="hidden-phone">Batt: ' + text + '</span>';
  html += '<i class="icon-fire icon-white visible-phone"></i>';
  this.$el.html(html);
};

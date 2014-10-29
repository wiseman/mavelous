
goog.provide('Mavelous.FlightModePopoverViewDelegate');

/**
 * Flight mode popover Backbone view.
 * @param {{el: jQuery, modeModel: Mavelous.FlightModeModel, commandModel:
 *     Mavelous.CommandLongModel}} properties View properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.FlightModePopoverViewDelegate = function(properties) {
  this.popoverTitle = 'Flight Commands';
  goog.base(this, properties);
};
goog.inherits(Mavelous.FlightModePopoverViewDelegate , Backbone.View);

/**
 * @override
 * @export
 */
Mavelous.FlightModePopoverViewDelegate.prototype.initialize = function() {
  this.modeModel = this.options['modeModel'];
  this.commandModel = this.options['commandModel'];
};

Mavelous.FlightModePopoverViewDelegate.prototype.popoverCreated = function(el) {
  this.$el = el;
  this.$el.find('.popover-title').text(this.popoverTitle);
  this.setupPopover();
};

Mavelous.FlightModePopoverViewDelegate.prototype.popoverDestroyed = function() {
  this.$el = null;
  this.cleanupSubview('armingButtonView');
  this.cleanupSubview('loiterButtonView');
  this.cleanupSubview('rtlButtonView');
  this.cleanupSubview('landButtonView');
};

Mavelous.FlightModePopoverViewDelegate.prototype.setupPopover = function() {
  var loiter =
      '<a class="btn" id="flightmode-btn-loiter" href="#">Loiter</a>';
  var rtl =
      '<a class="btn" id="flightmode-btn-rtl" href="#">RTL</a>';
  var land =
      '<a class="btn" id="flightmode-btn-land" href="#">Land</a>';
  var arm =
      '<p><a class="btn" id="flightmode-btn-arm" href="#">Arm</a></p>';

  this.$el.find('.popover-content').html(arm + '<br />' + loiter + rtl + land);

  this.armingButtonView = new Mavelous.ArmingButtonView({
    'el': $('#flightmode-btn-arm'),
    'model': this.modeModel
  });

  this.loiterButtonView = new Mavelous.CommandButtonView({
    'el': $('#flightmode-btn-loiter'),
    'model': this.commandModel,
    'command': 'NAV_LOITER_UNLIM'
  });

  this.rtlButtonView = new Mavelous.CommandButtonView({
    'el': $('#flightmode-btn-rtl'),
    'model': this.commandModel,
    'command': 'NAV_RETURN_TO_LAUNCH'
  });

  this.landButtonView = new Mavelous.CommandButtonView({
    'el': $('#flightmode-btn-land'),
    'model': this.commandModel,
    'command': 'NAV_LAND'
  });
};

Mavelous.FlightModePopoverViewDelegate.prototype.cleanupSubview = function (subviewname) {
  if (this[subviewname]) {
    this[subviewname].remove();
    this[subviewname] = null;
  }
};

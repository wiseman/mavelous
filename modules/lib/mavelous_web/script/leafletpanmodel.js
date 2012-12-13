goog.provide('Mavelous.LeafletPanControlView');
goog.provide('Mavelous.LeafletPanModel');



/**
 * @param {Object} properties The view properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.LeafletPanControlView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.LeafletPanControlView, Backbone.View);


/**
 * @inheritDoc
 */
Mavelous.LeafletPanControlView.prototype.initialize = function() {
  this.button = this.options.button;
  this.icon = this.options.icon;
  this.button.click(_.bind(this.onClick, this));
  this.model.on('change:tracking', this.onTrackingChange, this);
  this.onTrackingChange();
};


/**
 * Handles click events on the auto-pan button.
 */
Mavelous.LeafletPanControlView.prototype.onClick = function() {
  if (this.model.get('tracking')) {
    this.model.set('tracking', false);
  } else {
    this.model.set('tracking', true);
  }
};


/**
 * Updates the button based on the auto-pan state.
 */
Mavelous.LeafletPanControlView.prototype.onTrackingChange = function() {
  if (this.model.get('tracking')) {
    this.button.addClass('btn-primary');
    this.icon.removeClass('icon-black');
    this.icon.addClass('icon-white');
  } else {
    this.button.removeClass('btn-primary');
    this.icon.removeClass('icon-white');
    this.icon.addClass('icon-black');
  }
};



/**
 * @param {Object} properties The model properties.
 * @constructor
 * @extends {Backbone.Model}
 */
Mavelous.LeafletPanModel = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.LeafletPanModel, Backbone.Model);


/**
 * @inheritDoc
 */
Mavelous.LeafletPanModel.prototype.defaults = function() {
  return {
    initialized: false,
    tracking: true,
    center: undefined
  };
};


/**
 * @inheritDoc
 */
Mavelous.LeafletPanModel.prototype.initialize = function() {
  this.vehicle = this.get('vehicle');
  this.vehicle.on('change', this.onVehicleChange, this);
};


Mavelous.LeafletPanModel.prototype.onVehicleChange = function() {
  if (!this.get('initialized')) {
    var p = this.vehicle.get('position');
    if (p && p.lat && p.lng) {
      this.set({ center: p, initialized: true });
    }
  } else if (this.get('tracking')) {
    var p = this.vehicle.get('position');
    if (p && p.lat && p.lng) {
      this.set({ center: p });
    }
  }
};


/**
 * Cancels tracking.  Called when the user drags the map.
 */
Mavelous.LeafletPanModel.prototype.cancelTracking = function() {
  this.set('tracking', false);
};

goog.provide('Mavelous.PFDView');

goog.require('Mavelous.PFD');
goog.require('Mavelous.PFDSettingsModel');



/**
 * Primary flight display Backbone view.
 * @param {Object} properties The view properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.PFDView = function(properties) {
  this.pfd = null;
  this.settingToDimension = {};
  goog.base(this, properties);
};
goog.inherits(Mavelous.PFDView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.PFDView.prototype.initialize = function() {
  this.blockel = this.options['blockel'];
  this.statel = this.options['statel'];
  this.pfdel = $('#' + this.options['drawingid']);

  var mavlinkSrc = this.options['mavlinkSrc'];
  // Too bad backbone doesn't pass the model to event handlers; we
  // wouldn't need to keep these handles to models.
  this.attitude = mavlinkSrc.subscribe('ATTITUDE',
                                       this.onAttitudeChange, this);
  this.vfrHud = mavlinkSrc.subscribe('VFR_HUD',
                                     this.onVfrHudChange, this);
  this.navControllerOutput = mavlinkSrc.subscribe(
      'NAV_CONTROLLER_OUTPUT', this.onNavControllerOutputChange, this);

  /* Create pfd object */
  this.pfd = new Mavelous.PFD(this.options['drawingid']);

  /* Connect to settings model */
  if (this.options['settingsModel']) {
    this.settingsModel = this.options['settingsModel'];
    this.settingToDimension[Mavelous.PFDSettingsModel.Size.STANDARD] = {
      'height': function() { return '280px'; },
      'width': function() { return '400px'; }
    };
    this.settingToDimension[Mavelous.PFDSettingsModel.Size.FULLSCREEN] = {
      'height': function() { return $(window).height() - 120; },
      'width': function() { return $(window).width();}
    };
    this.settingToDimension[Mavelous.PFDSettingsModel.Size.SMALL] = {
      'height': function() { return '140px'; },
      'width': function() { return '200px'; }
    };
    this.settingsModel.bind('change', this.onSettingsChange, this);
    this.onSettingsChange();
  }

  /* Set off each callback to initialize view */
  this.onAttitudeChange();
  this.onVfrHudChange();
  this.onNavControllerOutputChange();
};


/**
 * Handles ATTITUDE mavlink messages.
 */
Mavelous.PFDView.prototype.onAttitudeChange = function() {
  this.pfd.setAttitude(this.attitude.get('pitch'),
                       this.attitude.get('roll'));
  this.pfd.draw();
};


/**
 * Handles VFR_HUD mavlink messages.
 */
Mavelous.PFDView.prototype.onVfrHudChange = function() {
  var alt = this.vfrHud.get('alt');
  this.pfd.setAltitude(alt);
  var airSpeed = this.vfrHud.get('airspeed');
  this.pfd.setSpeed(airSpeed);
  this.pfd.draw();
};


/**
 * Handles NAV_CONTROLLER_OUTPUT mavlink messages.
 */
Mavelous.PFDView.prototype.onNavControllerOutputChange = function() {
  var alt_error = this.navControllerOutput.get('alt_error');
  var aspd_error = this.navControllerOutput.get('aspd_error');
  if (Math.abs(alt_error) > 0) {
    this.pfd.setTargetAltitude(this.vfrHud.get('alt') + alt_error);
  }
  if (Math.abs(aspd_error) > 0) {
    this.pfd.setTargetSpeed(this.vfrHud.get('airspeed') + aspd_error);
  }
};


/**
 * Handles changes to the settings model.
 */
Mavelous.PFDView.prototype.onSettingsChange = function() {
  var settings = this.settingsModel.toJSON();
  this.setPosition(settings['position']);
  this.setSize(settings['size']);
};


/**
 * Changes the position of the PFD.
 *
 * @param {Mavelous.PFDSettingsModel.Position} position The desired position.
 */
Mavelous.PFDView.prototype.setPosition = function(position) {
  this.blockel.removeClass('pfd-top pfd-bottom pfd-left pfd-right');
  switch (position) {
    case Mavelous.PFDSettingsModel.Position.TOPLEFT:
      this.blockel.addClass('pfd-top pfd-left');
      break;
    case Mavelous.PFDSettingsModel.Position.TOPRIGHT:
      this.blockel.addClass('pfd-top pfd-right');
      break;
    case Mavelous.PFDSettingsModel.Position.BOTTOMLEFT:
      this.blockel.addClass('pfd-bottom pfd-left');
      break;
    case Mavelous.PFDSettingsModel.Position.BOTTOMRIGHT:
      this.blockel.addClass('pfd-bottom pfd-right');
      break;
  }
};


/**
 * Changes the size of the PFD.
 *
 * @param {Mavelous.PFDSettingsModel.Size} size The desired size.
 */
Mavelous.PFDView.prototype.setSize = function(size) {
  goog.asserts.assert(
      goog.object.containsValue(Mavelous.PFDSettingsModel.Size, size),
      'unknown PFD size value: ' + size);
  var block = this.blockel;
  if (size == Mavelous.PFDSettingsModel.Size.FULLSCREEN) {
    $('#droneicon').addClass('droneicon-hide');
  } else if ($('#droneicon').hasClass('droneicon-hide')) {
    $('#droneicon').removeClass('droneicon-hide');
  }

  if (size == Mavelous.PFDSettingsModel.Size.HIDDEN) {
    this.pfd.setVisible(false);
    block.hide();
  } else {
    /* Take care of show if hidden */
    if (block.is(':hidden')) {
      this.pfd.setVisible(true);
      block.show();
    }

    /* Set element sizes by css class. */
    var dim = this.settingToDimension[size];
    var w = dim.width();
    var h = dim.height();
    this.pfdel.width(w)
      .height(h);
    this.blockel.width(w);
    this.statel.width(w);

    /* Set PFD size by resulting dimensions of this.pfdel */
    this.pfd.setSize(this.pfdel.width(), this.pfdel.height());
  }
};

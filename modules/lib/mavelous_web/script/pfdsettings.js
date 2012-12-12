goog.provide('Mavelous.PFDSettingsModel');

goog.require('goog.json');


/**
 * PFD position values.
 * @enum {Number}
 */
Mavelous.PFDPositions = {
  TOPLEFT: 0,
  TOPRIGHT: 1,
  BOTTOMLEFT: 2,
  BOTTOMRIGHT: 3
};


/**
 * PFD size constants
 * @enum {Number}
 */
Mavelous.PFDSizes = {
  STANDARD: 0,
  FULLSCREEN: 1,
  SMALL: 2,
  HIDDEN: 3
};



/**
 * Primary flight display settings Backbone model.
 * @param {Object} properties The model properties.
 * @constructor
 * @extends {Backbone.Model}
 */
Mavelous.PFDSettingsModel = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.PFDSettingsModel, Backbone.Model);


/**
 * @inheritDoc
 */
Mavelous.PFDSettingsModel.prototype.initialize = function() {
  this.bind('change', function() {
    this.writeToCookie();
  });
};


/**
 * @inheritDoc
 */
Mavelous.PFDSettingsModel.prototype.defaults = function() {
  var defaults = this.readFromCookie();
  if (defaults) {
    return {
      position: defaults.position || Mavelous.PFDPositions.TOPLEFT,
      size: defaults.size || Mavelous.PFDSizes.STANDARD
    };
  } else {
    return {
      position: Mavelous.PFDPositions.TOPLEFT,
      size: Mavelous.PFDSizes.STANDARD
    };
  }
};


/**
 * Reads PFD settings from a cookie.
 * @return {?Object} The PFD settings.
 */
Mavelous.PFDSettingsModel.prototype.readFromCookie = function() {
  var cookieData = $.cookie('pfdSettings');
  if (cookieData) {
    window.console.log('cookieData');
    window.console.log(cookieData);
    try {
      return goog.json.parse(cookieData);
    }
    catch (error) {
      window.console.warn('Unable to parse pfdSettings cookie data:');
      window.console.warn(cookieData);
      return null;
    }
  } else {
    return null;
  }
};


/**
 * Writes PFD settings to a cookie.
 */
Mavelous.PFDSettingsModel.prototype.writeToCookie = function() {
  var settings = goog.json.serialize(this.toJSON());
  window.console.log('writeToCookie:');
  window.console.log(settings);
  $.cookie('pfdSettings', settings);
};

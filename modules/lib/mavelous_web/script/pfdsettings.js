goog.provide('Mavelous.PFDSettingsModel');

goog.require('goog.json');



/**
 * Primary flight display settings Backbone model.
 * @param {Object=} opt_properties The model properties.
 * @constructor
 * @extends {Backbone.Model}
 */
Mavelous.PFDSettingsModel = function(opt_properties) {
  goog.base(this, opt_properties);
};
goog.inherits(Mavelous.PFDSettingsModel, Backbone.Model);


/**
 * PFD position values.
 * @enum {number}
 */
Mavelous.PFDSettingsModel.Position = {
  TOPLEFT: 0,
  TOPRIGHT: 1,
  BOTTOMLEFT: 2,
  BOTTOMRIGHT: 3
};


/**
 * PFD size constants
 * @enum {number}
 */
Mavelous.PFDSettingsModel.Size = {
  STANDARD: 0,
  FULLSCREEN: 1,
  SMALL: 2,
  HIDDEN: 3
};


/**
 * @override
 * @export
 */
Mavelous.PFDSettingsModel.prototype.initialize = function() {
  this.bind('change', function() {
    this.writeToCookie();
  });
};


/**
 * @override
 * @export
 */
Mavelous.PFDSettingsModel.prototype.defaults = function() {
  var defaults = this.readFromCookie();
  if (defaults) {
    return {
      'position': (defaults['position'] ||
                   Mavelous.PFDSettingsModel.Position.TOPLEFT),
      'size': defaults['size'] || Mavelous.PFDSettingsModel.Size.STANDARD
    };
  } else {
    return {
      'position': Mavelous.PFDSettingsModel.Position.TOPLEFT,
      'size': Mavelous.PFDSettingsModel.Size.STANDARD
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

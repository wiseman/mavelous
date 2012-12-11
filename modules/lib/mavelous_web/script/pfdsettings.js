goog.provide('Mavelous.PFDSettingsModel');

goog.require('goog.json');



/**
 * Primary flight display settings Backbone model.
 * @constructor
 * @extends {Backbone.Model}
 */
Mavelous.PFDSettingsModel = Backbone.Model.extend({
  /* Position constants: */
  TOPLEFT: 0,
  TOPRIGHT: 1,
  BOTTOMLEFT: 2,
  BOTTOMRIGHT: 3,
  /* Size constants: */
  STANDARD: 0,
  FULLSCREEN: 1,
  SMALL: 2,
  HIDDEN: 3,

  initialize: function() {
    this.bind('change', function() {
      this.writeToCookie();
    });
  },

  defaults: function() {
    var defaults = this.readFromCookie();
    if (defaults) {
      return defaults;
    } else {
      return {
        position: this.TOPLEFT,
        size: this.STANDARD
      };
    }
  },

  readFromCookie: function() {
    var cookieData = $.cookie('pfdSettings');
    if (cookieData) {
      console.log('cookieData');
      console.log(cookieData);
      try {
        return goog.json.parse(cookieData);
      }
      catch (error) {
        console.warn('Unable to parse pfdSettings cookie data:');
        console.warn(cookieData);
        return null;
      }
    } else {
      return null;
    }
  },

  writeToCookie: function() {
    var settings = goog.json.serialize(this.toJSON());
    console.log('writeToCookie:');
    console.log(settings);
    $.cookie('pfdSettings', settings);
  }
});

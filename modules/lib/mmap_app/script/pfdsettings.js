
$(function(){
  window.Mavelous = window.Mavelous || {};

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

    defaults: function () {
      return {
        position: this.TOPLEFT,
        size: this.STANDARD
      };
    }
  });
});

$(function() {
  window.Mavelous = window.Mavelous || {};

  Mavelous.AppRouter = Backbone.Router.extend({

    initialize: function(options) {
      this.pfdSettingsModel = options.pfdSettingsModel;

      var navbar = {};
      _.each(this.routes, function(g, route) {
        var el = $('#navbar-' + route);
        if (el.length > 0) {
          navbar[route] = el;
        }
      });
      this.navbar = navbar;
    },


    routes: {
      'overview': 'overview',
      'fullpfd' : 'fullpfd',
      'maponly' : 'maponly'
    },

    /* Route implementations: */
    overview: function() {
      this.setnavbar('overview');
      this.pfdSettingsModel.set({ size: this.pfdSettingsModel.STANDARD });
    },

    fullpfd: function() {
      this.setnavbar('fullpfd');
      this.pfdSettingsModel.set({ size: this.pfdSettingsModel.FULLSCREEN });
    },

    maponly: function() {
      this.setnavbar('maponly');
      this.pfdSettingsModel.set({ size: this.pfdSettingsModel.HIDDEN });
    },

    /* Make navbar only show selected item: */
    setnavbar: function(route) {
      _.each(this.navbar, function(li) {
        li.removeClass('active');
      });
      this.navbar[route].addClass('active');
    }
  });
});

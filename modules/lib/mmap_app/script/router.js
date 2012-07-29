$(function(){
  window.Mavelous = window.Mavelous || {};

  Mavelous.AppRouter = Backbone.Router.extend({

    initialize: function (options) {
      if (options.pfdSettingsModel) {
        this.pfdSettingsModel = options.pfdSettingsModel;
      }

      if (options.pfdBlock) {
        this.pfdBlock = options.pfdBlock;
      }

      var navbar = {};
      _.each(this.routes, function (g, route) {
        var el =  $('#navbar-' + route);
        if (el.length > 0) {
          navbar[route] = el;
        }
      });
      this.navbar = navbar;
    },
    

    routes: {
      "overview": "overview",
      "fullpfd" : "fullpfd",
      "maponly" : "maponly"
    },

    /* Route implementations: */
    overview: function () {
      this.setnavbar('overview');
      console.log('router overview');
    },

    fullpfd: function () {
      this.setnavbar('fullpfd');
      console.log('router fullpfd');
    },

    maponly: function () {
      this.setnavbar('maponly');
      console.log('router maponly');
    },

    /* Make navbar only show selected item: */
    setnavbar: function (route) {
      _.each(this.navbar, function (li) {
        li.removeClass('active');
      });
      this.navbar[route].addClass('active');
    }
  });
});

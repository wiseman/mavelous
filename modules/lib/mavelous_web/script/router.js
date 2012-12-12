goog.provide('Mavelous.AppRouter');



/**
 * The Mavelous router.
 * @param {Object} options The router options.
 * @constructor
 */
Mavelous.AppRouter = function(options) {
  this.pfdSettingsModel = options.pfdSettingsModel;
  this.routes = {
    'overview': 'route_overview',
    'fullpfd' : 'route_fullpfd',
    'maponly' : 'route_maponly'
  };
  goog.base(this, options);
};
goog.inherits(Mavelous.AppRouter, Backbone.Router);


/**
 * @inheritDoc
 */
Mavelous.AppRouter.prototype.initialize = function(options) {
  var navbar = {};
  _.each(this.routes, function(g, route) {
    var el = $('#navbar-' + route);
    if (el.length > 0) {
      navbar[route] = el;
    }
  });
  this.navbar = navbar;
};


/**
 * Show overview.
 */
Mavelous.AppRouter.prototype.route_overview = function() {
  this.setnavbar('overview');
  this.pfdSettingsModel.set({ size: Mavelous.PFDSizes.STANDARD });
};


/**
 * Show PFD only.
 */
Mavelous.AppRouter.prototype.route_fullpfd = function() {
  this.setnavbar('fullpfd');
  this.pfdSettingsModel.set({ size: Mavelous.PFDSizes.FULLSCREEN });
};


/**
 * Show map only.
 */
Mavelous.AppRouter.prototype.route_maponly = function() {
  this.setnavbar('maponly');
  this.pfdSettingsModel.set({ size: Mavelous.PFDSizes.HIDDEN });
};


/**
 * Make the navbar only show selected item.
 *
 * @param {String} route The new route.
 */
Mavelous.AppRouter.prototype.setnavbar = function(route) {
  _.each(this.navbar, function(li) {
    li.removeClass('active');
  });
  this.navbar[route].addClass('active');
};

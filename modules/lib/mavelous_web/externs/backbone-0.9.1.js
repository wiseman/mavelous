/**
 * @fileoverview Google closure Externs for backbone-0.9.1.js.
 * @author jjwiseman@gmail.com (John Wiseman)
 * @see http://documentcloud.github.com/backbone/
 * @externs
 */


/**
 * @type {Object}
 * @const
 */
var Backbone = {};



/**
 * @constructor
 */
Backbone.Events = function() {};


/**
 * @param {string} event
 * @param {Function=} opt_callback
 * @param {Object=} opt_context
 */
Backbone.Events.prototype.bind = function(event, opt_callback, opt_context) {};


/**
 * @param {string} event
 * @param {Function=} opt_callback
 * @param {Object=} opt_context
 */
Backbone.Events.prototype.on = function(event, opt_callback, opt_context) {};


/**
 * @param {string} event
 * @param {...?} var_args
 */
Backbone.Events.prototype.trigger = function(event, var_args) {};



/**
 * @param {Array=} opt_models Models
 * @param {Object=} opt_config Config
 * @constructor
 */
Backbone.Collection = function(opt_models, opt_config) {};



/**
 * @param {Object=} opt_attributes Attributes
 * @param {Object=} opt_options Options
 * @constructor
 * @extends {Backbone.Events}
 */
Backbone.Model = function(opt_attributes, opt_options) {};


/** @type {Object} */
Backbone.Model.prototype.attrs;


/**
 * @return {Object}
 */
Backbone.Model.prototype.defaults = function() {};


/**
 * @param {string} attribute
 * @return {?}
 */
Backbone.Model.prototype.get = function(attribute) {};


/**
 * @param {Object=} opt_options
 */
Backbone.Model.prototype.initialize = function(opt_options) {};


/**
 * @param {Object|string} attributes
 * @param {?=} opt_options
 */
Backbone.Model.prototype.set = function(attributes, opt_options) {};



/**
 * @param {Object=} opt_options Options
 * @constructor
 * @extends {Backbone.Events}
 */
Backbone.View = function(opt_options) {};


/** @type {jQuery} */
Backbone.View.prototype.$el;


/** @type {Object} */
Backbone.View.prototype.attrs;


/** @type {Object} */
Backbone.View.prototype.model;


Backbone.View.prototype.initialize = function() {};


/**
 * @return {?Object}
 */
Backbone.View.prototype.render = function() {};



/**
 * @param {Object=} opt_options Options
 * @constructor
 */
Backbone.Router = function(opt_options) {};


/**
 * @param {Object=} opt_options
 */
Backbone.Router.prototype.initialize = function(opt_options) {};


/**
 * @param {string} fragment
 * @param {Object=} opt_options
 */
Backbone.Router.prototype.navigate = function(fragment, opt_options) {};

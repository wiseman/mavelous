/**
 * @fileoverview Externs for Kinetic.
 * @author jjwiseman@gmail.com (John Wiseman)
 * @externs
 */


/**
 * @type {Object}
 * @const
 */
var Kinetic = {};



/**
 * @param {Object=} opt_config
 * @constructor
 */
Kinetic.Node = function(opt_config) {};


/**
 * @return {Object}
 */
Kinetic.Node.prototype.getAttrs = function() {};


/**
 * @param {Object=} opt_config
 */
Kinetic.Node.prototype.setDefaultAttrs = function(opt_config) {};


/**
 * @param {number} x
 * @param {number} y
 */
Kinetic.Node.prototype.setScale = function(x, y) {};


/**
 * @param {number} width
 * @param {number} height
 */
Kinetic.Node.prototype.setSize = function(width, height) {};



/**
 * @param {Object=} opt_config
 * @constructor
 * @extends {Kinetic.Node}
 */
Kinetic.Container = function(opt_config) {};


/**
 * @param {Kinetic.Node} child
 */
Kinetic.Container.prototype.add = function(child) {};



/**
 * @param {Object=} opt_config
 * @constructor
 * @extends {Kinetic.Container}
 */
Kinetic.Stage = function(opt_config) {};



/**
 * @param {Object=} opt_config
 * @constructor
 * @extends {Kinetic.Container}
 */
Kinetic.Layer = function(opt_config) {};



/**
 * @param {Object=} opt_config
 * @constructor
 * @extends {Kinetic.Node}
 */
Kinetic.Shape = function(opt_config) {};


/**
 * @protected
 */
Kinetic.Shape.prototype._setDrawFuncs = function() {};


/**
 * @param {CanvasRenderingContext2D} context
 */
Kinetic.Shape.prototype.drawFunc = function(context) {};


/**
 * @param {CanvasRenderingContext2D} context
 */
Kinetic.Shape.prototype.fillStroke = function(context) {};



/**
 * @constructor
 * @extends {Kinetic.Shape}
 */
Kinetic.Polygon = function(config) {};



/**
 * @constructor
 * @extends {Kinetic.Shape}
 */
Kinetic.Text = function(config) {};


/**
 * @param {string} text
 */
Kinetic.Text.prototype.setText = function(text) {};


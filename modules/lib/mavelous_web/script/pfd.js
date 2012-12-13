/**
 * @fileoverview Implements a Primary Flight Display.  Includes the
 * following pieces: artificial horizon, speed tape & speed bug,
 * altitude tape & altitude bug, flight mode display, status text
 * display.
 *
 * Requirements:
 *   KineticJS 4.1
 */

goog.provide('Mavelous.ArtificialHorizon');
goog.provide('Mavelous.PFD');
goog.provide('Mavelous.Tape');

goog.require('goog.dom');



/**
 * Renders an artifical horizon with sky/ground and pitch and roll
 * ladders.
 *
 * @param {{x: number, y: number, width: number, height: number, skyColor: string, groundColor: string, lineColor: string, planeColor: string}} config
 * @constructor
 */
Mavelous.ArtificialHorizon = function(config) {
  this.initArtificialHorizon_(config);
};
Kinetic.Global.extend(Mavelous.ArtificialHorizon, Kinetic.Shape);


/**
 * Initializes the artificial horizon.
 * @param {Object} config The configuration parameters.
 * @private
 */
Mavelous.ArtificialHorizon.prototype.initArtificialHorizon_ = function(config) {
  this.setDefaultAttrs({
    width: 100,
    height: 100,
    skyColor: '#72cde4',
    groundColor: '#323232',
    lineColor: '#ffffff',
    planeColor: 'black'
  });
  this.shapeType = 'ArtificialHorizon';
  this.radius = Math.min(config.width, config.height) / 2.0;
  this.pitch = 0;
  this.roll = 0;

  Kinetic.Shape.call(this, config);
  this._setDrawFuncs();
};


/**
 * Renders the artifical horizon to a canvas.
 *
 * @param {Object} context The canvas to render to.
 */
Mavelous.ArtificialHorizon.prototype.drawFunc = function(context) {
  var horizon = this.getHorizon_(this.pitch);
  var width = this.attrs.width;
  var height = this.attrs.height;

  context.translate(width / 2, height / 2);
  context.save();

  // Clip everything to a box that is width x height.  We draw the
  // ground and sky as rects that extend beyond those dimensons so
  // that there are no gaps when they're rotated.
  context.beginPath();
  context.rect(-width / 2, -height / 2, width, height);
  context.clip();

  context.rotate(-this.roll);

  // Draw the ground.
  context.fillStyle = this.attrs.groundColor;
  context.strokeStyle = this.attrs.lineColor;
  context.lineWidth = 3;
  context.beginPath();
  context.rect(-width, horizon, width * 2, height);
  context.fill();

  // Draw the sky.
  context.fillStyle = this.attrs.skyColor;
  context.beginPath();
  context.rect(-width, -height, width * 2, height + horizon);
  context.fill();

  // Draw the horizon line.
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(-width / 2, horizon);
  context.lineTo(width / 2, horizon);
  context.stroke();

  // Draw the pitch ladder.
  this.drawPitchRung_(context, 30, width * 0.3);
  this.drawPitchRung_(context, 25, width * 0.05);
  this.drawPitchRung_(context, 20, width * 0.2);
  this.drawPitchRung_(context, 15, width * 0.05);
  this.drawPitchRung_(context, 10, width * 0.1);
  this.drawPitchRung_(context, 5, width * 0.05);

  // Draw the roll indicator.
  var rollRadius = this.radius * 0.9;
  context.beginPath();
  context.arc(0, 0, rollRadius,
              210 * Math.PI / 180.0, 330 * Math.PI / 180.0);
  context.stroke();
  this.drawRollRung_(context, 210 * Math.PI / 180, 10, rollRadius);
  this.drawRollRung_(context, 220 * Math.PI / 180, 5, rollRadius);
  this.drawRollRung_(context, 230 * Math.PI / 180, 10, rollRadius);
  this.drawRollRung_(context, 240 * Math.PI / 180, 5, rollRadius);
  this.drawRollRung_(context, 250 * Math.PI / 180, 5, rollRadius);
  this.drawRollRung_(context, 260 * Math.PI / 180, 5, rollRadius);
  //this.drawRollRung_(270 * Math.PI / 180, 5, rollRadius);
  this.drawTriangle_(context, 270 * Math.PI / 180, 5, rollRadius, true);
  this.drawRollRung_(context, 280 * Math.PI / 180, 5, rollRadius);
  this.drawRollRung_(context, 290 * Math.PI / 180, 5, rollRadius);
  this.drawRollRung_(context, 300 * Math.PI / 180, 5, rollRadius);
  this.drawRollRung_(context, 310 * Math.PI / 180, 10, rollRadius);
  this.drawRollRung_(context, 320 * Math.PI / 180, 5, rollRadius);
  this.drawRollRung_(context, 330 * Math.PI / 180, 10, rollRadius);

  // Undo the roll rotation so we can draw the plane figure over the
  // rotated elements.
  context.restore();

  this.drawTriangle_(context, 270 * Math.PI / 180, -5, rollRadius, false);

  // Draw the plane.
  context.strokeStyle = this.attrs.planeColor;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(-30, -1);
  context.lineTo(-10, -1);
  context.lineTo(-5, 5);
  context.stroke();
  context.beginPath();
  context.moveTo(30, -1);
  context.lineTo(10, -1);
  context.lineTo(5, 5);
  context.stroke();
};


/**
 * Draws a triangle tangent to a circle.  Used for drawing the roll
 * ladder.
 *
 * @param {Object} context The canvas to render to.
 * @param {number} theta The angle of the circle.
 * @param {number} length The length of the triangle.
 * @param {number} radius The radius of the circle.
 * @param {boolean} filled Whether the triangle is filled.
 * @private
 */
Mavelous.ArtificialHorizon.prototype.drawTriangle_ = function(
    context, theta, length, radius, filled) {
  var cos = Math.cos(theta);
  var sin = Math.sin(theta);
  var phi = 2 * Math.PI / 180;
  context.lineWidth = 1;
  context.strokeStyle = this.attrs.lineColor;
  context.beginPath();
  context.moveTo(radius * Math.cos(theta),
                 radius * Math.sin(theta));
  context.lineTo((radius + length) * Math.cos(theta + phi),
                 (radius + length) * Math.sin(theta + phi));
  context.lineTo((radius + length) * Math.cos(theta - phi),
                 (radius + length) * Math.sin(theta - phi));
  context.lineTo(radius * Math.cos(theta),
                 radius * Math.sin(theta));
  context.stroke();
  if (filled) {
    context.fillStyle = this.attrs.lineColor;
    context.fill();
  }
};


/**
 * Draws a rung on the roll ladder.
 * @param {Object} context The canvas to draw to.
 * @param {number} theta The angle of the segment.
 * @param {number} length The length of the segment.
 * @param {number} radius The radius of the circle.
 * @private
 */
Mavelous.ArtificialHorizon.prototype.drawRollRung_ = function(
    context, theta, length, radius) {
  var cos = Math.cos(theta);
  var sin = Math.sin(theta);
  context.lineWidth = 1;
  context.strokeStyle = this.attrs.lineColor;
  context.beginPath();
  context.moveTo(cos * radius, sin * radius);
  context.lineTo(cos * (radius + length), sin * (radius + length));
  context.stroke();
};


/**
 * Draws rungs on the pitch ladder.  For a given pitch, draws the rung
 * at +pitch and -pitch.
 *
 * @param {Object} context The canvas to render to.
 * @param {number} pitchAngle The pitch angle.
 * @param {number} length The length of the rung.
 * @private
 */
Mavelous.ArtificialHorizon.prototype.drawPitchRung_ = function(
    context, pitchAngle, length) {
  var height = this.attrs.height;
  var width = this.attrs.width;

  context.lineWidth = 1;
  context.strokeStyle = this.attrs.lineColor;
  var horizon = this.getHorizon_(this.pitch + pitchAngle * Math.PI / 180);
  context.beginPath();
  context.moveTo(-length / 2, horizon);
  context.lineTo(length / 2, horizon);
  context.stroke();

  horizon = this.getHorizon_(this.pitch - pitchAngle * Math.PI / 180);
  context.beginPath();
  context.moveTo(-length / 2, horizon);
  context.lineTo(length / 2, horizon);
  context.stroke();
};


/**
 * Computes the Y value of the horizon for a given pitch angle.
 * @param {number} pitch The pitch angle.
 * @return {number} The Y coordinate.
 * @private
 */
Mavelous.ArtificialHorizon.prototype.getHorizon_ = function(pitch) {
  return Math.sin(pitch) * this.radius;
};


/**
 * Sets the pitch and roll to display on the artificial horizon.
 * @param {number} pitch The pitch angle.
 * @param {number} roll The roll angle.
 */
Mavelous.ArtificialHorizon.prototype.setPitchRoll = function(pitch, roll) {
  this.pitch = pitch;
  this.roll = roll;
};



/**
 * Draws a "tape", a moving scale of values, with labels.  Also can
 * display a "bug" showing the target value.
 *
 * @param {Object} config
 * config {number} config.width width.
 * config {number} config.height height.
 * config {string} config.backgroundColor The background color.
 * config {string} config.fontColor The font color to use for labels.
 * config {string} config.fontFamily The font to use for labels.
 * config {number} config.fontSize The font size to use for labels.
 * config {string} config.fontStyle The font style to use for labels.
 * config {Mavelous.Tape.SideType} side Whether the Tape is on the left or the
 *     right.
 * @constructor
 */
Mavelous.Tape = function(config) {
  this.initTape_(config);
};
Kinetic.Global.extend(Mavelous.Tape, Kinetic.Shape);


/**
 * Default Tape width.
 * @type {number}
 */
Mavelous.Tape.WIDTH = 30;


/**
 * Default Tape height.
 * @type {number}
 */
Mavelous.Tape.HEIGHT = 140;


/**
 * Initializes the Tape.
 * @param {Object} config The configuration parameters.
 * @private
 */
Mavelous.Tape.prototype.initTape_ = function(config) {
  var WIDTH = Mavelous.Tape.WIDTH;
  var HEIGHT = Mavelous.Tape.HEIGHT;
  this.setDefaultAttrs({
    width: WIDTH,
    height: HEIGHT,
    fontFamily: 'Calibri',
    fontSize: 12,
    fontStyle: 'normal',
    side: Mavelous.Tape.SideType.LEFT
  });
  this.value = 0;
  this.targetValue = null;
  this.valueText = '0';

  Kinetic.Shape.call(this, config);
  this._setDrawFuncs();

  // Because I'm lazy, we do this hacky trick of creating some Kinetic
  // objects then calling their drawFuncs in our drawFunc.
  this.instantaneousPolygon = new Kinetic.Polygon({
    points: this.reflect_(
        [0, HEIGHT * 60 / 140,
         WIDTH * 25 / 30, HEIGHT * 60 / 140,
         WIDTH, HEIGHT / 2,
         WIDTH * 25 / 30, HEIGHT * 80 / 140,
         0, HEIGHT * 80 / 140,
         0, HEIGHT * 60 / 140]),
    stroke: config.fontColor,
    strokeWidth: 1.0,
    fill: config.instantaneousBackgroundColor
  });

  this.bug = new Kinetic.Polygon({
    x: 0,
    y: 0,
    points: this.reflect_([
      WIDTH * 31 / 30, 0,
      WIDTH * 34 / 30, HEIGHT * -2 / 140,
      WIDTH * 36 / 30, HEIGHT * -2 / 140,
      WIDTH * 36 / 30, HEIGHT * 2 / 140,
      WIDTH * 34 / 30, HEIGHT * 2 / 140,
      WIDTH * 31 / 30, 0]),
    stroke: config.bugColor,
    fill: config.bugColor,
    strokeWidth: 1.0
  });
};


/**
 * Reflects c-xoordinates for left vs. right Tapes.  If given an array
 * of numbers, every other number will be considered to be an
 * x-coordinate and reflected in place.
 *
 * @param {number|Array.<number>} x_pos_or_points A single x-coord or an array
 *     of x-coords.
 * @return {number|Array.<number>} Returns the reflected coordinate or coordinates.
 * @private
 */
Mavelous.Tape.prototype.reflect_ = function(x_pos_or_points) {
  if (this.attrs.side === Mavelous.Tape.SideType.RIGHT) {
    var width = this.attrs.width;
    if (goog.isArray(x_pos_or_points)) {
      var len = x_pos_or_points.length;
      for (var i = 0; i < len; i += 2) {
        x_pos_or_points[i] = width - x_pos_or_points[i];
      }
    } else {
      x_pos_or_points = width - x_pos_or_points;
    }
  }
  return x_pos_or_points;
};


/**
 * Sets the instantaneous value to display on the tape.
 * @param {number} value The value.
 */
Mavelous.Tape.prototype.setValue = function(value) {
  if (value != this.value) {
    this.value = value;
    var valueText = 'ERR';
    if (goog.isDefAndNotNull(value)) {
      valueText = value.toString();
    }
    if (valueText.length > 3) {
      valueText = valueText.substring(0, 3);
      if (valueText.charAt(valueText.length - 1) == '.') {
        valueText = valueText.substr(0, valueText.length - 1);
      }
    }
    this.valueText = valueText;
  }
};


/**
 * Sets the target value to display on the tape with the bug.
 * @param {number} target The target value.  Can be null to turn off the bug.
 */
Mavelous.Tape.prototype.setTargetValue = function(target) {
  this.targetValue = target;
};


/**
 * Draws the tape.
 * @param {Object} context The canvas to draw to.
 */
Mavelous.Tape.prototype.drawFunc = function(context) {
  // The tape displays 3 pieces of info:
  //   * current value
  //   * moving value ladder
  //   * target value, if set
  var WIDTH = Mavelous.Tape.WIDTH;
  var HEIGHT = Mavelous.Tape.HEIGHT;

  // background
  context.beginPath();
  context.fillStyle = this.attrs.backgroundColor;
  context.rect(0, 0, 30, 140);
  context.closePath();
  this.fillStroke(context);

  // Draw the value tics.
  var minorTicInterval = 2;
  var majorTicInterval = 10;
  var valueScale = 2;
  // Find minimum multiple-of-minorTicInterval value that will be
  // displayed.
  var minValue = this.value - HEIGHT / 4;
  minValue = Math.ceil(minValue / minorTicInterval) * minorTicInterval;
  minValue = Math.max(0, minValue);
  var maxValue = this.value + HEIGHT / 4;
  maxValue = Math.floor(maxValue / minorTicInterval) * minorTicInterval;
  var font = ('normal ' +
              this.attrs.fontSize * 0.9 + 'pt ' +
              this.attrs.fontFamily);
  context.font = font;
  context.fillStyle = this.attrs.fontColor;
  context.strokeStyle = this.attrs.fontColor;
  context.textBaseLine = 'top';
  if (this.attrs.side === Mavelous.Tape.SideType.LEFT) {
    context.textAlign = 'right';
  } else {
    context.textAlign = 'left';
  }

  var lineHeightAdjust = this.attrs.fontSize / 2;
  for (var v = minValue; v <= maxValue; v += minorTicInterval) {
    var isMajorTic = (v % majorTicInterval < .001 ||
                      majorTicInterval - (v % majorTicInterval) < .001);
    var y = HEIGHT / 2 + valueScale * (this.value - v);
    if (isMajorTic) {
      context.beginPath();
      context.moveTo(this.reflect_(WIDTH * 25 / 30), y);
      context.lineTo(this.reflect_(WIDTH), y);
      context.stroke();

      var label = '' + Math.round(v);
      context.beginPath();
      context.fillText(
          label,
          this.reflect_(WIDTH * 23 / 30),
          y + lineHeightAdjust);
    } else {
      context.beginPath();
      context.moveTo(this.reflect_(WIDTH * 28 / 30), y);
      context.lineTo(this.reflect_(WIDTH), y);
      context.stroke();
    }
  }

  // Instantaneous value text surrounded by polygon.
  this.instantaneousPolygon.drawFunc(context);
  var textY = this.attrs.height / 2;
  font = ('normal ' +
          this.attrs.fontSize + 'pt ' +
          this.attrs.fontFamily);
  context.font = font;
  context.textBaseline = 'middle';
  context.beginPath();
  context.fillText(
      this.valueText,
      this.reflect_(WIDTH * 25 / 30),
      textY);

  if (goog.isDefAndNotNull(this.targetValue)) {
    var bugX = this.reflect_(0);
    var bugY = 70;
    bugY -= this.targetValue * valueScale;
    bugY += this.value * valueScale;
    bugY = Math.min(162, Math.max(16, bugY));
    context.translate(0, bugY);
    this.bug.drawFunc(context);
    context.translate(0, -bugY);
  }
};


/**
 * Which side is the Tape on.
 * @enum {string}
 */
Mavelous.Tape.SideType = {
  LEFT: 'left',
  RIGHT: 'right'
};



/**
 * Primary Flight Display view.
 * @param {string|Element} container The DOM element to put the PFD in.
 * @constructor
 */
Mavelous.PFD = function(container) {
  this.init(container);
};


/**
 * Initializes the PFD.
 * @param {string|Element} container The DOM element to put the PFD in.
 * @param {Object=} opt_options Configuration options.
*/
Mavelous.PFD.prototype.init = function(container, opt_options) {
  var options = opt_options || {};
  this.options = options;
  this.options.fontFamily = options.fontFamily ||
      'Tahoma,monospace,sans-serif';
  this.options.fontSize = options.fontSize || 8;
  this.options.fontColor = options.fontColor || 'white';
  this.options.backgroundColor1 = options.backgroundColor1 || 'black';
  this.options.backgroundColor2 = options.backgroundColor2 ||
      'rgb(60,60,60)';
  this.options.bugColor = options.bugColor || 'rgb(255,0,100)';
  this.options.highlightColor = options.highlightColor ||
      'rgb(255,255,255)';
  this.options.skyColor = options.skyColor || 'rgb(114,149,179)';
  this.options.groundColor = options.groundColor || 'rgb(165,105,63)';

  this.speed = null;
  this.targetSpeed = null;
  this.altitude = null;
  this.targetAltitude = null;
  this.flightMode = null;
  this.visible = true;

  var containerElt = goog.dom.getElement(container);
  this.stage = new Kinetic.Stage({
    container: container,
    width: containerElt.offsetWidth,
    height: containerElt.offsetHeight
  });
  this.layer = new Kinetic.Layer();
  this.stage.add(this.layer);
  this.stage.setScale(containerElt.offsetWidth / 200.0,
                      containerElt.offsetWidth / 200.0);

  // Artificial horizon.
  this.attitudeIndicator = new Mavelous.ArtificialHorizon({
    x: 35,
    y: 20,
    width: 130,
    height: 130,
    groundColor: this.options.groundColor,
    skyColor: this.options.skyColor,
    lineColor: 'white',
    planeColor: 'black'
  });
  this.layer.add(this.attitudeIndicator);

  // Speed tape.
  this.speedTape = new Mavelous.Tape({
    x: 0,
    y: 15,
    fill: this.options.backgroundColor2,
    fontColor: this.options.fontColor,
    fontFamily: this.options.fontFamily,
    fontSize: this.options.fontSize,
    instantaneousBackgroundColor: this.options.backgroundColor1,
    bugColor: this.options.bugColor,
    side: Mavelous.Tape.SideType.LEFT
  });
  this.layer.add(this.speedTape);

  // Altitude tape.
  this.altitudeTape = new Mavelous.Tape({
    x: 170,
    y: 15,
    fill: this.options.backgroundColor2,
    fontColor: this.options.fontColor,
    fontFamily: this.options.fontFamily,
    fontSize: this.options.fontSize,
    instantaneousBackgroundColor: this.options.backgroundColor1,
    bugColor: this.options.bugColor,
    side: Mavelous.Tape.SideType.RIGHT
  });
  this.layer.add(this.altitudeTape);

  // Target altitude text.
  var smallFontSize = this.options.fontSize * 0.9;
  this.targetAltitudeDisplay = new Kinetic.Text({
    x: 170,
    y: 5,
    width: 30,
    align: 'center',
    fontSize: smallFontSize,
    fontFamily: this.options.fontFamily,
    textFill: this.options.bugColor});
  this.layer.add(this.targetAltitudeDisplay);

  // Target speed text.
  this.targetSpeedDisplay = new Kinetic.Text({
    x: 0,
    y: 5,
    width: 30,
    align: 'center',
    fontSize: smallFontSize,
    fontFamily: this.options.fontFamily,
    textFill: this.options.bugColor});
  this.layer.add(this.targetSpeedDisplay);
};


/**
 * Sets the PFD's dimensions.
 * @param {number} width The width.
 * @param {number} height The height.
 */
Mavelous.PFD.prototype.setSize = function(width, height) {
  var aspect = width / height;
  var w, h = 0;
  if (aspect > (4 / 3)) {
    w = 4 / 3 * height; h = height;
  } else {
    w = width; h = 3 / 4 * width;
  }
  this.stage.setSize(w, h);
  this.stage.setScale(w / 200, w / 200);
};


/**
 * Sets the vehicle speed.
 * @param {number} speed The vehicle speed.
 */
Mavelous.PFD.prototype.setSpeed = function(speed) {
  this.speedTape.setValue(speed);
};


/**
 * Sets the vehicle's target speed.
 * @param {number} speed The target speed.
*/
Mavelous.PFD.prototype.setTargetSpeed = function(speed) {
  this.targetSpeed = speed;
  if (speed === null) {
    this.speedTape.setTargetValue(null);
    this.targetSpeedDisplay.hide();
  } else {
    this.speedTape.setTargetValue(speed);
    this.targetSpeedDisplay.setText(Math.round(speed).toString());
    this.targetSpeedDisplay.show();
  }
};


/**
 * Draws the PFD.
 */
Mavelous.PFD.prototype.draw = function() {
  if (this.visible) {
    this.layer.draw();
  }
};


Mavelous.PFD.prototype.setVisible = function(isVisible) {
  this.visible = isVisible;
};


/**
 * Sets the vehicle altitude.
 * @param {number} altitude The altitude.
 */
Mavelous.PFD.prototype.setAltitude = function(altitude) {
  this.altitudeTape.setValue(altitude);
};


/**
 * Sets the vehicle's target altitude.
 * @param {number} altitude The target altitude.
 */
Mavelous.PFD.prototype.setTargetAltitude = function(altitude) {
  this.targetAltitude = altitude;
  if (altitude === null) {
    this.altitudeTape.setTargetValue(null);
    this.targetAltitudeDisplay.hide();
  } else {
    this.altitudeTape.setTargetValue(altitude);
    this.targetAltitudeDisplay.setText(Math.round(altitude).toString());
    this.targetAltitudeDisplay.show();
  }
};


/**
 * Sets the vehicle's heading.
 * @param {number} heading The heading.
 */
Mavelous.PFD.setHeading = function(heading) {
};


/**
 * Sets the vehicle's pitch and roll angles.
 * @param {number} pitch The pitch angle.
 * @param {number} roll The roll angle.
 */
Mavelous.PFD.prototype.setAttitude = function(pitch, roll) {
  this.attitudeIndicator.setPitchRoll(pitch, roll);
};

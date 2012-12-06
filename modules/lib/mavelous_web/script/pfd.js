// Implements a Primary Flight Display.  Includes the following:
//
//   * Artificial horizon
//   * Speed tape & speed bug
//   * Altitude tape & altitude bug
//   * Flight mode display
//   * Status text display
//
// Requirements:
//   * Kineticjs

goog.require('goog.base');


$(function() {
  window.Mavelous = window.Mavelous || {};

  // The artificial horizon is implemented as a Kinetic Shape subclass.
  Mavelous.ArtificialHorizon = function(config) {
    this.initArtificialHorizon_(config);
  };

  Mavelous.ArtificialHorizon.prototype = {
    initArtificialHorizon_: function(config) {
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
    },

    drawFunc: function(context) {
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
      this.drawRung_(30, width * 0.3);
      this.drawRung_(25, width * 0.05);
      this.drawRung_(20, width * 0.2);
      this.drawRung_(15, width * 0.05);
      this.drawRung_(10, width * 0.1);
      this.drawRung_(5, width * 0.05);

      // Draw the roll indicator.
      var rollRadius = this.radius * 0.9;
      context.beginPath();
      context.arc(0, 0, rollRadius,
                  210 * Math.PI / 180.0, 330 * Math.PI / 180.0);
      context.stroke();
      this.drawRoll_(context, 210 * Math.PI / 180, 10, rollRadius);
      this.drawRoll_(context, 220 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(context, 230 * Math.PI / 180, 10, rollRadius);
      this.drawRoll_(context, 240 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(context, 250 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(context, 260 * Math.PI / 180, 5, rollRadius);
      //this.drawRoll_(270 * Math.PI / 180, 5, rollRadius);
      this.drawTriangle_(context, 270 * Math.PI / 180, 5, rollRadius, true);
      this.drawRoll_(context, 280 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(context, 290 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(context, 300 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(context, 310 * Math.PI / 180, 10, rollRadius);
      this.drawRoll_(context, 320 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(context, 330 * Math.PI / 180, 10, rollRadius);

      // Undo the roll rotation so we can draw the plane figure
      // over the rotated elements.
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
    },

    drawTriangle_: function(context, theta, length, radius, filled) {
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
    },

    drawRoll_: function(context, theta, length, radius) {
      var cos = Math.cos(theta);
      var sin = Math.sin(theta);
      context.lineWidth = 1;
      context.strokeStyle = this.attrs.lineColor;
      context.beginPath();
      context.moveTo(cos * radius, sin * radius);
      context.lineTo(cos * (radius + length), sin * (radius + length));
      context.stroke();
    },

    drawRung_: function(offset, scaleWidth) {
      var context = this.getContext();
      var height = this.attrs.height;
      var width = this.attrs.width;

      context.lineWidth = 1;
      context.strokeStyle = this.attrs.lineColor;
      var horizon = this.getHorizon_(this.pitch + offset * Math.PI / 180);
      context.beginPath();
      context.moveTo(-scaleWidth / 2, horizon);
      context.lineTo(scaleWidth / 2, horizon);
      context.stroke();

      horizon = this.getHorizon_(this.pitch - offset * Math.PI / 180);
      context.beginPath();
      context.moveTo(-scaleWidth / 2, horizon);
      context.lineTo(scaleWidth / 2, horizon);
      context.stroke();
    },

    getHorizon_: function(pitch) {
      return Math.sin(pitch) * this.radius;
    },

    setPitchRoll: function(pitch, roll) {
      this.pitch = pitch;
      this.roll = roll;
    }
  };
  Kinetic.Global.extend(Mavelous.ArtificialHorizon, Kinetic.Shape);


  Mavelous.Tape = function(config) {
    this.initTape_(config);
  };

  Mavelous.Tape.prototype = {
    WIDTH: 30,
    HEIGHT: 140,

    reflect_: function(x_pos_or_points) {
      if (this.attrs.side === Mavelous.Tape.SIDE_RIGHT) {
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
    },

    initTape_: function(config) {
      this.setDefaultAttrs({
        width: this.WIDTH,
        height: this.HEIGHT,
        fontFamily: 'Calibri',
        fontSize: 12,
        fontStyle: 'normal',
        side: Mavelous.Tape.SIDE_LEFT
      });
      this.value = 0;
      this.targetValue = null;
      this.valueText = '0';

      Kinetic.Shape.call(this, config);
      this._setDrawFuncs();

      this.instantaneousPolygon = new Kinetic.Polygon({
        points: this.reflect_(
            [0, this.HEIGHT * 60 / 140,
             this.WIDTH * 25 / 30, this.HEIGHT * 60 / 140,
             this.WIDTH, this.HEIGHT / 2,
             this.WIDTH * 25 / 30, this.HEIGHT * 80 / 140,
             0, this.HEIGHT * 80 / 140,
             0, this.HEIGHT * 60 / 140]),
        stroke: config.fontColor,
        strokeWidth: 1.0,
        fill: config.instantaneousBackgroundColor
      });

      this.bug = new Kinetic.Polygon({
        x: 0,
        y: 0,
        points: this.reflect_([
          this.WIDTH * 31 / 30, 0,
          this.WIDTH * 34 / 30, this.HEIGHT * -2 / 140,
          this.WIDTH * 36 / 30, this.HEIGHT * -2 / 140,
          this.WIDTH * 36 / 30, this.HEIGHT * 2 / 140,
          this.WIDTH * 34 / 30, this.HEIGHT * 2 / 140,
          this.WIDTH * 31 / 30, 0]),
        stroke: config.bugColor,
        fill: config.bugColor,
        strokeWidth: 1.0,
        visible: true // false
      });
    },

    setValue: function(value) {
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
    },

    setTargetValue: function(targetValue) {
      this.targetValue = targetValue;
    },

    drawFunc: function(context) {
      // --------------------
      // The tape displays 3 pieces of info:
      //   * current value
      //   * moving value ladder
      //   * target value, if set
      var width = this.getWidth();
      var height = this.getHeight();

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
      var minValue = this.value - this.HEIGHT / 4;
      minValue = Math.ceil(minValue / minorTicInterval) * minorTicInterval;
      minValue = Math.max(0, minValue);
      var maxValue = this.value + this.HEIGHT / 4;
      maxValue = Math.floor(maxValue / minorTicInterval) * minorTicInterval;
      var font = ('normal ' +
                  this.attrs.fontSize * 0.9 + 'pt ' +
                  this.attrs.fontFamily);
      context.font = font;
      context.fillStyle = this.attrs.fontColor;
      context.strokeStyle = this.attrs.fontColor;
      context.textBaseLine = 'top';
      if (this.attrs.side == Mavelous.Tape.SIDE_LEFT) {
        context.textAlign = 'right';
      } else {
        context.textAlign = 'left';
      }

      var lineHeightAdjust = this.attrs.fontSize / 2;
      for (var v = minValue; v <= maxValue; v += minorTicInterval) {
        var isMajorTic = (v % majorTicInterval < .001 ||
                          majorTicInterval - (v % majorTicInterval) < .001);
        var y = this.HEIGHT / 2 + valueScale * (this.value - v);
        if (isMajorTic) {
          context.beginPath();
          context.moveTo(this.reflect_(this.WIDTH * 25 / 30), y);
          context.lineTo(this.reflect_(this.WIDTH), y);
          context.stroke();

          var label = '' + Math.round(v);
          context.beginPath();
          context.fillText(
              label,
              this.reflect_(this.WIDTH * 23 / 30),
              y + lineHeightAdjust);
        } else {
          context.beginPath();
          context.moveTo(this.reflect_(this.WIDTH * 28 / 30), y);
          context.lineTo(this.reflect_(this.WIDTH), y);
          context.stroke();
        }
      }

      // Instantaneous value text surrounded by polygon.
      this.instantaneousPolygon.drawFunc(context);
      var textY = this.attrs.height / 2;
      var font = ('normal ' +
                  this.attrs.fontSize + 'pt ' +
                  this.attrs.fontFamily);
      context.font = font;
      context.textBaseline = 'middle';
      context.beginPath();
      context.fillText(
          this.valueText,
          this.reflect_(this.WIDTH * 25 / 30),
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
    }
  };
  Kinetic.Global.extend(Mavelous.Tape, Kinetic.Shape);

  Mavelous.Tape.SIDE_LEFT = 'left';
  Mavelous.Tape.SIDE_RIGHT = 'right';

  // end of speed tape
  // --------------------


  Mavelous.PFD = function(container) {
    this.init(container);
  };

  Mavelous.PFD.prototype = {
    containerElement: null,

    makeGroup: function(items, config) {
      var group = new Kinetic.Group(config);
      for (var i = 0; i < items.length; i++) {
        group.add(items[i]);
      }
      return group;
    },

    init: function(container, options) {
      options = options || {};
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

      var containerElt = document.getElementById(container);
      this.stage = new Kinetic.Stage({
        container: container,
        width: containerElt.offsetWidth,
        height: containerElt.offsetHeight
      });
      this.layer = new Kinetic.Layer();
      this.stage.add(this.layer);
      this.stage.setScale(containerElt.offsetWidth / 200.0,
                          containerElt.offsetWidth / 200.0);

      this.attitudeIndicator = new Mavelous.ArtificialHorizon({
        x: 35, y: 20, width: 130, height: 130,
        groundColor: this.options.groundColor,
        skyColor: this.options.skyColor
      });
      this.layer.add(this.attitudeIndicator);


      this.speedTape = new Mavelous.Tape({
        x: 0,
        y: 15,
        fill: this.options.backgroundColor2,
        fontColor: this.options.fontColor,
        fontFamily: this.options.fontFamily,
        fontSize: this.options.fontSize,
        instantaneousBackgroundColor: this.options.backgroundColor1,
        bugColor: this.options.bugColor
      });
      this.layer.add(this.speedTape);
      this.altitudeTape = new Mavelous.Tape({
        x: 170,
        y: 15,
        fill: this.options.backgroundColor2,
        fontColor: this.options.fontColor,
        fontFamily: this.options.fontFamily,
        fontSize: this.options.fontSize,
        instantaneousBackgroundColor: this.options.backgroundColor1,
        bugColor: this.options.bugColor,
        side: Mavelous.Tape.SIDE_RIGHT
      });
      this.layer.add(this.altitudeTape);

      // Target altitude
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

      // Target speed
      this.targetSpeedDisplay = new Kinetic.Text({
        x: 0,
        y: 5,
        width: 30,
        align: 'center',
        fontSize: smallFontSize,
        fontFamily: this.options.fontFamily,
        textFill: this.options.bugColor});
      this.layer.add(this.targetSpeedDisplay);

    },

    setSize: function(width, height) {
      var aspect = width / height;
      var w, h = 0;
      if (aspect > (4 / 3)) {
        w = 4 / 3 * height; h = height;
      } else {
        w = width; h = 3 / 4 * width;
      }
      this.stage.setSize(w, h);
      this.stage.setScale(w / 200, w / 200);
    },

    setSpeed: function(speed) {
      this.speedTape.setValue(speed);
    },

    setTargetSpeed: function(speed) {
      this.targetSpeed = speed;
      if (speed === null) {
        this.speedTape.setTargetValue(null);
        this.targetSpeedDisplay.hide();
      } else {
        this.speedTape.setTargetValue(speed);
        this.targetSpeedDisplay.setText(Math.round(speed).toString());
        this.targetSpeedDisplay.show();
      }
      //this.layer.draw();
    },

    draw: function() {
      this.layer.draw();
    },

    setAltitude: function(altitude) {
      this.altitudeTape.setValue(altitude);
    },

    setTargetAltitude: function(altitude) {
      this.targetAltitude = altitude;
      if (altitude === null) {
        this.altitudeTape.setTargetValue(null);
        this.targetAltitudeDisplay.hide();
      } else {
        this.altitudeTape.setTargetValue(altitude);
        this.targetAltitudeDisplay.setText(Math.round(altitude).toString());
        this.targetAltitudeDisplay.show();
      }
      //this.layer.draw();
    },

    setHeading: function(heading) {
    },

    setAttitude: function(pitch, roll) {
      this.attitudeIndicator.setPitchRoll(pitch, roll);
    }
  };

});

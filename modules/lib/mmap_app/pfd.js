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



$(function(){

pfd = {};

pfd.zeroPad = function(number, width, padChar) {
  if (!padChar) {
    padChar = '0';
  }
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join(padChar) + number;
  }
  return number + ""; // always return a string
};


// The artificial horizon is implemented as a Kinetic Shape subclass.

pfd.ArtificialHorizon = Kinetic.Shape.extend({
  init: function(config) {
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
        
    config.drawFunc = function() {
      var horizon = this.getHorizon_(this.pitch);
      var context = this.getContext();
      var width = this.attrs.width;
      var height = this.attrs.height;

      context.save();

      context.translate(width / 2, height / 2);
      context.save();

      // Clip everything to a box that is width x height.  We
      // draw the ground and sky as rects that extend beyond
      // those dimensons so that there are no gaps when they're
      // rotated.
      context.beginPath();
      context.rect(-width / 2, -height / 2, width, height);
      context.clip();

      context.rotate(this.roll);

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
      context.beginPath();
      context.lineWidth = 1;
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
      context.beginPath();
      var rollRadius = this.radius * 0.9;
      context.arc(0, 0, rollRadius, 210 * Math.PI / 180.0, 330 * Math.PI / 180.0);
      context.stroke();
      this.drawRoll_(210 * Math.PI / 180, 10, rollRadius);
      this.drawRoll_(220 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(230 * Math.PI / 180, 10, rollRadius);
      this.drawRoll_(240 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(250 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(260 * Math.PI / 180, 5, rollRadius);
      //this.drawRoll_(270 * Math.PI / 180, 5, rollRadius);
      this.drawTriangle_(270 * Math.PI / 180, 5, rollRadius, true);
      this.drawRoll_(280 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(290 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(300 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(310 * Math.PI / 180, 10, rollRadius);
      this.drawRoll_(320 * Math.PI / 180, 5, rollRadius);
      this.drawRoll_(330 * Math.PI / 180, 10, rollRadius);

      // Undo the roll rotation so we can draw the plane figure
      // over the rotated elements.
      context.restore();

      this.drawTriangle_(270 * Math.PI / 180, -5, rollRadius, false);

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
      
      context.restore();
    };

    this._super(config);
  },

  drawTriangle_: function(theta, length, radius, filled) {
    var context = this.getContext();
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    var phi = 2 * Math.PI / 180;
    context.save();
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
    context.restore();
  },

  drawRoll_: function(theta, length, radius) {
    var context = this.getContext();
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    context.save();
    context.lineWidth = 1;
    context.strokeStyle = this.attrs.lineColor;
    context.beginPath();
    context.moveTo(cos * radius, sin * radius);
    context.lineTo(cos * (radius + length), sin * (radius + length));
    context.stroke();
    context.restore();
  },

  drawRung_: function(offset, scaleWidth) {
    var context = this.getContext();
    var height = this.attrs.height;
    var width = this.attrs.width;
    context.save();
    
    context.lineWidth = 1;
    context.strokeStyle = this.attrs.lineColor;
    var horizon = this.getHorizon_(this.pitch + offset * Math.PI / 180);
    context.beginPath();
    context.moveTo(-scaleWidth/2, horizon);
    context.lineTo(scaleWidth/2, horizon);
    context.stroke();

    horizon = this.getHorizon_(this.pitch - offset * Math.PI / 180);
    context.moveTo(-scaleWidth / 2, horizon);
    context.lineTo(scaleWidth / 2, horizon);
    context.stroke();
    
    context.restore();
  },

  getHorizon_: function(pitch) {
    return Math.sin(pitch) * this.radius;
  },

  setPitchRoll: function(pitch, roll) {
    this.pitch = pitch;
    this.roll = roll;
  }
});


  // Like a regular group except that it draws its children with a
  // clipping rect active.  Requires a width and height.

  pfd.ClippedGroup = Kinetic.Container.extend({
    init: function(config) {
      this.nodeType = 'Group';
      this._super(config);
    },

    draw: function() {
      if (this.attrs.visible) {
        var canvas = this.getLayer().getContext();
        canvas.save();
        // FIXME: I can't see a better way of doing this in the
        // current version of Kinetic but it seems weird to apply
        // the transform and then unapply it right before the
        // children nodes apply it.

        // We get the transform that is currently in effect
        var xform = this.getAbsoluteTransform();
        var m = xform.getMatrix();
        var width = this.attrs.width;
        var height = this.attrs.height;
        canvas.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        
        // Draw a clipping rect.
        canvas.beginPath();
        canvas.rect(0, 0, this.attrs.width, this.attrs.height);
        canvas.clip();

        // Undo the transform.
        xform.invert();
        m = xform.getMatrix();
        canvas.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

        // Draw children nodes.
        this._drawChildren();
        canvas.restore();
      }
    }
  });


  pfd.SpeedTape = function (parent, layer, origin) {
    this.init(parent,layer,origin);
  }

  pfd.SpeedTape.prototype = {
    init: function (parent, layer, origin) {
      // --------------------
      // Speed tape
      // The speed tape displays 3 pieces of info:
      //   * current speed
      //   * moving speed ladder
      //   * target speed, if set

      // background
      layer.add(
        new Kinetic.Rect({
          x: origin.x,
          y: origin.y,
          width: 30,
          height: 140,
          stroke: parent.options.backgroundColor2,
          fill: parent.options.backgroundColor2
        }));

      this.tape = new Kinetic.Group();
      // clipping region for moving speed ladder
      layer.add(new pfd.ClippedGroup({
        x: origin.x,
        y: origin.y,
        width: 30,
        height: 140
      }).add(this.tape));

      // moving speed ladder
      var smallFontSize = parent.options.fontSize * 0.9;
      var isMajorTick, y;
      for (var spd = 0; spd <= 100; spd += 5) {
        isMajorTick = (spd % 10 === 0);
        y = 70 - (2 * spd);
        if (isMajorTick) {
          this.tape.add(new Kinetic.Line({
            points: [25, y, 30, y],
            stroke: parent.options.fontColor,
            strokeWidth: 1.0,
            lineCap: 'square'
          }));
          this.tape.add(new Kinetic.Text({
            x: 0,
            y: y - smallFontSize / 2,
            width: 23,
            align: 'right',
            fontSize: smallFontSize,
            fontFamily: parent.options.fontFamily,
            textFill: parent.options.fontColor,
            text: '' + spd
          }));
        } else {
          this.tape.add(new Kinetic.Line({
            points: [28, y, 30, y],
            stroke: parent.options.fontColor,
            strokeWidth: 1.0,
            lineCap: 'square'
          }));
        }
      }
      
      // Instantaneous speed text
      this.inst = new Kinetic.Text({
        x: 0,
        y: 10 - parent.options.fontSize / 2,
        width: 23,
        text: 'UNK',
        align: 'right',
        fontSize: parent.options.fontSize,
        fontFamily: parent.options.fontFamily,
        textFill: parent.options.fontColor
      });
      layer.add(
        parent.makeGroup([
          new Kinetic.Polygon({
            points: [0, 0,
                     25, 0,
                     30, 10,
                     25, 20,
                     0, 20,
                     0, 0],
            stroke: parent.options.fontColor,
            strokeWidth: 1.0,
            fill: parent.options.backgroundColor1
          }),
          this.inst
        ], {
          x: origin.x,
          y: origin.y + 60
        }));

      // Speed bug
      this.bug = new Kinetic.Polygon({
          x: origin.x + 31,
          y: origin.y,
          points: [0, 0,
                   3, -2,
                   5, -2,
                   5, 2,
                   3, 2,
                   0, 0],
          stroke: parent.options.bugColor,
          fill: parent.options.bugColor,
          strokeWidth: 1.0,
          visible: false
        });
      layer.add(this.bug);
      this.setBug = function (target, current) {
        var y = origin.y + 70;
        y -= target * 2;
        y += current * 2;
        y = Math.min(162, Math.max(16, y));
        this.bug.setY(y);
      }
    }
  };
  // end of speed tape
  // --------------------
 
  pfd.AltTape = function (parent, layer, origin) {
    this.init(parent,layer,origin);

  };
 
  pfd.AltTape.prototype = {
      // --------------------
      // altitude tape

    init: function (parent, layer, origin) {
      // background
      layer.add(
        new Kinetic.Rect({
          x: origin.x,
          y: origin.y,
          width: 30,
          height: 140,
          stroke: parent.options.backgroundColor2,
          fill: parent.options.backgroundColor2
        }));

      this.tape = new Kinetic.Group();
      // clipping region for moving altitude ladder
      layer.add(new pfd.ClippedGroup({
        x: origin.x,
        y: origin.y,
        width: 30,
        height: 140
      }).add(this.tape));

      // moving altitude ladder
      var smallFontSize = parent.options.fontSize * 0.9;
      for (var alt = 0; alt <= 400; alt += 1) {
        isMajorTick = (alt % 10 === 0);
        y = 70 - (4 * alt);
        if (isMajorTick) {
          this.tape.add(new Kinetic.Line({
            points: [0, y, 5, y],
            stroke: parent.options.fontColor,
            strokeWidth: 1.0,
            lineCap: 'square'
          }));
          this.tape.add(new Kinetic.Text({
            x: 7,
            y: y - smallFontSize / 2,
            fontSize: smallFontSize,
            fontFamily: parent.options.fontFamily,
            textFill: parent.options.fontColor,
            text: alt.toString()
          }));
        } else {
          this.tape.add(new Kinetic.Line({
            points: [0, y, 2, y],
            stroke: parent.options.fontColor,
            strokeWidth: 1.0,
            lineCap: 'square'
          }));
        }
      }
      
      // Instantaneous speed text
      this.inst = new Kinetic.Text({
        x: 7,
        y: 10 - Math.round(parent.options.fontSize / 2),
        text: 'UNK',
        fontSize: parent.options.fontSize,
        fontFamily: parent.options.fontFamily,
        textFill: parent.options.fontColor
      });
      layer.add(
        parent.makeGroup([
          new Kinetic.Polygon({
            points: [0, 10,
                     5, 0,
                     30, 0,
                     30, 20,
                     5, 20,
                     0, 10],
            stroke: parent.options.fontColor,
            strokeWidth: 1.0,
            fill: parent.options.backgroundColor1
          }),
          this.inst
        ], {
          x: origin.x,
          y: origin.y + 60
        }));

      // --------------------
      // end of alt tape

      // Altitude bug
      this.bug = new Kinetic.Polygon({
        x: origin.x - 1,
        y: origin.y + 70,
        points: [0, 0,
                 -3, -2,
                 -5, -2,
                 -5, 2,
                 -3, 2,
                 0, 0],
        stroke: parent.options.bugColor,
        fill: parent.options.bugColor,
        strokeWidth: 1.0,
        visible: false
      });
      layer.add(this.bug);

      this.setBug = function(target, current) {
        var y = origin.y + 70;
        y -= target * 4;
        y += current * 4;
        y = Math.min(162, Math.max(16, y));
        this.bug.setY(y);
      };
    }
  };
  
  pfd.PFD = function(container) {
    this.init(container);
  };

  pfd.PFD.prototype = {
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
      this.options.fontFamily = options.fontFamily || 'monospace,Tahoma,sans-serif';
      this.options.fontSize = options.fontSize || 8;
      this.options.fontColor = options.fontColor || 'white';
      this.options.backgroundColor1 = options.backgroundColor1 || 'black';
      this.options.backgroundColor2 = options.backgroundColor2 || 'rgb(60,60,60)';
      this.options.bugColor = options.bugColor || 'rgb(255,0,100)';
      this.options.highlightColor = options.highlightColor || 'rgb(255,255,255)';
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

      this.attitudeIndicator = new pfd.ArtificialHorizon({
        x: 35, y: 5, width: 130, height: 130,
        groundColor: this.options.groundColor,
        skyColor: this.options.skyColor
      });
      this.layer.add(this.attitudeIndicator);
      
      this.speedTape = new pfd.SpeedTape(this, this.layer, {x:0, y:0});
      this.altitudeTape = new pfd.AltTape(this, this.layer, {x:170, y:0});

      // Target altitude
      var smallFontSize = this.options.fontSize * 0.9;
      this.targetAltitudeDisplay = new Kinetic.Text({
        x: 170,
        y: 10,
        width: 30,
        align: 'center',
        fontSize: smallFontSize,
        fontFamily: this.options.fontFamily,
        textFill: this.options.bugColor});
      this.layer.add(this.targetAltitudeDisplay);
      
      // Target speed
      this.targetSpeedDisplay = new Kinetic.Text({
        x: 0,
        y: 10,
        width: 30,
        align: 'center',
        fontSize: smallFontSize,
        fontFamily: this.options.fontFamily,
        textFill: this.options.bugColor});
      this.layer.add(this.targetSpeedDisplay);

    },
    

    setSpeed: function(speed) {
      var spdTxt = 'ERR';
      if (speed != null) {
        spdTxt = speed.toString(); 
      }
      if (spdTxt.length > 3) {
        spdTxt = spdTxt.substring(0, 3);
        if (spdTxt.charAt(spdTxt.length - 1) == '.') {
          spdTxt = spdTxt.substr(0, spdTxt.length - 1);
        }
      }
      this.speedTape.inst.setText(spdTxt);
      this.speedTape.tape.setY(speed * 2);

      if (this.speedTape.bug.isVisible()) {
        this.speedTape.setBug(this.targetSpeed, this.speed);
      }
      //this.layer.draw();
    },

    setTargetSpeed: function(speed) {
      this.targetSpeed = speed;
      if (this.targetSpeed === null) {
        this.speedTape.bug.hide();
        this.targetSpeedDisplay.hide();
      } else {
        this.speedTape.setBug(this.targetSpeed, this.speed);
        this.speedTape.bug.show();
        this.targetSpeedDisplay.setText(Math.round(speed).toString());
        this.targetSpeedDisplay.show();
      }
      //this.layer.draw();
    },

    draw: function() {
      this.layer.draw();
    },

    setAltitude: function(altitude) {
      this.altitude = altitude;
      this.altitudeTape.inst.setText(Math.round(altitude).toString());
      this.altitudeTape.tape.setY(altitude * 4);
      if (this.altitudeTape.bug.isVisible()) {
        this.altitudeTape.setBug(this.targetAltitude, this.altitude);
      }
      //this.layer.draw();
    },

    setTargetAltitude: function(altitude) {
      this.targetAltitude = altitude;
      if (this.targetAltitude === null) {
        this.altitudeTape.bug.hide();
        this.targetAltitudeDisplay.hide();
      } else {
        this.altitudeTape.setBug(this.targetAltitude, this.altitude);
        this.altitudeTape.bug.show();
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

  window.pfd = pfd;

});

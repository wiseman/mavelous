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
//   * Underscore


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
            var horizon = this._getHorizon(this.pitch);
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
            this.drawScale(36, width * 0.4);
            this.drawScale(30, width * 0.05);
            this.drawScale(24, width * 0.3);
            this.drawScale(18, width * 0.05);
            this.drawScale(12, width * 0.2);
            this.drawScale(6, width * 0.05);

            // Undo the roll rotation so we can draw the plane figure
            // over the rotated elements.
            context.restore();

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

    drawScale: function(offset, scaleWidth) {
        var context = this.getContext();
        var height = this.attrs.height;
        var width = this.attrs.width;
        context.save();
        
        context.lineWidth = 1;
        context.strokeStyle = this.attrs.lineColor;
        var horizon = this._getHorizon(this.pitch + offset * Math.PI / 180);
        context.beginPath();
        context.moveTo(-scaleWidth/2, horizon);
        context.lineTo(scaleWidth/2, horizon);
        context.stroke();

        horizon = this._getHorizon(this.pitch - offset * Math.PI / 180);
        context.moveTo(-scaleWidth / 2, horizon);
        context.lineTo(scaleWidth / 2, horizon);
        context.stroke();
    
        context.restore();
    },

    _getHorizon: function(pitch) {
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


pfd.ADI = function(container) {
    this.init(container);
};

pfd.ADI.prototype = {
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
            x: 35, y: 25, width: 130, height: 130,
            groundColor: this.options.groundColor,
            skyColor: this.options.skyColor
        });
        this.layer.add(this.attitudeIndicator);

        // --------------------
        // Speed tape
        // The speed tape displays 3 pieces of info:
        //   * current speed
        //   * moving speed ladder
        //   * target speed, if set

        // background
        this.layer.add(
            new Kinetic.Rect({
                x: 0,
                y: 20,
                width: 30,
                height: 140,
                stroke: this.options.backgroundColor2,
                fill: this.options.backgroundColor2
            }));

        this.speedTape = new Kinetic.Group();
        // clipping region for moving speed ladder
        this.layer.add(new pfd.ClippedGroup({
            x: 0,
            y: 20,
            width: 30,
            height: 140
        }).add(this.speedTape));

        // moving speed ladder
        var smallFontSize = this.options.fontSize * 0.9;
        var isMajorTick, y;
        for (var spd = 0; spd <= 100; spd += 5) {
            isMajorTick = (spd % 10 === 0);
            y = 70 - (2 * spd);
            if (isMajorTick) {
                this.speedTape.add(new Kinetic.Line({
                    points: [25, y, 30, y],
                    stroke: this.options.fontColor,
                    strokeWidth: 1.0,
                    lineCap: 'square'
                }));
                this.speedTape.add(new Kinetic.Text({
                    x: 0,
                    y: y - smallFontSize / 2,
                    fontSize: smallFontSize,
                    fontFamily: this.options.fontFamily,
                    textFill: this.options.fontColor,
                    text: pfd.zeroPad(spd, 4, ' ')
                }));
            } else {
                this.speedTape.add(new Kinetic.Line({
                    points: [28, y, 30, y],
                    stroke: this.options.fontColor,
                    strokeWidth: 1.0,
                    lineCap: 'square'
                }));
            }
        }
        
        // Instantaneous speed text
        this.speedInst = new Kinetic.Text({
            x: 2,
            y: 10 - this.options.fontSize / 2,
            text: 'UNK',
            fontSize: this.options.fontSize,
            fontFamily: this.options.fontFamily,
            textFill: this.options.fontColor
        });
        this.layer.add(
            this.makeGroup([
                new Kinetic.Polygon({
                    points: [0, 0,
                             25, 0,
                             30, 10,
                             25, 20,
                             0, 20,
                             0, 0],
                    stroke: this.options.fontColor,
                    strokeWidth: 1.0,
                    fill: this.options.backgroundColor1
                }),
                this.speedInst
            ], {
                x: 0,
                y: 80
            }));

        // end of speed tape
        // --------------------

        // Target altitude
        this.targetAltitudeDisplay = new Kinetic.Text({
            x: 170,
            y: 10,
            fontSize: smallFontSize,
            fontFamily: this.options.fontFamily,
            textFill: this.options.bugColor});
        this.layer.add(this.targetAltitudeDisplay);
            
        // Target speed
        this.targetSpeedDisplay = new Kinetic.Text({
            x: 0,
            y: 10,
            fontSize: smallFontSize,
            fontFamily: this.options.fontFamily,
            textFill: this.options.bugColor});
        this.layer.add(this.targetSpeedDisplay);
            
        // Speed bug
        this.speedBug = new Kinetic.Polygon({
            x: 31,
            y: 90,
            points: [0, 0,
                     3, -2,
                     5, -2,
                     5, 2,
                     3, 2,
                     0, 0],
            stroke: this.options.bugColor,
            fill: this.options.bugColor,
            strokeWidth: 1.0,
            visible: false
        });
        this.layer.add(this.speedBug);

        // --------------------
        // altitude tape

        // background
        this.layer.add(
            new Kinetic.Rect({
                x: 170,
                y: 20,
                width: 30,
                height: 140,
                stroke: this.options.backgroundColor2,
                fill: this.options.backgroundColor2
            }));

        this.altitudeTape = new Kinetic.Group();
        // clipping region for moving altitude ladder
        this.layer.add(new pfd.ClippedGroup({
            x: 170,
            y: 20,
            width: 30,
            height: 140
        }).add(this.altitudeTape));

        // moving altitude ladder
        for (var alt = 0; alt <= 400; alt += 1) {
            isMajorTick = (alt % 10 === 0);
            y = 70 - (4 * alt);
            if (isMajorTick) {
                this.altitudeTape.add(new Kinetic.Line({
                    points: [0, y, 5, y],
                    stroke: this.options.fontColor,
                    strokeWidth: 1.0,
                    lineCap: 'square'
                }));
                this.altitudeTape.add(new Kinetic.Text({
                    x: 6,
                    y: y - smallFontSize / 2,
                    fontSize: smallFontSize,
                    fontFamily: this.options.fontFamily,
                    textFill: this.options.fontColor,
                    text: alt.toString()
                }));
            } else {
                this.altitudeTape.add(new Kinetic.Line({
                    points: [0, y, 2, y],
                    stroke: this.options.fontColor,
                    strokeWidth: 1.0,
                    lineCap: 'square'
                }));
            }
        }
        
        // Instantaneous speed text
        this.altitudeInst = new Kinetic.Text({
            x: 6,
            y: 10 - Math.round(this.options.fontSize / 2),
            text: 'UNK',
            fontSize: this.options.fontSize,
            fontFamily: this.options.fontFamily,
            textFill: this.options.fontColor
        });
        this.layer.add(
            this.makeGroup([
                new Kinetic.Polygon({
                    points: [0, 10,
                             5, 0,
                             30, 0,
                             30, 20,
                             5, 20,
                             0, 10],
                    stroke: this.options.fontColor,
                    strokeWidth: 1.0,
                    fill: this.options.backgroundColor1
                }),
                this.altitudeInst
            ], {
                x: 170,
                y: 80
            }));

        // --------------------
        // end of speed tape

        // Altitude bug
        this.altitudeBug = new Kinetic.Polygon({
            x: 169,
            y: 90,
            points: [0, 0,
                     -3, -2,
                     -5, -2,
                     -5, 2,
                     -3, 2,
                     0, 0],
            stroke: this.options.bugColor,
            fill: this.options.bugColor,
            strokeWidth: 1.0,
            visible: false
        });
        this.layer.add(this.altitudeBug);

        this.flightModeRect = new Kinetic.Rect({
            x: 1,
            y: 1,
            width: 60,
            height: 9,
            stroke: this.options.highlightColor,
            strokeWidth: 1.0,
            visible: false});
        this.layer.add(this.flightModeRect);

        this.flightModeDisplay = new Kinetic.Text({
            x: 2,
            y: 2,
            text: '',
            fontSize: this.options.fontSize,
            fontFamily: this.options.fontFamily,
            textFill: this.options.fontColor
        });
        this.layer.add(this.flightModeDisplay);

        this.statusText = new Kinetic.Text({
            x: 2,
            y: 170,
            text: '',
            fontSize: smallFontSize,
            fontFamily: this.options.fontFamily,
            textFill: this.options.fontSize
        });
        this.layer.add(this.statusText);

    },
                                           

    _calcSpeedBugY: function() {
        var y = 90;
        y -= this.targetSpeed * 2;
        y += this.speed * 2;
        y = Math.min(162, Math.max(16, y));
        return y;
    },

    _calcAltitudeBugY: function() {
        var y = 90;
        y -= this.targetAltitude * 4;
        y += this.altitude * 4;
        y = Math.min(162, Math.max(16, y));
        return y;
    },

    setSpeed: function(speed) {
        this.speed = speed;
        var spdTxt = speed.toString();
        if (spdTxt.length > 3) {
            spdTxt = spdTxt.substring(0, 3);
            if (spdTxt.charAt(spdTxt.length - 1) == '.') {
                spdTxt = spdTxt.substr(0, spdTxt.length - 1);
            }
        }
        spdTxt = pfd.zeroPad(spdTxt, 3, ' ');
        this.speedInst.setText(spdTxt);
        this.speedTape.setY(speed * 2);

        if (this.speedBug.isVisible()) {
            this.speedBug.setY(this._calcSpeedBugY());
        }
        //this.layer.draw();
    },

    setTargetSpeed: function(speed) {
        this.targetSpeed = speed;
        if (this.targetSpeed === null) {
            this.speedBug.hide();
            this.targetSpeedDisplay.hide();
        } else {
            this.speedBug.setY(this._calcSpeedBugY());
            this.speedBug.show();
            this.targetSpeedDisplay.setText(pfd.zeroPad(
                Math.round(speed), 4, ' '));
            this.targetSpeedDisplay.show();
        }
        //this.layer.draw();
    },

    draw: function() {
        this.layer.draw();
    },

    setAltitude: function(altitude) {
        this.altitude = altitude;
        this.altitudeInst.setText(pfd.zeroPad(Math.round(altitude), 3, ' '));
        this.altitudeTape.setY(altitude * 4);
        if (this.altitudeBug.isVisible()) {
            this.altitudeBug.setY(this._calcAltitudeBugY());
        }
        //this.layer.draw();
    },

    setTargetAltitude: function(altitude) {
        this.targetAltitude = altitude;
        if (this.targetAltitude === null) {
            this.altitudeBug.hide();
            this.targetAltitudeDisplay.hide();
        } else {
            this.altitudeBug.setY(this._calcAltitudeBugY());
            this.altitudeBug.show();
            this.targetAltitudeDisplay.setText(pfd.zeroPad(
                Math.round(altitude), 4, ' '));
            this.targetAltitudeDisplay.show();
        }
        //this.layer.draw();
    },

    setHeading: function(heading) {
    },

    setFlightMode: function(mode) {
        if (mode != this.flightMode) {
            this.flightMode = mode;
            this.flightModeDisplay.setText(mode);
            this.flightModeRect.setWidth(mode.length * this.options.fontSize);
            this.flightModeRect.setAlpha(1.0);
            this.flightModeRect.show();
            this.flightModeRect.transitionTo({
                alpha: 0.0,
                duration: 10,
                easing: 'ease-out'
            });
        }
    },

    setAttitude: function(pitch, roll) {
        this.attitudeIndicator.setPitchRoll(pitch, roll);
    },

    setStatusText: function(status) {
        this.statusText.setText(status);
    }
};

mmap = {};

mmap.location = null;
mmap.map = null;
mmap.mapLayer = null;
mmap.markerLayer = null;
mmap.waypointMarkerElement = null;
mmap.mapPanner = null;
mmap.lastMessageHandledTime = null;
mmap.adi = null;
mmap.statusTextSeq = null;
mmap.chimeAudio = new Audio('drone_chime.mp3');
mmap.clientWaypointSeq = null;
mmap._alt = null;

mmap.zeroPad = function(number, width, padChar) {
    if (!padChar) {
        padChar = '0';
    }
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join(padChar) + number;
    }
    return number + ""; // always return a string
};

function MapPanner(map) {
    var theMapPanner = this;
    this.map = map;
    this.targetLocation = null;
    
    this.animateToCenter = function() {
        var need_more_animation = false;
        var curLocation = theMapPanner.map.getCenter();
        var nextLat = curLocation.lat + (theMapPanner.targetLocation.lat - curLocation.lat) * 0.2;
        var nextLon = curLocation.lon + (theMapPanner.targetLocation.lon - curLocation.lon) * 0.2;
        if (Math.abs(nextLat - curLocation.lat) < 0.00001) {
            nextLat = theMapPanner.targetLocation.lat;
        } else {
            need_more_animation = true;
        }
        if (Math.abs(nextLon - curLocation.lon) < 0.00001) {
            nextLon = theMapPanner.targetLocation.lon;
        } else {
            need_more_animation = true;
        }
        theMapPanner.map.setCenter(new MM.Location(nextLat, nextLon));
        if (need_more_animation) {
            MM.getFrame(this.animateToCenter);
        }
    };

    this.setCenter = function(location) {
        this.targetLocation = location;
        MM.getFrame(this.animateToCenter);
    };
}


mmap.ArtificialHorizon = Kinetic.Shape.extend({
    init: function(config) {
        this.setDefaultAttrs({
            width: 0,
            height: 0,
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
            var horizon = this.getHorizon(this.pitch);
            var context = this.getContext();
            var width = this.attrs.width;
            var height = this.attrs.height;

            context.save();
            context.translate(width / 2, height / 2);

            context.save();

            // Set up clipping.
            context.beginPath();
            context.rect(-width / 2, -height / 2, width, height);
            context.clip();

            context.rotate(this.roll);

            // Draw ground
            context.fillStyle = this.attrs.groundColor;
            context.strokeStyle = this.attrs.lineColor;
            context.lineWidth = 3;
            context.beginPath();
            context.rect(-width, horizon, width * 2, height);
            context.fill();

            // Draw sky
            context.fillStyle = this.attrs.skyColor;
            context.beginPath();
            context.rect(-width, -height, width * 2, height + horizon);
            context.fill();

            // Draw horizon
            context.beginPath();
            context.lineWidth = 1;
            context.moveTo(-width / 2, horizon);
            context.lineTo(width / 2, horizon);
            context.stroke();
    
            // draw scale
            this.drawScale(36, width * 0.4);
            this.drawScale(30, width * 0.05);
            this.drawScale(24, width * 0.3);
            this.drawScale(18, width * 0.05);
            this.drawScale(12, width * 0.2);
            this.drawScale(6, width * 0.05);
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
        var horizon = this.getHorizon(this.pitch + offset * Math.PI / 180);
        context.beginPath();
        context.moveTo(-scaleWidth/2, horizon);
        context.lineTo(scaleWidth/2, horizon);
        context.stroke();

        horizon = this.getHorizon(this.pitch - offset * Math.PI / 180);
        context.moveTo(-scaleWidth / 2, horizon);
        context.lineTo(scaleWidth / 2, horizon);
        context.stroke();
    
        context.restore();
    },


    getHorizon: function(pitch) {
        return Math.sin(pitch) * this.radius;
    },

    setPitchRoll: function(pitch, roll) {
        this.pitch = pitch;
        this.roll = roll;
    }
});

// Like a regular group except that it draws its children with a
// clipping region active.  Requires a width and height.

mmap.ClippedGroup = Kinetic.Container.extend({
    init: function(config) {
        this.nodeType = 'Group';
        
        // call super constructor
        this._super(config);
    },

    draw: function() {
        if(this.attrs.visible) {
            var xform = this.getAbsoluteTransform();
            var m = xform.getMatrix();
            var width = this.attrs.width;
            var height = this.attrs.height;
            var canvas = this.getLayer().getContext();
            canvas.save();
            canvas.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            canvas.beginPath();
            canvas.rect(0, 0, this.attrs.width, this.attrs.height);
            // canvas.lineWidth = 2;
            // canvas.strokeStyle = 'black';
            // canvas.stroke();
            canvas.clip();
            xform.invert();
            m = xform.getMatrix();
            canvas.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            this._drawChildren();
            canvas.restore();
        }
    }
});


mmap.ADI = function(container) {
    this.init(container);
};

mmap.ADI.prototype = {
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

        this.attitudeIndicator = new mmap.ArtificialHorizon({
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
        this.layer.add(new mmap.ClippedGroup({
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
                    text: mmap.zeroPad(spd, 4, ' ')
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
        this.layer.add(new mmap.ClippedGroup({
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
        spdTxt = mmap.zeroPad(spdTxt, 3, ' ');
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
            this.targetSpeedDisplay.setText(mmap.zeroPad(
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
        this.altitudeInst.setText(mmap.zeroPad(Math.round(altitude), 3, ' '));
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
            this.targetAltitudeDisplay.setText(mmap.zeroPad(
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

mmap.initMap = function() {
    // Microsoft Bing
    // please use your own API key!  This is jjwiseman's!
    var key = 'Anmc0b2q6140lnPvAj5xANM1rvF1A4CvVtr6H2VJvQcdnDvc8NL-I2C49owIe9xC';
    var style = 'AerialWithLabels';
    var provider = new MM.BingProvider(key, style);

    mmap.mapLayer = new MM.Layer(provider);
    mmap.markerLayer = new MM.MarkerLayer();
    var eventHandlers = [
	new MouseWheelHandler(),
	new TouchHandler(),
	new DoubleClickHandler()
    ];
    mmap.map = new MM.Map('map', mmap.mapLayer, undefined, eventHandlers);
    mmap.map.addLayer(mmap.markerLayer);

    mmap.map.setCenterZoom(new MM.Location(20.0, 0), 18);

    setInterval(mmap.updateState, 250);
    $('#layerpicker').change(mmap.updateLayer);

    mmap.mapPanner = new MapPanner(mmap.map);
    
    mmap.adi = new mmap.ADI('adi');

    var zoomSlider = document.getElementById('zoom');
    zoomSlider.onchange = function() {
        var sliderProp = (zoomSlider.value - zoomSlider.min) / (zoomSlider.max - zoomSlider.min);
        var targetZoom = sliderProp * 18.0; 
        mmap.map.setZoom(targetZoom);
    };

    mmap.altSlider = document.getElementById('altinput');
    mmap.setAlt(mmap.altSlider.value, false);
    mmap.altSlider.onchange = function () {
      mmap.setAlt(mmap.altSlider.value, false);
    };

    document.getElementById('altinput_submit').onclick = function () {
      if (mmap.lastFlyTo){
        mmap.flyTo(mmap.lastFlyTo);
      }
    };
};


mmap.updateLinkStatus = function() {
    var now = (new Date()).getTime();
    if (!mmap.lastMessageHandledTime) {
        $('#t_link').html('<span class="link error">NO</span>');
    } else if (now - mmap.lastMessageHandledTime > 5000) {
        $('#t_link').html('<span class="link error">TIMEOUT</span>');
    } else if (now - mmap.lastMessageHandledTime > 1000) {
        $('#t_link').html('<span class="link slow">SLOW</span>');
    } else {
        $('#t_link').html('<span class="link ok">OK</span>');
    }
};


mmap.arduPlaneFlightModes = {
    0: 'MANUAL',
    1: 'CIRCLE',
    2: 'STABILIZE',
    5: 'FBWA',
    6: 'FBWB',
    7: 'FBWC',
    10: 'AUTO',
    11: 'RTL',
    12: 'LOITER',
    13: 'TAKEOFF',
    14: 'LAND',
    15: 'GUIDED',
    16: 'INITIALIZING'
};

mmap.arduCopterFlightModes = {
    0: 'STABILIZE',
    1: 'ACRO',
    2: 'ALT_HOLD',
    3: 'AUTO',
    4: 'GUIDED',
    5: 'LOITER',
    6: 'RTL',
    7: 'CIRCLE',
    8: 'POSITION',
    9: 'LAND',
    10: 'OF_LOITER',
    11: 'APPROACH'
};

mmap.MAV_TYPE_QUADROTOR = 2;
mmap.MAV_TYPE_FIXED_WING = 1;
mmap.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED = 1;


mmap.flightModeString = function(msg) {
    var mode;
    if (!msg.base_mode & mmap.MAV_MODE_FLAG_CUSTOM_MODE_ENABLED) {
        mode = 'Mode(' + msg.base_mode + ')';
    } else if (msg.type == mmap.MAV_TYPE_QUADROTOR &&
               msg.custom_mode in mmap.arduCopterFlightModes) {
        mode = mmap.arduCopterFlightModes[msg.custom_mode];
    } else if (msg.type == mmap.MAV_TYPE_FIXED_WING &&
               msg.custom_mode in mmap.arduPlaneFlightModes) {
        mode = mmap.arduPlaneFlightModes[msg.custom_mode];
    } else {
        mode = 'Mode(' + msg.custom_mode + ')';
    }
    return mode;
};


mmap.handleHeartbeat = function(time, index, msg) {
    mmap.adi.setFlightMode(mmap.flightModeString(msg));
    $('#t_flt_mode').html(mmap.flightModeString(msg));
};


mmap.handleGpsRaw = function(time, index, msg) {
    $('#t_lat').html(msg.lat.toPrecision(11));
    $('#t_lon').html(msg.lon.toPrecision(11));
    mmap.location = {lat: msg.lat, lon: msg.lon};
};


mmap.handleGpsRawInt = function(time, index, msg) {
    if (msg.fix_type >= 3) {
        $('#t_gps').html('<span class="ok">OK</span>');
    } else if (msg.fix_type == 2) {
        $('#t_gps').html('<span class="slow">02</span>');
    } else {
        $('#t_gps').html('<span class="error">' + msg.fix_type + '</span>');
    }
    var lat = msg.lat / 1.0e7;
    var lon = msg.lon / 1.0e7;
    $('#t_lat').html(lat.toPrecision(11));
    $('#t_lon').html(lon.toPrecision(11));
    mmap.location = {lat: lat, lon: lon};
};


mmap.updateMap = function() {
    var location = new MM.Location(mmap.location.lat, mmap.location.lon);
    if (!mmap.lastMessageHandledTime) {
        mmap.map.setCenter(location);
    } else {
        mmap.mapPanner.setCenter(location);
    }
};


mmap.handleVfrHud = function(time, index, msg) {
    $('#t_alt').html(msg.alt.toPrecision(4));
    $('#t_gspd').html(msg.groundspeed.toPrecision(2));
    $('#t_aspd').html(msg.airspeed.toPrecision(2));
    $('#t_hdg').html(msg.heading);
    mmap.rotateDrone(msg.heading);
    mmap.adi.setSpeed(msg.airspeed);
    mmap.airspeed = msg.airspeed;
    mmap.adi.setAltitude(msg.alt);
    mmap.altitude = msg.alt;
};


mmap.handleAttitude = function(time, index, msg) {
    mmap.adi.setAttitude(msg.pitch, msg.roll);
};


mmap.handleNavControllerOutput = function(time, index, msg) {
    if (Math.abs(msg.alt_error) > 0) {
        mmap.adi.setTargetAltitude(mmap.altitude + msg.alt_error);
    }
    if (Math.abs(msg.aspd_error) > 0) {
        mmap.adi.setTargetSpeed(mmap.airspeed + msg.aspd_error);
    }
};


mmap.handleMetaWaypoint = function(time, index, msg) {
    if (!mmap.clientWaypointSeq || mmap.clientWaypointSeq < index) {
	mmap.clientWaypointSeq = index;
	mmap.newWaypoint(msg.waypoint);
    }
};


mmap.handleStatusText = function(time, index, msg) {
    if ((mmap.statusTextSeq === null) || index > mmap.statusTextSeq) {
        mmap.statusTextSeq = index;
        var audioElement = new Audio('drone_chime.mp3');
        audioElement.play();
        mmap.adi.setStatusText(msg.text);
        $('#t_sta_txt').html(msg.text)
            .stop(true, true)
            .css('color', 'yellow')
            .css('background-color', 'rgb(0, 0, 0, 1.0)')
            .animate({
                color: $.Color('yellow'),
                backgroundColor: $.Color('rgb(0, 0, 0, 1.0)')
            }, {
                duration: 200,
                queue: true
            })
            .animate({
                color: $.Color('white'),
                backgroundColor: $.Color('rgb(0, 0, 0, 0.0)')
            }, {
                duration: 5000,
                queue: true
            });
    }
};


mmap.setAlt = function(newalt, updateslider) {
  if (updateslider) {
    mmap.altSlider.value = newalt;
  }
  mmap._alt = newalt;
    $('#v_altwaypt').html(newalt.toString());
};


mmap.getAlt = function() { 
  return mmap._alt;
};

mmap.messageHandlerMap = {
    'HEARTBEAT': mmap.handleHeartbeat,
    'GPS_RAW': mmap.handleGpsRaw,
    'GPS_RAW_INT': mmap.handleGpsRawInt,
    'VFR_HUD': mmap.handleVfrHud,
    'ATTITUDE': mmap.handleAttitude,
    'STATUSTEXT': mmap.handleStatusText,
    'NAV_CONTROLLER_OUTPUT': mmap.handleNavControllerOutput,
    'META_WAYPOINT': mmap.handleMetaWaypoint
};


mmap.handleMessages = function(msgs) {
  /* msgs is a dict: (key : messagetype, value : messages) */
  for (var mtype in msgs) {
    if (mtype in mmap.messageHandlerMap){
      mmap.handleMessage(msgs[mtype]);
    }
  }
    mmap.adi.draw();
};


mmap.handleMessage = function(msg) {
    var handler = mmap.messageHandlerMap[msg.msg.mavpackettype];
    if (handler) {
        handler(msg.time_usec, msg.index, msg.msg);
    } else {
        console.warn(
            'No handler defined for message type ' + msg.msg.mavpackettype);
    }
};


mmap.updateState = function() {
    var msgTypes = Object.keys(mmap.messageHandlerMap);
    $.getJSON('mavlink/' + msgTypes.join('+'),
              function(msgs) {
                  mmap.handleMessages(msgs);
                  mmap.updateMap();
                  mmap.lastMessageHandledTime = new Date().getTime();
              });
    mmap.updateLinkStatus();
};


mmap.newWaypoint = function(location) {
    if (!mmap.waypointMarkerElement) {
	mmap.waypointMarkerElement = document.createElement('div');
	mmap.waypointMarkerElement.innerHTML = '<img src="mapmarker.png" width="50" height="50">';
	mmap.waypointMarkerElement.pixelOffset = {x: -25, y: -50};
	mmap.markerLayer.addMarker(mmap.waypointMarkerElement, location);
    } else {
	mmap.waypointMarkerElement.location = location;
	mmap.waypointMarkerElement.coord = mmap.map.locationCoordinate(location);
	mmap.markerLayer.repositionMarker(mmap.waypointMarkerElement);
    }
  mmap.setAlt(location.alt, true);
  mmap.lastFlyTo = location; 
};


mmap.rotateDrone = function(deg){
    var rotate = 'rotate(' + (deg) + 'deg);';
    var tr = new Array(
        'transform:' + rotate,
        '-moz-transform:' + rotate,
        '-webkit-transform:' + rotate,
        '-ms-transform:' + rotate,
        '-o-transform:' + rotate
    );
    var drone = document.getElementById('drone');
    drone.setAttribute('style', tr.join(';'));
};


mmap.updateMapLayer = function() {
    var provider;
    var layerNum = $(this).attr('value');
    var bing_key = 'Anmc0b2q6140lnPvAj5xANM1rvF1A4CvVtr6H2VJvQcdnDvc8NL-I2C49owIe9xC';
    var style;
    if (layerNum == '1') {
        style = 'AerialWithLabels';
        provider = new MM.BingProvider(bing_key, style,
                                       function(provider) {
                                           mmap.mapLayer.setProvider(provider);
                                       });
    } else if (layerNum == '2') {
        style = 'BirdseyeWithLabels';
        provider = new MM.BingProvider(bing_key, style,
                                       function(provider) {
                                           mmap.mapLayer.setProvider(provider);
                                       });
    } else if (layerNum == '3') {
        style = 'Road';
        provider = new MM.BingProvider(bing_key, style,
                                       function(provider) {
                                           mmap.mapLayer.setProvider(provider);
                                       });
    } else if (layerNum == '4') {
        provider = new MM.BlueMarbleProvider();
        mmap.mapLayer.setProvider(provider);
    }
};


mmap.lastFlyTo = null;
mmap.flyTo = function(location) {
    var loc = {lat: location.lat,
               lon: location.lon,
               alt: mmap.getAlt() };
  mmap.lastFlyTo = loc;
    $.ajax({
        type: 'POST',
        url: '/command',
        data: JSON.stringify({command: 'FLYTO',
                              location: loc })
    });
};

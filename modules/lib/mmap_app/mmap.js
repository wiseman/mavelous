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
        this.options = options || {};
        this.options.fontFamily = this.options.fontFamily || 'Tahoma,sans-serif';
        this.options.fontSize = this.options.fontSize || 8;
        this.options.fontColor = this.options.fontColor || 'white';
        this.options.backgroundColor1 = this.options.backgroundColor1 || 'black';
        this.options.backgroundColor2 = this.options.backgroundColor2 || 'rgb(60,60,60)';

        var containerElt = document.getElementById(container);
        this.stage = new Kinetic.Stage({
            container: container,
            width: containerElt.offsetWidth,
            height: containerElt.offsetHeight
        });
        this.layer = new Kinetic.Layer();
        this.stage.add(this.layer);
        this.stage.setScale(containerElt.offsetWidth / 200.0,
                            containerElt.offsetHeight / 200.0);

        // --------------------
        // Speed tape

        this.layer.add(
            new Kinetic.Rect({
                x: 0,
                y: 20,
                width: 30,
                height: 140,
                stroke: this.options.backgroundColor2,
                fill: this.options.backgroundColor2
            }));

        this.speedTape = new mmap.ClippedGroup({
            x: 0,
            y: 20,
            width: 30,
            height: 140
        });

        var smallFontSize = this.options.fontSize * 0.9;
        for (var spd = 0; spd <= 100; spd += 5) {
            var isMajorTick = (spd % 10 === 0);
            var y = 70 - (2 * spd);
            if (isMajorTick) {
                this.speedTape.add(new Kinetic.Line({
                    points: [25, y, 30, y],
                    stroke: 'white',
                    strokeWidth: 1.0,
                    lineCap: 'square'
                }));
                this.speedTape.add(new Kinetic.Text({
                    x: 0,
                    y: y - smallFontSize / 2,
                    fontSize: smallFontSize,
                    fontFamily: this.options.fontFamily,
                    textFill: this.options.fontColor,
                    text: mmap.zeroPad(spd, 5, ' ')
                }));
            } else {
                this.speedTape.add(new Kinetic.Line({
                    points: [28, y, 30, y],
                    stroke: 'white',
                    strokeWidth: 1.0,
                    lineCap: 'square'
                }));
            }
        }
        this.layer.add(this.speedTape);
        
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
                    stroke: 'white',
                    strokeWidth: 1.0,
                    fill: this.options.backgroundColor1
                }),
                this.speedInst
            ], {
                x: 0,
                y: 80
            }));

        this.altitudeInst = new Kinetic.Text({
            x: 10,
            y: 20,
            text: '',
            fontSize: this.options.fontSize,
            fontFamily: this.options.fontFamily,
            textFill: this.options.fontColor
        });
        this.layer.add(this.altitudeInst);

        this.flightMode = new Kinetic.Text({
            x: 10,
            y: 30,
            text: '',
            fontSize: this.options.fontSize,
            fontFamily: this.options.fontFamily,
            textFill: this.options.fontColor
        });
        this.layer.add(this.flightMode);

        this.statusText = new Kinetic.Text({
            x: 10,
            y: 40,
            text: '',
            fontSize: this.options.fontSize,
            fontFamily: this.options.fontFamily,
            textFill: this.options.fontSize
        });
        this.layer.add(this.statusText);
    },
                                           

    setAltitude: function(altitude) {
        //this.altitudeInst.setText(mmap.zeroPad(Math.round(altitude), 3));
        this.layer.draw();
    },

    setTargetAltitude: function(altitude) {
    },

    setSpeed: function(speed) {
        this.speedInst.setText(speed.toPrecision(2));
        this.layer.draw();
    },

    setTargetSpeed: function(speed) {
    },

    setHeading: function(heading) {
    },

    setFlightMode: function(mode) {
        // this.flightMode.setText('MODE ' + mode);
    },

    setAttitude: function(pitch, roll) {
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
    mmap.adi.setSpeed(msg.groundspeed);
    mmap.adi.setAltitude(msg.alt);
};


mmap.handleAttitude = function(time, index, msg) {
    mmap.adi.setAttitude(msg.pitch, msg.roll);
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
  $('#v_altwaypt').html(newalt.toString())
}

mmap.getAlt = function() { 
  return mmap._alt;
}

mmap.messageHandlerMap = {
    'HEARTBEAT': mmap.handleHeartbeat,
    'GPS_RAW': mmap.handleGpsRaw,
    'GPS_RAW_INT': mmap.handleGpsRawInt,
    'VFR_HUD': mmap.handleVfrHud,
    'ATTITUDE': mmap.handleAttitude,
    'STATUSTEXT': mmap.handleStatusText,
    'META_WAYPOINT': mmap.handleMetaWaypoint
};


mmap.handleMessages = function(msgs) {
    for (var i = 0; i < msgs.length; i++) {
        mmap.handleMessage(msgs[i]);
    }
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
  var loc = {lat: location.lat
            , lon: location.lon
            , alt: mmap.getAlt() };
  mmap.lastFlyTo = loc;
    $.ajax({
        type: 'POST',
        url: '/command',
        data: JSON.stringify({command: 'FLYTO',
                              location: loc })
    });
};

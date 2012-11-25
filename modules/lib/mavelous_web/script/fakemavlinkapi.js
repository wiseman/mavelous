$(function(){
  window.Mavelous = window.Mavelous || {};

  var deg2rad = function (deg) {
    return deg * Math.PI / 180.0;
  };
  
  var rad2deg = function (rad) {
    return rad * 180.0 / Math.PI;
  };


  var fakeAttitude = function (state) {
    return { pitch: deg2rad(state.pitch)
           , roll: deg2rad(state.roll)
           }; 
  };

  var fakeVfrHud = function (state) {
    return { heading: state.heading
           , alt: state.alt 
           , airspeed: state.velocity
           }; 
  };

  var fakeNavControllerOutput = function (state) {
    return { alt_error: 30 - state.alt
           , aspd_error: 4 - state.velocity
           }; 
  };

  var fakeGpsRawInt = function (state) {
    return { fix_type: 3
           , lat: Math.round(state.lat * 10e6)
           , lon: Math.round(state.lon * 10e6)
           }; 
  };

  var fakeMetaWaypoint = function (state) {
    /* Left intentionally empty */
    return {}; 
  };

  var fakeHeartbeat = function (state) {
    return { type: 2 /* MAV_TYPE_QUADROTOR */
           , base_mode: 129 /* MAV_MODE_FLAG_CUSTOM_MODE_ENABLED = 1
                             | MAV_MODE_FLAG_SAFETY_ARMED = 128 */ 
           , custom_mode: 3 /* ArduCopter AUTO mode */
           }; 
  };

  var fakeMetaLinkquality = function (state) {
    return { master_in: Math.floor(11*state.t)
           , master_out: Math.floor(9*state.t)
           , mav_loss: 0
           }; 
  };

  var fakeGpsStatus = function (state) {
    return { satellites_visible: 8 };
  };

  var fakeStatustext = function (state) {
    return { text: "Offline mode" }; 
  };

  var fakeSysStatus = function (state) {
    /* Left intentionally empty */
    return {}; 
  };

  var fakeHandlers = {
    'ATTITUDE': fakeAttitude,
    'VFR_HUD': fakeVfrHud,
    'NAV_CONTROLLER_OUTPUT': fakeNavControllerOutput,
    'GPS_RAW_INT': fakeGpsRawInt,
    'META_WAYPOINT': fakeMetaWaypoint,
    'HEARTBEAT': fakeHeartbeat,
    'META_LINKQUALITY': fakeMetaLinkquality,
    'GPS_STATUS': fakeGpsStatus,
    'STATUSTEXT': fakeStatustext,
    'SYS_STATUS': fakeSysStatus
  };  


/**
 * calculate destination point given start point, initial bearing (deg) 
 * and distance (km)
 * see http://williams.best.vwh.net/avform.htm#LL
 * from http://imedea.uib-csic.es/tmoos/gliders/administracion/documentacion/Javascript_Documentacion/overview-summary-latlon.js.html
 */


  var nextposition = function(model, dt) {
    var R = 6371; // earth's mean radius in km
    var lat1 = deg2rad(model.get('lat'));
    var lon1 = deg2rad(model.get('lon'));
    var brng = deg2rad(model.get('heading'));
    var d = (model.get('velocity') * dt) / 1000; // m to km

    var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + 
                          Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
    var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), 
                                 Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));
    lon2 = (lon2+Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180...+180

    if (isNaN(lat2) || isNaN(lon2)) return null;
    return { lat: rad2deg(lat2), lon: rad2deg(lon2) };
  };

  /* Very crude model of a vehicle - just enough to show the map working
   * offline. */

  Mavelous.FakeVehicle = Backbone.Model.extend({
    defaults: function () {
      return {
        lat: 37.7751,
        lon: -122.4190,
        alt: 30,
        heading: 90,
        pitch: 0,
        roll: 0,
        velocity: 10,
        t: 0
      };
    },
    initialize: function() {
      var t = Date.now()
      this.firstupdate = t;
      this.lastupdate = t;
    },

    update : function () {
      var tnow = Date.now();
      var dt = (tnow - this.lastupdate) / 1000;
      var t = (tnow - this.firstupdate) / 1000;
      var newposition = nextposition(this, dt);

      var c = this.toJSON();
      /* multiplied by a constant which is more or less eyeballed... */
      var deltaalt  = 2 * dt * c.velocity * Math.sin(deg2rad(c.pitch));
      var deltahead = 4 * dt * c.velocity * Math.sin(deg2rad(c.roll));

      this.set({ lat: newposition.lat
               , lon: newposition.lon
               , alt : c.alt + deltaalt
               , heading: c.heading + deltahead
                 /* pitch and roll follow a sinusoid */
               , pitch:  8 * Math.sin(t)
               , roll : 5 + 15 * Math.sin(t / 2)
               , t: t
               });

      this.lastupdate = tnow;
    },

    requestMessages: function ( msgModels ) {
      var state = this.toJSON();
      var results = {};
      _.each(msgModels, function(mdl, name) {
        if (name in fakeHandlers) {
          var mdlidx = mdl.get('_index') || 0;
          results[name] = 
            { index: mdlidx + 1 
            , msg : fakeHandlers[name](state)
            }
        } 
      });
      return results;
    }
  });
});


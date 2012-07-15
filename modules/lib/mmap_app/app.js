
$(function(){ 

  var vfrHudModel    = new VfrHudModel;
  var gpsRawIntModel = new GpsRawIntModel;
  var heartbeatModel = new HeartbeatModel;

  var mavlinkAPI = new MavlinkAPI(
        { 'HEARTBEAT':     sendNewMavlinkMessageToModel( heartbeatModel )
        , 'GPS_RAW_INT':   sendNewMavlinkMessageToModel( gpsRawIntModel )
        , 'VFR_HUD':       sendNewMavlinkMessageToModel( vfrHudModel )
        , 'ATTITUDE':      function (garbage) {}
        , 'META_WAYPOINT': function (garbage) {}
        }
      , function () { console.log('mavlink api fail'); });

  var vfrtextview  = new VfrHudTextView({ model: vfrHudModel });
  var gpstextview  = new GpsTextView({ model: gpsRawIntModel });
  var modetextview = new ModeTextView({ model: heartbeatModel });

  console.log('appview initialized');
  
  /* hacky test code: */

  setInterval(function() {
    console.log("tick");
    /*
    var curralt = vfrHudModel.get("alt");
    vfrHudModel.set({alt: (curralt + 1) });
    */
    mavlinkAPI.update();

  }, 1000); 

  /*
  setTimeout( function () {
    gpsRawIntModel.set({
      "fix_type": 3,
      "lat": 455194392,
      "lon": -1226321082
    });
  }, 3000);

  setTimeout( function () {
    heartbeatModel.set({
      "type": 2,
      "autopilot": 3,
      "base_mode": 81,
      "custom_mode": 0,
      "system_status": 4,
      "mavlink_version": 3
    });
  }, 5000);
  */
});

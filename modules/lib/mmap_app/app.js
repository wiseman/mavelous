
$(function(){ 

  var vfrHudModel       = new VfrHudModel;
  var gpsRawIntModel    = new GpsRawIntModel;
  var heartbeatModel    = new HeartbeatModel;
  var attitudeModel     = new AttitudeModel;
  var metaWaypointModel = new MetaWaypointModel;
  var statusTextModel   = new StatusTextModel;

  var commStatusModel   = new CommStatusModel;
  var guideModel        = new GuideModel;
  guideModel.withMetaWaypointModel( metaWaypointModel );

  var mavlinkAPI = new MavlinkAPI(
        { 'HEARTBEAT':     sendNewMavlinkMessageToModel( heartbeatModel )
        , 'GPS_RAW_INT':   sendNewMavlinkMessageToModel( gpsRawIntModel )
        , 'VFR_HUD':       sendNewMavlinkMessageToModel( vfrHudModel )
        , 'ATTITUDE':      sendNewMavlinkMessageToModel( attitudeModel )
        , 'META_WAYPOINT': sendNewMavlinkMessageToModel( metaWaypointModel )
        , 'STATUSTEXT':    sendNewMavlinkMessageToModel( statusTextModel )
        }
      , commStatusModel); 

  var vfrtextview    = new VfrHudTextView({ model: vfrHudModel });
  var gpstextview    = new GpsTextView({ model: gpsRawIntModel });
  var modetextview   = new ModeTextView({ model: heartbeatModel });
  var commstatusview = new CommStatusView({ model: commStatusModel });
  var guidealtview   = new GuideAltitudeView({ model: guideModel });
  var statustextview = new StatusTextView({ model: statusTextModel });

  console.log('appview initialized');
  
  setInterval(function() {
    mavlinkAPI.update();
  }, 1000); 

});


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

  var mmapModel         = new MMapModel;
  mmapModel.withGpsModel( gpsRawIntModel );

  var mmapProviderModel = new MMapProviderModel;

  var mavlinkAPI = new MavlinkAPI(
        { 'HEARTBEAT':     sendNewMavlinkMessageToModel( heartbeatModel )
        , 'GPS_RAW_INT':   sendNewMavlinkMessageToModel( gpsRawIntModel )
        , 'VFR_HUD':       sendNewMavlinkMessageToModel( vfrHudModel )
        , 'ATTITUDE':      sendNewMavlinkMessageToModel( attitudeModel )
        , 'META_WAYPOINT': sendNewMavlinkMessageToModel( metaWaypointModel )
        , 'STATUSTEXT':    sendNewMavlinkMessageToModel( statusTextModel )
        }
      , commStatusModel); 

//  var adidrawing = new ADI('adi');

  var vfrtextview    = new VfrHudTextView({ model: vfrHudModel });
  var gpstextview    = new GpsTextView({ model: gpsRawIntModel });
  var modetextview   = new ModeTextView({ model: heartbeatModel });
  var commstatusview = new CommStatusView({ model: commStatusModel });
  var guidealtview   = new GuideAltitudeView({ model: guideModel });
  var statustextview = new StatusTextView({ model: statusTextModel });
  var pfdview        = new PFDView({
                              attitudeModel:   attitudeModel,
                              vfrHudModel:     vfrHudModel,
                              statusTextModel: statusTextModel,
                              heartbeatModel:  heartbeatModel,
                      });

  var droneview      = new DroneView({ model: vfrHudModel }); 

  var mapsettings    = new MMapSettingsView({
                              providerModel: mmapProviderModel,
                              mapModel: mmapModel
                       });

  var mapview        = new MMapView({
                              providerModel: mmapProviderModel,
                              mapModel: mmapModel,
                              guideModel: guideModel
                       });

  var providerdebug  = new MMapProviderView({
                              providerModel: mmapProviderModel,
                              mapModel: mmapModel
                        });
  console.log('appview initialized');
  
  setInterval(function() {
    mavlinkAPI.update();
  }, 250); 

});


$(function(){

  /* Constants: */
  var MAV_MODE_FLAG_CUSTOM_MODE_ENABLED =  1;
  var MAV_TYPE_FIXED_WING = 1;
  var MAV_TYPE_QUADROTOR = 2;

  /* Flight mode lookup tables: */
  var arduPlaneFlightModes = {
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

  var arduCopterFlightModes = {
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
  
  window.mavlinkModestring = function (msg) {
    var base_mode = msg.get('base_mode');
    var type = msg.get('type');
    var custom_mode = msg.get('custom_mode');

    if (!(base_mode && type && custom_mode)) {
      return;
    }

    if (!base_mode & MAV_MODE_FLAG_CUSTOM_MODE_ENABLED) {
      return ('BaseMode('+ base_mode + ')');
    } else if (type == MAV_TYPE_QUADROTOR &&
               custom_mode in arduCopterFlightModes) {
      return arduCopterFlightModes[custom_mode];
    } else if (type == MAV_TYPE_FIXED_WING &&
               custom_mode in arduPlaneFlightModes) {
      return arduPlaneFlightModes[custom_mode];
    }
    return ('CustomMode(' + custom_mode + ')');
  };

});

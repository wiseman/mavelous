$(function(){
  window.GuideModel = Backbone.Model.extend({

    defaults: function() {
      return {
        alt: 20,
        lat: null,
        lon: null
      };
    },

    initialize: function() {
      console.log("guide model initialize");
      var mavlink = this.get('mavlinkSrc');
      this.metaWaypointModel = mavlink.subscribe(
        'META_WAYPOINT', this.onMetaWaypointChange, this);
    },

    onMetaWaypointChange: function () {
      var waypt = this.metaWaypointModel.get('waypoint');
      if (waypt) {
        this.set({ alt: waypt.alt, lat: waypt.lat, lon: waypt.lon }); 
      }
    },

    setTarget: function (target) {
      this.set(target);
      this.send();
    },

    send: function () {
      var loc = this.toJSON();
      if (loc.lat !== null && loc.lon !== null) {
        this.sendServer(loc);
      }
    },

    sendServer: function ( loc ) {
      var req = JSON.stringify({ command: 'FLYTO', location: loc });
      console.log(req);
      $.ajax({ type: 'POST',
               url: '/command',
               data: req 
             });
      }
  });

});

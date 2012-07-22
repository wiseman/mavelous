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
      var loc = { lat: this.get('lat')
                , lon: this.get('lon')
                , alt: this.get('alt') };
      if (loc.lat !== null && loc.lon !== null && loc.alt !== null) {
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

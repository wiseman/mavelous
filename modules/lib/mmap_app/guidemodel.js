

$(function(){
  window.GuideModel = Backbone.Model.extend({

    defaults: function() {
      return {
          alt: 20,
          lat: null,
          lon: null
        }
    },

    initialize: function() {
      console.log("guide model initialize");
    },

    withMetaWaypointModel: function (mwm) {
      this.metaWaypointModel = mwm;
      this.metaWaypointModel.bind('change', this.onMetaWaypointChange, this);
    },

    onMetaWaypointChange: function () {
      var waypt = this.metaWaypointModel.get('waypoint');
      if (waypt) {
        this.set({ 'alt': waypt.alt, lat: waypt.lat, lon: waypt.lon }); 
      }
    },

    send: function () {
      var loc= this.toJSON();
      if (loc.lat != null && loc.lon != null) {
        this.sendServer(loc);
      }
    },

    sendServer: function ( loc ) {
      $.ajax({ type: 'POST',
               url: '/command',
               data: JSON.stringify({ command: 'FLYTO', location: loc })
             });
      }
  });

});

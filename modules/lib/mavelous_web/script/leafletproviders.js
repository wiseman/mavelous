

$(function(){
  window.Mavelous = window.Mavelous || {};

  /* bing api key registered by pat. Basic/public website  */
  var bingKey = 
    'AnFxXUB376BgaEQMj947c43V45ipmMvdcoY-TAE4-Y23mu1yFLHF0k2BMJP-MU1B';

  Mavelous.LeafletProviders = Backbone.Model.extend({
    defaults : function () {
      return {
        provider: 'bing'
      };
    },
    providers: {
      bing: {
        description: "Bing Satellite with Labels",
        constructor: function () {
          return new L.BingLayer( bingKey, {type: 'AerialWithLabels'});
        }
      },
      cloudmade: {
        description: "Cloudmade Road Map",
        constructor: function () {
          /* API Key registered by pat, 25 Nov 2012, for 
           * http://github.com/wiseman/mavelous
           * Plan: Web Free */
          var key = '420c27bae8514670a02a1684e8398d33';
          var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/'
            + key + '/997/256/{z}/{x}/{y}.png';
          return new L.TileLayer(cloudmadeUrl, { maxZoom: 18 });
        }
      },
      osm: {
        description: "OpenStreetMaps",
        constructor: function () {
          var osmUrl = 'http://{s}.tile.openstreetmap.org/'
            + '/{z}/{x}/{y}.png';
          return new L.TileLayer(osmUrl, { maxZoom: 18 });
        }
      }
    },

    getProvider: function () {
      var name = this.get('provider');
      var p = this.providers[name];
      return p.constructor();
    }
  });

});

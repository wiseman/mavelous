
$(function(){
  window.Mavelous = window.Mavelous || {};

  /* bing api key registered by pat. Basic/public website  */
  var bingKey = 'AnFxXUB376BgaEQMj947c43V45ipmMvdcoY-TAE4-Y23mu1yFLHF0k2BMJP-MU1B';
  Mavelous.MMapProviderModel = Backbone.Model.extend({

    defaults: function () {
      return { provider: 'bingaerial' };
    },

    validate: function ( attrs ) {
      if (!(attrs.provider in this.providers)) {
        return "must set provider to a key in providers table";
      }
    },

    initialize: function () {
    },

    providers: {
      bingaerial: {
        description: "Bing Aerial",
        constructor: function (onready) {
          return new MM.BingProvider(bingKey, 'AerialWithLabels', onready); }
      },
      /* XXX Bing Birdseye map doesn't seem to work...
      bingbirdseye: {
        description: "Bing Birdseye",
        constructor: function (onready) {
          return new MM.BingProvider(bingKey, 'BirdseyeWithLabels', onready); }
      },
      */
      bingroad: {
        description: "Bing Road",
        constructor:  function (onready) {
          return new MM.BingProvider(bingKey, 'Road', onready);}
      },
      bluemarble: {
        description: "Blue Marble",
        constructor: function (onready) {
          var provider = new MM.BlueMarbleProvider();
          if (onready) { onready(provider ); }
          return provider;
        }
      }
    },

    providerDescriptions: function () {
      return _.pluck(this.providers, 'description');
    },
    
    getProvider: function () {
      var k = this.get('provider');
      return this.providers[k];
    }
  });

  /* Debugging view */
  Mavelous.MMapProviderView = Backbone.View.extend({
    initialize: function () {
      this.providerModel = this.options.providerModel;
      this.mapModel      = this.options.mapModel;
      this.providerModel.bind('change', this.render, this);
      this.mapModel.bind('change', this.render, this);
      this.render();
    },

    render: function () {
      var provider = this.providerModel.get('provider');
      var zoom = this.mapModel.get('zoom');
      $('#mapproviderdebug').html(provider + ' ' + zoom.toString());
    }
  });
});

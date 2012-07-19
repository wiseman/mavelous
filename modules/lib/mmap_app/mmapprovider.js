
$(function(){

  window.MMapProviderModel = Backbone.Model.extend({
    bingKey: 'Anmc0b2q6140lnPvAj5xANM1rvF1A4CvVtr6H2VJvQcdnDvc8NL-I2C49owIe9xC',

    defaults: function () {
      return { provider: 'bingaerial' };
    },

    initialize: function () {
      console.log('mmap provider model initialize');
    },

    providers: {
      bingaerial: {
        description: "Bing Aerial",
        constructor: function () { 
          return new MM.BingProvider(bingKey, 'AerialWithLabels');} 
      },
      bingbirdseye: {
        description: "Bing Birdseye",
        constructor: function () {
          return new MM.BingProvider(bingKey, 'BirdseyeWithLabels'); },
      },
      bingroad: {
        description: "Bing Road",
        constructor:  function () {
          return new MM.BingProvider(bingKey, 'Road');}
      },
      bluemarble: {
        description: "Blue Marble",
        constructor: function () {
          return new MM.BlueMarbleProvider(); }
      }
    },

    providerDescriptions: function () {
      return _.pluck(this.providers, 'description');
    },
    
    newProvider: function () {

    }
  });


  window.MMapSettingsView = Backbone.View.extend({
    template: _.template($('#mapsettingsviewtemplate').html()),

    initialize: function () {
      this.providerModel = this.options.providerModel;
      this.renderModel   = this.options.renderModel;

      $('#mapsettingsview').replaceWith(this.render().el);
      this.setupProviderDropdown();
    },

    setupProviderDropdown: function () {
      var input_el = $('#mapproviderpicker');
      var self = this;
      _.each( this.providerModel.providers, function (provider, name) {
        input_el.append('<option value="' + name + '">' +
                        provider.description + '</option>'); 
      });
      input_el.change(function() {
        var newprovider = input_el.val();
        self.providerModel.set('provider', newprovider);
      });
    },

    render: function () {
      this.$el.html(this.template({}));
      return this;
    }
  });

  window.MMapProviderView = Backbone.View.extend({
    initialize: function () {
      this.model.bind('change', this.render, this);
      this.render();
    },

    render: function () {
      var provider = this.model.get('provider');
      $('#mapproviderdebug').html(provider);
    }
  });
});

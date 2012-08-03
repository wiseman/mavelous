
$(function(){
  window.Mavelous = window.Mavelous || {};
  
  Mavelous.PFDView = Backbone.View.extend({

    pfd: null,

    initialize: function() {
      this.blockel = this.options.blockel;
      this.statel  = this.options.statel;
      this.pfdel   = $('#' + this.options.drawingid);
      if (this.options.settingsModel) {
        this.settingsModel = this.options.settingsModel;
        this.settingsModel.bind('change', this.onSettingsChange, this);
        this.onSettingsChange();
      }

      var mavlinkSrc = this.options.mavlinkSrc;
      // Too bad backbone doesn't pass the model to event handlers; we
      // wouldn't need to keep these handles to models.
      this.attitude = mavlinkSrc.subscribe('ATTITUDE',
          this.onAttitudeChange, this);
      this.vfrHud = mavlinkSrc.subscribe('VFR_HUD',
        this.onVfrHudChange, this);
      this.navControllerOutput = mavlinkSrc.subscribe(
        'NAV_CONTROLLER_OUTPUT', this.onNavControllerOutputChange, this);

      /* Create pfd object */
      this.pfd = new Mavelous.PFD(this.options.drawingid);

      /* Set off each callback to initialize view */
      this.onAttitudeChange();
      this.onVfrHudChange();
      this.onNavControllerOutputChange();
    },

    onAttitudeChange: function() {
      this.pfd.setAttitude(this.attitude.get('pitch'),
                           this.attitude.get('roll'));
      this.pfd.draw();
    },

    onVfrHudChange: function () {
      var alt = this.vfrHud.get('alt');
      this.pfd.setAltitude(alt);
      var airSpeed = this.vfrHud.get('airspeed');
      this.pfd.setSpeed(airSpeed);
      this.pfd.draw();
    },

    onNavControllerOutputChange: function() {
      var alt_error = this.navControllerOutput.get('alt_error');
      var aspd_error = this.navControllerOutput.get('aspd_error');
      if (Math.abs(alt_error) > 0) {
        this.pfd.setTargetAltitude(this.vfrHud.get('alt') + alt_error);
      }
      if (Math.abs(aspd_error) > 0) {
        this.pfd.setTargetSpeed(this.vfrHud.get('airspeed') + aspd_error);
      }
    },

    onSettingsChange: function () {
      var settings = this.settingsModel.toJSON();
      this.setPosition(settings.position);
      this.setSize(settings.size);
    },

    setPosition: function (position) {
      this.blockel.removeClass('pfd-top pfd-bottom pfd-left pfd-right');
      switch(position) {
        case this.settingsModel.TOPLEFT:
          this.blockel.addClass('pfd-top pfd-left');
          break;
        case this.settingsModel.TOPRIGHT:
          this.blockel.addClass('pfd-top pfd-right');
          break;
        case this.settingsModel.BOTTOMLEFT:
          this.blockel.addClass('pfd-bottom pfd-left');
          break;
        case this.settingsModel.BOTTOMRIGHT:
          this.blockel.addClass('pfd-bottom pfd-right');
          break;
      }
    }, 

    classFromSize: function (size) {
      switch(size) {
        case this.settingsModel.STANDARD:
          return 'medium';
          break;
        case this.settingsModel.FULLSCREEN:
          return 'full';
          break;
        case this.settingsModel.SMALL:
          return 'small';
          break;
      }
    },

    setSize: function (size) {
      var self = this;
      var pfdel = this.pfdel;
      var block = this.blockel;
      var stat  = this.statel;
      if (size == this.settingsModel.HIDDEN) {
        block.hide();
      } else {
        if (block.is(':hidden')){
          block.show();
        }
        var sizes = [ 'medium', 'small', 'full'];
        /* Remove all */
        _.each(sizes, function (size) {
          var pfdsize = 'pfd-' + size;
          var pfdviewsize = 'pfdview-' + size;
          block.removeClass(pfdsize);
          stat.removeClass(pfdsize);
          pfdel.removeClass(pfdsize);
          pfdel.removeClass(pfdviewsize);
        });
        var newsize = this.classFromSize(size);
        var pfdsize = 'pfd-' + newsize;
        var pfdviewsize = 'pfdview-' + newsize;
        block.addClass(pfdsize);
        stat.addClass(pfdsize);
        pfdel.addClass(pfdsize);
        pfdel.addClass(pfdviewsize);
      } 
    }
  });


});

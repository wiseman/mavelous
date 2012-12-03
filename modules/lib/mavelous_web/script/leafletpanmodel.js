
$(function() {
  window.Mavelous = window.Mavelous || {};

  Mavelous.LeafletPanControlView = Backbone.View.extend({
    initialize: function() {
      this.button = this.options.button;
      this.icon = this.options.icon;
      this.button.click(_.bind(this.onClick, this));
      this.model.on('change:tracking', this.onTrackingChange, this);
      this.onTrackingChange();
    },

    onClick: function() {
      if (this.model.get('tracking')) {
        this.model.set('tracking', false);
      } else {
        this.model.set('tracking', true);
      } 
    },

    onTrackingChange: function() {
      if (this.model.get('tracking')) {
        this.button.addClass('btn-primary');
        this.icon.removeClass('icon-black');
        this.icon.addClass('icon-white');
      } else {
        this.button.removeClass('btn-primary');
        this.icon.removeClass('icon-white');
        this.icon.addClass('icon-black');
      }
    }
  });

  Mavelous.LeafletPanModel = Backbone.Model.extend({
    defaults: function() {
      return { 
        initialized: false,
        tracking: true,
        center: undefined
      };
    },

    initialize: function() {
      this.vehicle = this.get('vehicle');
      this.vehicle.on('change', this.onVehicleChange, this);
    },

    onVehicleChange: function() {
      if (!this.get('initialized')) {
        var p = this.vehicle.get('position');
        if (p == undefined) return;
        if (p.lat == 0 || p.lng == 0) return;
        this.set({ center: p, initialized: true });
      } else if (this.get('tracking')) {
        var p = this.vehicle.get('position');
        if (p == undefined) return;
        if (p.lat == 0 || p.lng == 0) return;
        this.set({ center: p});
      }
    },

    cancelTracking: function() {
      this.set('tracking', false); 
    }

  });
});


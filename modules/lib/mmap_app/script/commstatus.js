
$(function(){
  window.Mavelous = window.Mavelous || {};

  Mavelous.CommStatusModel = Backbone.Model.extend({
    SERVER_TIMEOUT_INTERVAL:    3000,
    HEARTBEAT_TIMEOUT_INTERVAL: 2000,
    /* Constants: */
    UNINITIALIZED: 0,
    OK : 1,
    TIMED_OUT_ONCE: 2,
    TIMED_OUT_MANY: 3,
    ERROR : 4,

    defaults: function() {
      return {
        mav: this.UNINITIALIZED,
        server: this.UNINITIALIZED
      };
    },

    initialize: function() {
      /* Only initialize the server.
       * Mav is uninitialized until first heartbeat. */
      var mavlink = this.get('mavlinkSrc');
      mavlink.subscribe('HEARTBEAT', this.onHeartbeat, this);
      mavlink.on('gotServerResponse', this.onServerSuccess, this);
      mavlink.on('gotServerError', this.onServerError, this);
      this.resetServerTimeout();
    },

    onHeartbeat: function () {
      this.set('mav', this.OK);
      this.resetHeartbeatTimeout();
    },

    resetHeartbeatTimeout: function () {
      var self = this;
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout =
              setTimeout(function(){ self.onHeartbeatTimeout(); },
                         this.HEARTBEAT_TIMEOUT_INTERVAL);
    },

    onHeartbeatTimeout: function () {
      var mavstat = this.get('mav');
      if (mavstat == this.OK) {
        this.set('mav', this.TIMED_OUT_ONCE);
      } else if ( mavstat == this.TIMED_OUT_ONCE) {
        this.set('mav', this.TIMED_OUT_MANY);
      }
      /* Do nothing if uninitialized. */
      this.resetHeartbeatTimeout();
    },

    onServerSuccess: function () {
      this.set('server', this.OK);
      this.resetServerTimeout();
    },

    onServerError: function () {
      this.set('server', this.ERROR);
    },

    resetServerTimeout: function () {
      var self = this;
      clearTimeout(this.serverTimeout);
      this.serverTimeout =
            setTimeout(function(){ self.onServerTimeout(); },
                       this.SERVER_TIMEOUT_INTERVAL);
    },
          
    onServerTimeout: function () {
      var serverstat = this.get('server');
      if (serverstat == this.OK) {
        this.set('server', this.TIMED_OUT_ONCE);
      } else if ( serverstat == this.TIMED_OUT_ONCE) {
        this.set('server', this.TIMED_OUT_MANY);
      }
      /* Do nothing if there is an error or uninitialized. */
      this.resetServerTimeout();
    }
  });



  Mavelous.CommStatusButtonView = Backbone.View.extend({
    initialize: function () {
      this.mavlink = this.options.mavlinkSrc;
      this.model.bind('change', this.buttonRender, this);
    },

    registerPopover: function (p) {
      this.popover = p;
      this.popover.on('selected', this.popoverRender, this);
    },

    buttonRender: function () {
      /* model should be a commStatusModel */
      var csm = this.model;
      var state = csm.toJSON();
      var server = state.server;
      var mav = state.mav;
      if ( server == csm.OK
         && mav == csm.OK ){
        this.render_status(csm.OK);
      } else if ( server == csm.UNINITIALIZED
          || mav == csm.UNINITIALIZED ){
        this.render_status(csm.UNINITIALIZED );
      } else if ( server == csm.TIMED_OUT_MANY
          || mav == csm.TIMED_OUT_MANY ){
        this.render_status(csm.TIMED_OUT_MANY);
      } else if ( server == csm.TIMED_OUT_ONCE
          || mav == csm.TIMED_OUT_ONCE ){
        this.render_status(csm.TIMED_OUT_ONCE);
      } else {
        this.rcommStatusModelender_status(csm.ERROR);
      }
    },

    render_status: function(stat) {
      var csm = this.model;
      this.$el.removeClass('btn-success btn-danger ' +
          'btn-warning btn-inverse');
      if (stat == csm.UNINITIALIZED) {
        this.$el.addClass('btn-inverse');
        this.$el.html('Link: None');
      } else if (stat == csm.OK) {
        this.$el.addClass('btn-success');
        this.$el.html('Link: Good');
      } else if (stat == csm.TIMED_OUT_ONCE) {
        this.$el.addClass('btn-warning');
        this.$el.html('Link: Lost');
      } else if (stat == csm.TIMED_OUT_MANY) {
        this.$el.addClass('btn-danger');
        this.$el.html('Link: Lost');
      } else {
        this.$el.addClass('btn-danger');
        this.$el.html('Link: Error');
      }
    },

    history: [],
    period: 10,
    current: 0,

    renderDiff: function ( latest, compare , period ) { 
      var delta = { master_in: latest.master_in - compare.master_in
                  , master_out: latest.master_out - compare.master_out
                  , mav_loss: latest.mav_loss - compare.mav_loss
                  , period: period };
      return this.renderStatString(delta);
    },

    renderStatString: function (l) {
      return ("In last " + l.period + "s, " +
          l.master_in  + " packets received, " +
          l.master_out + " sent, " + l.mav_loss + " lost");
    },

    popoverRender: function () {
      var latest = this.mavlink.toJSON();
      if (!latest) return;
      var compare = this.history[this.current];
      this.history[this.current] = latest;
      this.current++;
      if (compare) {
        var res = this.renderDiff(latest, compare, this.period);
      } else {
        var res = this.renderDiff(latest, this.history[0], this.current);
      }
      this.current = this.current % this.period;
      this.popover.trigger('content',res);
    }
  });
});


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

  Mavelous.PacketLossModel = Backbone.Model.extend({
    period: 10, /* period should not be changed after initialization. */
    defaults: function () {
      return {
        history: [],
        current: -1
      };
    },
    initialize: function () {
      this.metalinkquality = this.get('mavlinkSrc').subscribe(
          'META_LINKQUALITY', this.onMessage, this);
    },
    onMessage: function () {
      var history = this.get('history');
      var current = this.get('current');
      var latest = this.metalinkquality.toJSON();
      var next = (current + 1) % this.period;
      history[next] = latest;
      this.set('history', history);
      this.set('current', next);
    },
    getDelta: function () {
      var history = this.get('history');
      var current = this.get('current');
      /* current is -1 when we dont yet have info from server. */
      if (current < 0) return;
      var nextposition = history[(current + 1) % this.period]
      if (nextposition) {
        return this.diff(history[current], nextposition, this.period)
      } else {
        return this.diff(history[current], history[0], current)
      }
    },
    diff: function (latest, compare, period)  {
      return { master_in: latest.master_in - compare.master_in
             , master_out: latest.master_out - compare.master_out
             , mav_loss: latest.mav_loss - compare.mav_loss
             , period: period };
    }
  });

  Mavelous.CommStatusButtonView = Backbone.View.extend({
    initialize: function () {
      this.commStatusModel = this.options.commStatusModel;
      this.packetLossModel = this.options.packetLossModel;
      this.commStatusModel.bind('change', this.buttonRender, this);
      this.packetLossModel.bind('change', this.popoverRender, this);
    },

    registerPopover: function (p) {
      this.popover = p;
      this.popover.on('selected', this.popoverRender, this);
    },

    buttonRender: function () {
      var csm = this.commStatusModel;
      var state = csm.toJSON();
      var server = state.server;
      var mav = state.mav;
      if ( server == csm.OK
         && mav == csm.OK ){
        this.setButton(csm.OK);
      } else if ( server == csm.UNINITIALIZED
          || mav == csm.UNINITIALIZED ){
        this.setButton(csm.UNINITIALIZED );
      } else if ( server == csm.TIMED_OUT_MANY
          || mav == csm.TIMED_OUT_MANY ){
        this.setButton(csm.TIMED_OUT_MANY);
      } else if ( server == csm.TIMED_OUT_ONCE
          || mav == csm.TIMED_OUT_ONCE ){
        this.setButton(csm.TIMED_OUT_ONCE);
      } else {
        this.rcommStatusModelender_status(csm.ERROR);
      }
    },

    setButton: function(stat) {
      var csm = this.commStatusModel;
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

    packetLossString: function (l) {
      return ("In last " + l.period + "s, " +
          l.master_in  + " packets received, " +
          l.master_out + " sent, " + l.mav_loss + " lost");
    },

    popoverRender: function () {
      var delta = this.packetLossModel.getDelta();
      this.popover.trigger('content', this.packetLossString(delta));
    }
  });
});


$(function(){
  window.Mavelous = window.Mavelous || {};

  var commStatusPopoverButton = function (opts) {
    var members = {
          initialize: function () {
            this.commStatusModel.bind('change', this.buttonRender, this);
          },
          buttonRender: function () {
            /* model should be a commStatusModel */
            var csm = this.commStatusModel;
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
              this.render_status(csm.ERROR);
            }
          },
          render_status: function(stat) {
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
            return res;
          }
    };
    return new Mavelous.PopoverButtonView(_.extend(members, opts));
  };

  Mavelous.StatusButtons = function (opts) {
    return new Mavelous.RadioButtonView({
      buttons: [
        new Mavelous.PopoverButtonView({
          el: $('#navbar-btn-1'),
          mavlinkSrc: opts.mavlinkSrc,
          mavlinkMsg: 'META_LINKQUALITY',
          popoverRender: function () { return 'radio 1' }
        }),
        new Mavelous.PopoverButtonView({
          el: $('#navbar-btn-2'),
          mavlinkSrc: opts.mavlinkSrc,
          mavlinkMsg: 'META_LINKQUALITY',
          popoverRender: function () { return 'radio 2' }
        }),
        new commStatusPopoverButton({
          el: $('#navbar-btn-3'),
          commStatusModel: opts.commStatusModel,
          mavlinkSrc: opts.mavlinkSrc,
          mavlinkMsg: 'META_LINKQUALITY',
        })
      ]

    });
  };
});

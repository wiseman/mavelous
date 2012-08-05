

$(function(){
  window.Mavelous = window.Mavelous || {};
  
  Mavelous.LinkQualityView = Backbone.View.extend({
    initialize: function () {
      var mavlink = this.options.mavlinkSrc;
      this.link = mavlink.subscribe('META_LINKQUALITY', this.onChange, this);
      this.$el.popover({
        animation: false,
        placement: "bottom",
        title: "Link Statistics",
      });
    },

    history: [],
    period: 10,
    current: 0,

    onChange: function () {
      var latest = this.link.toJSON();
      if (!latest) return;
      var compare = this.history[this.current];
      this.history[this.current] = latest;
      this.current = (this.current + 1) % this.period;
      if (compare) {
        var delta = { master_in: latest.master_in - compare.master_in
                    , master_out: latest.master_out - compare.master_out
                    , mav_loss: latest.mav_loss - compare.mav_loss
                    , period: this.period };
        this.render(delta);
      } else { /* History has not filled up yet. */
        compare = this.history[0]
        var delta = { master_in: latest.master_in - compare.master_in
                    , master_out: latest.master_out - compare.master_out
                    , mav_loss: latest.mav_loss - compare.mav_loss
                    , period: this.current - 1 };
        this.render(delta);
      }
    },

    statString: function (l) {
      return ("In last " + l.period + "s, " +
          l.master_in  + " packets received, " +
          l.master_out + " sent, " + l.mav_loss + " lost");
    },

    render: function ( linkstats ) {
      this.$el.attr('data-content', this.statString(linkstats));
    }
  });

});

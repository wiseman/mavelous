

$(function(){
  window.Mavelous = window.Mavelous || {};
  
  Mavelous.LinkQualityView = Backbone.View.extend({
    initialize: function () {
      var mavlink = this.options.mavlinkSrc;
      this.link = mavlink.subscribe('META_LINKQUALITY', this.onChange, this);
      this.$el.popover({
        animation: false,
        placement: 'bottom',
        title: "Link Statistics",
        trigger: 'manual',
        content: $.proxy(this.renderPopoverContent, this)
      });
      this.$el.click($.proxy(this.buttonClick, this));
    },

    history: [],
    period: 10,
    current: 0,

    popoverShown: false,

    buttonClick: function () {
      if (this.popoverShown) { 
        this.$el.popover('hide');
        this.popoverShown = false;
      } else {
        this.$el.popover('show');
        this.popoverShown = true;
      }
    },

    onChange: function () {
      if (this.popoverShown) {
        this.$el.popover('show');
      }
    },

    renderDiff: function ( latest, compare , period ) { 
      console.log(latest.mav_loss);
      var delta = { master_in: latest.master_in - compare.master_in
                  , master_out: latest.master_out - compare.master_out
                  , mav_loss: latest.mav_loss - compare.mav_loss
                  , period: period };
      return this.renderStatString(delta);
    },

    renderPopoverContent: function () {
      var latest = this.link.toJSON();
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
    },

    renderStatString: function (l) {
      return ("In last " + l.period + "s, " +
          l.master_in  + " packets received, " +
          l.master_out + " sent, " + l.mav_loss + " lost");
    },

  });

});

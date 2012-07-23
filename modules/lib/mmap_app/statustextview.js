
$(function () {
  window.Mavelous = window.Mavelous || {};

  Mavelous.StatustextView = Backbone.View.extend({
  
    initialize: function () {
      var mavlinkSrc = this.options.mavlinkSrc;
      this.$el = $('#statustextview');
      this.statusText = mavlinkSrc.subscribe('STATUSTEXT',
                            this.onStatusTextChange, this);
      this.onStatusTextChange();
    },

    onStatusTextChange: function () {
      clearTimeout(this.timeout);
      var el = this.$el;
      el.html(this.statusText.get('text'));
      this.timeout = setTimeout(function () { el.html(''); }, 4000);
    }

  });
});

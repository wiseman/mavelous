goog.provide('Mavelous.StatustextView');



/**
 * Displays STATUSTEXT messages.
 * @constructor
 */
Mavelous.StatustextView = Backbone.View.extend({

  initialize: function() {
    var mavlinkSrc = this.options.mavlinkSrc;
    this.$el = $('#statustextview');
    this.statusText = mavlinkSrc.subscribe('STATUSTEXT',
                                           this.onStatusTextChange, this);
    this.onStatusTextChange();
  },

  onStatusTextChange: function() {
    clearTimeout(this.timeout);
    var el = this.$el;
    el.html(this.statusText.get('text'));
    el.css('padding', 10);
    this.timeout = setTimeout(function() {
      el.html('');
      el.css('padding', 0);
    }, 4000);
  }

});

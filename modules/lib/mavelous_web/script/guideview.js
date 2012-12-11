goog.provide('Mavelous.GuideAltitudeView');



Mavelous.GuideAltitudeView = Backbone.View.extend({

  initialize: function() {
    var self = this;
    this.input = this.options.input;
    this.submit = this.options.submit;
    this.text = this.options.text;

    /* render just updates the DOM via jQuery. */
    this.model.bind('change', this.render, this);
    this.render();

    this.input.change(function() {
      self.model.set({ alt: self.input.val() });
    });

    this.submit.click(function() {
      self.model.send();
    });
  },

  render: function() {
    var mdl = this.model.toJSON();
    this.text.html(mdl.alt.toString() + ' m');
    this.input.val(mdl.alt);
    return this;
  }
});

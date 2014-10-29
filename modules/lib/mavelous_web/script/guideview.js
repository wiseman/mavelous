goog.provide('Mavelous.GuideAltitudeView');



/**
 * The GUIDE-mode altitude slider.
 *
 * @param {Object} properties The view properties.
 * @constructor
 * @extends {Backbone.View}
 */
Mavelous.GuideAltitudeView = function(properties) {
  goog.base(this, properties);
};
goog.inherits(Mavelous.GuideAltitudeView, Backbone.View);


/**
 * @override
 * @export
 */
Mavelous.GuideAltitudeView.prototype.initialize = function() {
  var self = this;
  this.input = this.options['input'];
  this.submit = this.options['submit'];
  this.text = this.options['text'];

  /* render just updates the DOM via jQuery. */
  this.model.bind('change', this.render, this);
  this.render();

  this.input.change(function() {
    self.model.set({ 'alt': self.input.val() });
  });

  this.submit.click(function() {
    self.model.send();
  });
};


/**
 * @override
 * @export
 */
Mavelous.GuideAltitudeView.prototype.render = function() {
  var mdl = this.model.toJSON();
  this.text.html(mdl['alt'].toString() + ' m');
  this.input.val(mdl['alt']);
  return this;
};

goog.provide('Mavelous.StatusButtons');

goog.require('Mavelous.PopoverView');
goog.require('Mavelous.RadioButtonPopoverView');

goog.require('goog.array');


/**
 * Creates a RadioButtonPopoverView of status buttons.
 *
 * @param {Array.<Backbone.View>} buttons The navbar button views.
 * @return {Mavelous.RadioButtonPopoverView} The new popoview view.
 */
Mavelous.StatusButtons = function(buttons) {
  return new Mavelous.RadioButtonPopoverView({
    'popovers': goog.array.map(
        buttons,
        function(b) {
          return new Mavelous.PopoverView({ 'button': b });
        })
  });
};

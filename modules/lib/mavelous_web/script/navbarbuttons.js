goog.provide('Mavelous.StatusButtons');

goog.require('Mavelous.PopoverView');
goog.require('Mavelous.RadioButtonPopoverView');


/**
 * Creates a RadioButtonPopoverView of status buttons.
 *
 * @param {Array.<Backbone.View>} buttons The navbar button views.
 * @return {Mavelous.RadioButtonPopoverView} The new popoview view.
 */
Mavelous.StatusButtons = function(buttons) {
  return new Mavelous.RadioButtonPopoverView({
    popovers: _(buttons).map(function(b) {
      return new Mavelous.PopoverView({ button: b });
    })
  });
};


$(function() {
  window.Mavelous = window.Mavelous || {};

  Mavelous.StatusButtons = function(opts) {
    return new Mavelous.RadioButtonPopoverView({
      popovers: _(opts.buttons).map(function(b) {
        return new Mavelous.PopoverView({ button: b });
      })
    });
  };
});

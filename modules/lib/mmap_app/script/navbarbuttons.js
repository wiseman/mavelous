
$(function(){
  window.Mavelous = window.Mavelous || {};


  Mavelous.StatusButtons = function (opts) {
    return new Mavelous.RadioButtonView({
      buttons: [
        new Mavelous.PopoverButtonView({
          el: $('#navbar-btn-1'),
          mavlinkSrc: opts.mavlinkSrc,
          mavlinkMsg: 'META_LINKQUALITY', /* placeholder */
          popoverRender: function () { return 'radio 1' }
        }),
        new Mavelous.PopoverButtonView({
          el: $('#navbar-btn-2'),
          mavlinkSrc: opts.mavlinkSrc,
          mavlinkMsg: 'META_LINKQUALITY', /* placeholder */
          popoverRender: function () { return 'radio 2' }
        }),
        new Mavelous.CommStatusPopoverButton({
          el: $('#navbar-btn-link'),
          commStatusModel: opts.commStatusModel,
          mavlinkSrc: opts.mavlinkSrc,
          mavlinkMsg: 'META_LINKQUALITY',
        })
      ]

    });
  };
});

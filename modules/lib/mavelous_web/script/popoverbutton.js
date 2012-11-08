
$(function(){
  window.Mavelous = window.Mavelous || {};

  Mavelous.SelectedModel = Backbone.Model.extend({
    defaults: function () {
      return {
        selected: false
      }
    },
    select: function () {
      this.set('selected', true);
    },
    deselect: function () {
      this.set('selected', false);
    }
  });

  Mavelous.RadioButtonPopoverView = Backbone.View.extend({
    initialize: function () {
      /* this.buttons :: [ SelectedModel ]*/
      this.buttons =  _.map(this.options.popovers , /* :: [PopoverView] */
                        _.bind(this.registerButton, this));
    },
    /* Setup a button to be backed by a selection model. */
    registerButton: function (btn, index) {
      var mdl = new Mavelous.SelectedModel ; 
      mdl.set('index', index);
      btn.$el.click(_.bind(this.onButtonClick, this, index));
      btn.selectedModel = mdl;
      mdl.bind('change', btn.onSelectedChange, btn);
      return mdl;
    },
    onButtonClick: function (btnindex) {
      var selected = this.buttons[btnindex].get('selected');
      if (selected) {
        /* Unset this button - no buttons are selected. */
        this.buttons[btnindex].deselect();
      } else {
        /* Unset all of the other buttons, then set this one. */
        this.buttons[btnindex].select();
        _.each(_.without(this.buttons, this.buttons[btnindex]),
            function (b) { b.deselect(); });
      }
    }
  });

  Mavelous.PopoverView = Backbone.View.extend({
    initialize: function () {
      _.extend(this, Backbone.Events);
      this.$el = this.options.button.$el;
      // XXX Bug: if you don't provide a popoverTitle in the button view
      // the whole popover won't work. 
      var t = this.options.button.popoverTitle;
      if (typeof t == 'undefined') t = 'need a popoverTitle in button view!';
      this.$el.popover({
        animation: false,
        placement: 'bottom',
        title: t,
        trigger: 'manual'
      });
      this.on('content', this.onContent, this);
      this.options.button.registerPopover(this);
    },
    onSelectedChange: function () {
      if (this.selectedModel.get('selected')) {
        this.trigger('selected', true);
      } else {
        this.$el.popover('hide');
      }
    },
    onContent: function (c) {
      if ( this.selectedModel.get('selected') ) {
        this.$el.popover('show', function ( pel ) {
          pel.find('.popover-content > *').html(c);
        });
      }
    },
    element: function (k) {
      if ( this.selectedModel.get('selected') ) {
        this.$el.popover('show', k);
      }
    },
    content: function (k) {
      this.element(function (e) { k (e.find('.popover-content > *')) });
    }
  });
});

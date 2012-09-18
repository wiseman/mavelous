
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

  Mavelous.RadioButtonView = Backbone.View.extend({
    initialize: function () {
      /* this.buttons :: [ SelectedModel ]*/
      this.buttons =  _.map(this.options.buttons, /* :: [PopoverButtonView] */
                        _.bind(this.registerButton, this));
    },
    /* Setup a button to be backed by a selection model. */
    registerButton: function (btn, index) {
      var mdl = new Mavelous.SelectedModel ; 
      mdl.set('index', index);
      /* Temporary hack - this el's click should bind to a radio method,
       * carry along index. */
      btn.$el.click(_.bind(this.onButtonClick, this, index));
      console.log('register btn selectedModel');
      btn.selectedModel = mdl;
      mdl.bind('change', btn.onChange, btn);
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

  Mavelous.PopoverButtonView = Backbone.View.extend({
    initialize: function () {
      /** 
       * Extend this object with the options (subtyping).
       * Options has an initialize as well!
       * that will wipe out this initialize in the object scope. Luckily we
       * won't need it again.
       */
      _.extend(this, this.options);
      /* Call the subtype initialize function with the current object as
       * the 'this' context. */
      if (this.options.initialize) {
        _.bind(this.options.initialize, this)();
      }
      this.$el.popover({
        animation: false,
        placement: 'bottom',
        title: this.options.title,
        trigger: 'manual',
        content: _.bind(this.popoverRender, this)
      });
      if (this.model) {
        this.model.bind('change', this.onChange, this);
      } else if (this.options.mavlinkMsg) {
        this.mavlink = this.options.mavlinkSrc.subscribe(
          this.options.mavlinkMsg, this.onChange, this);
      }
    },
    onChange: function () {
      if ( this.selectedModel.get('selected') ) {
        /* popover content handler will  cause this.render to be triggered */
        this.$el.popover('show');
      } else {
        this.$el.popover('hide')
      }
    }
  });
});

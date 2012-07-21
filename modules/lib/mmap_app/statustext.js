

$(function(){
  
  window.StatusTextModel = Backbone.Model.extend({

    defaults: function() {
      return { text: "" };
    },

    initialize: function() {
      console.log("statustext model initialize");
    }
  });

  window.StatusTextView = Backbone.View.extend({

    initialize: function () {
      /* First, render the template so we have the elements we expect in DOM. */
      /* render just updates the DOM via jQuery. */
      this.model.bind('change', this.render, this);
      this.render();

    },
    
    render : function () {
      console.log('statustext view render')
      var mdl = this.model.toJSON();
      if (mdl.text == ""){
        $('#statustextview').html("");
      } else {
        $('#statustextview').html(mdl.text)
            .stop(true, true)
            .css('color', 'yellow')
            .css('background-color', 'rgb(0, 0, 0, 1.0)')
            .animate({
                color: $.Color('yellow'),
                backgroundColor: $.Color('rgb(0, 0, 0, 1.0)')
            }, {
                duration: 200,
                queue: true
            })
            .animate({
                color: $.Color('white'),
                backgroundColor: $.Color('rgb(0, 0, 0, 0.0)')
            }, {
                duration: 5000,
                queue: true
            });
      }
      return  this;
    }
  });
});

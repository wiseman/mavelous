$(function() {
  window.Mavelous = window.Mavelous || {};
  
  Mavelous.Waypoint = Backbone.Model.extend({
    defaults: function() {
      return {
        command: null,
        param1: null,
        param2: null,
        param3: null,
        param4: null,
        x: null,
        y: null,
        z: null
      };
    }
  });

  Mavelous.Mission = Backbone.Collection.extend({
    model: Mavelous.Waypoint
  });

  Mavelous.WaypointView = Backbone.View.extend({
  });

  Mavelous.MissionView = Backbone.View.extend({
    initialize: function() {
      var self = this;
      this.waypointViews = [];

      this.collection.each(function(waypoint) {
        console.log(this);
        console.log(this.waypointViews);
        console.log(this.waypointViews.push);
        var wp = new Mavelous.WaypointView({
          model: waypoint,
          tagName: 'li'
        });
        this.waypointViews.push(wp);
      },
      this);
    },
    
    render: function() {
      var self = this;
      // Clear out this element.
      this.$el.empty();

      // Render each subview and append it to the parent view's element.
      _(this.waypointViews).each(function(wv) {
        self.$el.append(wv.render().el);
      });
    }
  });
});

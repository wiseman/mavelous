$(function() {
  window.Mavelous = window.Mavelous || {};

  Mavelous.MissionPlannerApp = new Backbone.Marionette.Application();
  
  Mavelous.MissionPlannerApp.addRegions({
    mainRegion: "#content"
  });

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

  Mavelous.WaypointView = Backbone.Marionette.ItemView.extend({
    template: "#waypoint-template",
    tagName: 'tr',
  
    events: {
      //'click .rank_up img': 'rankUp',
      //'click .rank_down img': 'rankDown',
      //'click a.disqualify': 'disqualify'
    },
  
    initialize: function(){
      this.render();
      //this.bindTo(this.model, "change:votes", this.render);
    }
  });

  Mavelous.MissionView = Backbone.Marionette.CompositeView.extend({
    tagName: "table",
    template: "#mission-template",
    itemView: Mavelous.WaypointView,
    
    appendHtml: function(collectionView, itemView){
      collectionView.$("tbody").append(itemView.el);
    }
  });
});

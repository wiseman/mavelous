$(function() {
  window.Mavelous = window.Mavelous || {};

  Mavelous.serverLog = function(obj) {
    var str = JSON.stringify(obj);
    $.ajax({
      type: 'POST',
      url: '/jslog',
      data: str
    });
  };

});
  
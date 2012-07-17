
$(function(){
  
  var key = 'Anmc0b2q6140lnPvAj5xANM1rvF1A4CvVtr6H2VJvQcdnDvc8NL-I2C49owIe9xC';
  var style = 'AerialWithLabels';

  window.mapProvider = new MM.BingProvider(key,style);
  window.mapLayer    = new MM.Layer(mapProvider);
  window.markerLayer = new MM.MarkerLayer();
  window.map = new MM.Map('map', mapLayer, undefined, []);
  window.map.addLayer(markerLayer);

});

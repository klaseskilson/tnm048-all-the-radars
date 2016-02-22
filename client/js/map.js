var GMap = function () {
  console.log('Map init');
};

GMap.prototype.setup = function() {
  this.map = new google.maps.Map(d3.select("#map").node(), {
    zoom: 11,
    center: new google.maps.LatLng(59.33, 18.03),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });
};

GMap.prototype.data = function() {
  var overlay = new google.maps.OverlayView();
};

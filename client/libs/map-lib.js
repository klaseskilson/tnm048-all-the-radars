GMap = function () {};

GMap.prototype.setup = function(node) {
  var map = new google.maps.Map(node, {
    zoom: 11,
    center: new google.maps.LatLng(59.33, 18.03),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });
};

GMap.prototype.data = function(data) {
  var overlay = new google.maps.OverlayView();
};

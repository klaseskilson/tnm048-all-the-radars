GMap = function () {};

GMap.prototype.setup = function(node) {
  this.map = new google.maps.Map(node, {
    zoom: 11,
    center: new google.maps.LatLng(59.33, 18.03),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });
};

// http://bl.ocks.org/mbostock/899711

GMap.prototype.addData = function(data) {
  var overlay = new google.maps.OverlayView();
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
      .attr("class", "taxis");

    overlay.draw = function() {
      var projection = this.getProjection(),
        padding = 10;
      var marker = layer.selectAll("svg")
        .data(d3.entries(data))
        .each(transform) // update existing markers
        .enter().append("svg")
        .each(transform)
        .attr("class", "marker");

      marker.append("circle")
      .attr("r", 4.0)
      .attr("cx", padding)
      .attr("cy", padding);

      function transform(d) {
        d = new google.maps.LatLng(parseFloat(d.value.y_coord), parseFloat(d.value.x_coord));
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
      };
    };
  };

  overlay.setMap(this.map);
};

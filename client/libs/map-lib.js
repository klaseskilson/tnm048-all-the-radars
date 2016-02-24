GMap = function () {};

/**
 * create map
 * @param {HTMLNode] node           - the html node to append the map to
 */
GMap.prototype.setup = function(node) {
  this.map = new google.maps.Map(node, {
    zoom: 11,
    center: new google.maps.LatLng(59.33, 18.03),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });
};

// http://bl.ocks.org/mbostock/899711

GMap.prototype.addData = function(data) {
  var self = this;

  // create overlay if it doesn't exist
  self.overlay = self.overlay || new google.maps.OverlayView();

  // called from `setMap`
  self.overlay.onAdd = function() {
    self.layer = self.layer || d3.select(this.getPanes().overlayMouseTarget).append("div")
      .attr("class", "taxis");

    self.overlay.draw = function() {
      var projection = this.getProjection(),
        padding = 10;

      var marker = self.layer.selectAll("svg")
        .data(data)
        //.each(transform) // update existing markers
        .enter().append("svg")
        .each(transform)
        .on('click', select)
        .attr("class", "marker");

      marker.append("circle")
        .attr("r", 4.0)
        .attr("cx", padding)
        .attr("cy", padding);

      function transform (d) {
        let elem = this;
        d = new google.maps.LatLng(d.y_coord, d.x_coord);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(elem)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
      }
      function select (d) {
        let elem = this;
        self.select(d, elem);
      }
    };
  };

  // called when `setMap` is called a second time on an overlay
  self.overlay.onRemove = function () {
    if (self.layer) {
      self.layer.selectAll('.marker').remove();
    }
  };

  self.overlay.setMap(self.map);
};

GMap.prototype.select = function (datum) {
  let newContext = {
    subscription: 'getTaxisById',
    params: datum.taxiId,
    query: {
      taxiId: datum.taxiId
    },
  };

  // check if user attempts to set same context as the current
  if (Session.get('dataContext') === newContext) {
    return;
  }

  Session.set('dataContext', newContext);
};

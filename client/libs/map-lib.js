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
        stroke = 1,
        radius = 4;

      var marker = self.layer.selectAll("svg")
        .data(data)
        .each(transform)
        .enter().append("svg")
        .each(transform)
        .attr("class", "marker")
        .style({
          width: `${(radius + stroke) * 2}px`,
          height: `${(radius + stroke) * 2}px`,
        });

      marker.append("circle")
        .attr("r", radius)
        .on('click', select)
        .style('stroke-width', stroke)
        .attr("cx", radius + stroke)
        .attr("cy", radius + stroke)
        .style("fill", function(d) {
          return d.hired ? "green" : "red";
        })
        .style("stroke", function(d) {
          return d.hired ? "darkgreen" : "darkred";
        });

      function transform (d) {
        let elem = this;
        d = new google.maps.LatLng(d.y_coord, d.x_coord);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(elem)
            .style("left", (d.x) + "px")
            .style("top", (d.y) + "px");
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

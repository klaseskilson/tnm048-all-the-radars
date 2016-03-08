GMap = function () {};

/**
 * create map
 * @param {HTMLNode] node - the html node to append the map to
 */
GMap.prototype.setup = function(node) {
  this.map = new google.maps.Map(node, {
    zoom: 11,
    center: new google.maps.LatLng(59.33, 18.03),
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    disableDefaultUI: true,
  });
};

// http://bl.ocks.org/mbostock/899711

GMap.prototype.addData = function(data) {
  var self = this;

  // create overlay if it doesn't exist
  self.pointsOverlay = self.pointsOverlay || new google.maps.OverlayView();

  // called from `setMap`
  self.pointsOverlay.onAdd = function() {
    self.pointsLayer = self.pointsLayer || d3.select(this.getPanes().overlayMouseTarget).append("div")
      .attr("class", "taxis");

    self.pointsOverlay.draw = function() {
      var projection = this.getProjection(),
        stroke = 1,
        radius = 4;

      var marker = self.pointsLayer.selectAll("svg")
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
        .on('click', self.select)
        .style('stroke-width', stroke)
        .attr("cx", radius + stroke)
        .attr("cy", radius + stroke)
        .style('fill', d => d.hired ? 'red' : 'green')
        .style('stroke', d => d.hired ? 'darkred' : 'darkgreen');

      function transform (d) {
        let elem = this;
        d = new google.maps.LatLng(d.y_coord, d.x_coord);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(elem)
          .style("left", (d.x) + "px")
          .style("top", (d.y) + "px");
      }
    };
  };

  // called when `setMap` is called a second time on an overlay
  self.pointsOverlay.onRemove = function () {
    if (self.pointsLayer) {
      self.pointsLayer.selectAll('.marker').remove();
    }
  };

  self.pointsOverlay.setMap(self.map);
};

GMap.prototype.select = function (datum) {
  let old = Session.get('mapDataContext');
  let startDate = moment(old.range[0]).set({ 'hour': 0, 'minute': 0, 'second': 0, });
  let newContext = _.extend(old, {
    range: [startDate.toDate(), moment(startDate).add(1, 'day').toDate()],
    query: {
      taxiId: datum.taxiId
    },
  });

  Session.set('selectedTaxiId', datum.taxiId);
  Session.set('mapDataContext', newContext);
};

GMap.prototype.addClusters = function (clusterData) {
  let self = this;
  // prepare new overlay
  self.clusterOverlay = self.clusterOverlay || new google.maps.OverlayView();
  self.clusterOverlay.onAdd = function () {
    self.clusterLayer = self.clusterLayer || d3.select(this.getPanes().overlayMouseTarget)
        .append("div")
        .attr("class", "clusters");

    self.clusterOverlay.draw = function () {
      const projection = this.getProjection();
      const base = 48;
      const dimension = c => `${base}px`;
      const clusters = self.clusterLayer.selectAll('svg')
        .each(transform)
        .data(clusterData)
        .enter().append('svg')
        .each(transform)
        .attr('class', 'cluster')
        .style('height', dimension)
        .style('width', dimension);

      clusters.append('circle')
        .attr('r', `${base / 2}px`)
        .attr("cx", `${base / 2}px`)
        .attr("cy", `${base / 2}px`);

      function transform (cluster) {
        console.log('ah', cluster);
        let elem = this;
        cluster = new google.maps.LatLng(cluster.y, cluster.x);
        cluster = projection.fromLatLngToDivPixel(cluster);
        console.log('oh', cluster);
        return d3.select(elem)
          .style("left", cluster.x + "px")
          .style("top", cluster.y + "px");
      }
    };
  };

  self.clusterOverlay.onRemove = function () {
    if (self.clusterLayer) {
      self.clusterLayer.selectAll('.cluster').remove();
    }
  };

  self.clusterOverlay.setMap(self.map);
};
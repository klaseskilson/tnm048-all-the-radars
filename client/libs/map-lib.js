GMap = function () {};

/**
 * create map
 * @param {HTMLElement} element - the html element to append the map to
 */
GMap.prototype.setup = function(element) {
  this.map = new google.maps.Map(element, {
    zoom: 11,
    center: new google.maps.LatLng(59.33, 18.03),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
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
        .on('click', self.selectDot.bind(self))
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

GMap.prototype.selectDot = function (datum) {
  let old = Session.get('mapDataContext');
  let startDate = moment(old.range[0]).set({ 'hour': 0, 'minute': 0, 'second': 0, });
  let newContext = _.extend(old, {
    range: [startDate.toDate(), moment(startDate).add(1, 'day').toDate()],
    query: {
      taxiId: datum.taxiId
    },
  });

  // empty cluster overlay
  this.addClusters([]);

  Session.set('selectedTaxiId', datum.taxiId);
  Session.set('mapDataContext', newContext);
};

GMap.prototype.addClusters = function (clusterData, minLength = 10) {
  let self = this;
  // prepare new overlay
  self.clusterOverlay = self.clusterOverlay || new google.maps.OverlayView();
  // reactive blaze views
  self.renderedBlazeViews = self.renderedBlazeViews || [];
  self.clusterOverlay.onAdd = function () {
    self.clusterLayer = self.clusterLayer || d3.select(this.getPanes().overlayMouseTarget)
        .append("div")
        .attr("class", "clusters");

    self.clusterOverlay.draw = function () {
      // callback for click events on clusters
      const selectCluster = cluster => {
        const expand = cluster.expand;
        expand.set(!expand.get());
      };

      // callback for hover events on clusters
      const hoverCluster = isHovered => cluster => {
        cluster.hover.set(isHovered);
      };

      // meteory hack using the blaze template library to make a tiny reactive context
      // inside the cluster.
      const customView = className => {
        // wrap blaze template to use closure magic
        const view = (cluster, element) => Blaze.View(() => {
          element.classList.toggle(className, cluster[className].get());
          return '';
        });

        // return callback that gets called by d3
        return function (cluster) {
          const element = this;
          const renderedView = view(cluster, element);
          Blaze.render(renderedView, element);
          self.renderedBlazeViews.push(renderedView);
        };
      };

      const projection = this.getProjection();
      const base = 24,
            strokeWidth = 2;
      const dimension = c => base + (c.drivers.length - minLength);

      // transform lat/lon coordinates to pixel coordinates
      const transform = function (cluster) {
        let elem = this;
        cluster = new google.maps.LatLng(cluster.y_coord, cluster.x_coord);
        cluster = projection.fromLatLngToDivPixel(cluster);
        return d3.select(elem)
          .style("left", cluster.x + "px")
          .style("top", cluster.y + "px");
      };

      // append the clusters!
      const clusters = self.clusterLayer.selectAll('svg')
        .each(transform)
        .data(clusterData)
        .enter().append('svg')
        .each(transform)
        .attr('class', 'cluster')
        .style('height', c => `${dimension(c)}px`)
        .style('width', c => `${dimension(c)}px`);

      clusters.append('circle')
        .attr('r', c => `${(dimension(c) / 2) - strokeWidth}px`)
        .each(customView('hover'))
        .each(customView('expand'))
        .on('click', selectCluster)
        .on('mouseenter', hoverCluster(true))
        .on('mouseleave', hoverCluster(false));

    };
  };

  self.clusterOverlay.onRemove = function () {
    if (self.clusterLayer) {
      self.clusterLayer.selectAll('.cluster').remove();
    }
    // stop all reactive blaze views
    self.renderedBlazeViews.forEach(Blaze.remove);
  };

  self.clusterOverlay.setMap(self.map);
};
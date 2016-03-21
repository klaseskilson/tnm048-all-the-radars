Template.clusterList.helpers({
  hasClusters () {
    return this.clusters.length > 0;
  },

  selectedHour() {
    let { range } = Session.get('selectedHour') || {};
    range = range || {};
    const from = moment(range[0]).format('MMM Do, HH:mm'),
      to = moment(range[1]).format('HH:mm');
    return `${from} - ${to}`;
  },

  position () {
    const precision = 6;
    return `${this.x_coord.toPrecision(precision)}, ${this.y_coord.toPrecision(precision)}`;
  },

  count () {
    return this.drivers.length;
  },

  expandCluster (value = true) {
    return this.expand.get() ? value : false;
  },

  hoverClass () {
    return this.hover.get() ? 'clusters__entry--hovered' : '';
  },
});

Template.clusterList.events({
  'click .js-toggle-cluster' (event) {
    event.preventDefault();
    this.expand.set(!this.expand.get());
  },

  'mouseenter .js-toggle-cluster' () {
    this.hover.set(true);
  },

  'mouseleave .js-toggle-cluster' () {
    this.hover.set(false);
  },
});

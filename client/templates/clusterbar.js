Template.clusterbar.helpers({
  hideSidebar (value) {
    value = value || true;
    let taxiId = Session.get('selectedTaxiId');
    return taxiId ? value : false;
  }
});

Template.clusterForm.onCreated(function () {
  this.clustering = new ReactiveVar(false);
  this.clusters = new ReactiveVar([]);
});

Template.clusterForm.onDestroyed(function () {
  if (this.subs) {
    this.subs.stop();
  }
});

Template.clusterForm.helpers({
  loading () {
    return Template.instance().clustering.get();
  },

  clusters () {
    return Template.instance().clusters.get();
  },
});

Template.clusterForm.events({
  'submit .js-cluster-form' (event) {
    event.preventDefault();
    const cars = parseInt(event.currentTarget.cars.value);
    const radius = parseFloat(event.currentTarget.radius.value);

    // start loading indicator
    const instance = Template.instance();
    instance.clustering.set(true);

    // subscribe to data and wait for it
    const { range } = Session.get('selectedHour');
    instance.subs = Meteor.subscribe('getTaxis', range, () => {
      const { range } = Session.get('selectedHour');
      const data = TaxisCollection.find({
        date: {
          $gte: range[0],
          $lte: range[1]
        },
      }, {
        sort: {
          taxiId: 1,
          date: 1,
        },
      }).fetch();
      cluster(data, cars, radius).then((clusters) => {
        // send clusters to map and list
        window.theMap.addClusters(clusters, cars);
        instance.clusters.set(clusters);
        // stop loading indicator
        instance.clustering.set(false);
        // remove cached data!
        instance.subs.stop();
      }, (error) => {
        instance.clustering.set(false);
        // remove cached data!
        instance.subs.stop();
      });
    });
  }
});

Template.clusterList.helpers({
  hasClusters () {
    return this.clusters.length > 0;
  },

  position () {
    const precision = 6;
    return `${this.x_coord.toPrecision(precision)}, ${this.y_coord.toPrecision(precision)}`
  },

  count () {
    return this.drivers.length;
  },
});


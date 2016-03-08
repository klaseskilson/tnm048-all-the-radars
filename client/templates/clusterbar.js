Template.clusterbar.helpers({
  hideSidebar (value) {
    value = value || true;
    let taxiId = Session.get('selectedTaxiId');
    return taxiId ? value : false;
  }
});

Template.clusterForm.onCreated(function () {
  this.clustering = new ReactiveVar(false);
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
});

Template.clusterForm.events({
  'submit .js-cluster-form' (event) {
    event.preventDefault();
    const cars = parseInt(event.currentTarget.cars.value);
    const radius = parseFloat(event.currentTarget.radius.value);

    // start loading indicator
    const clustering = Template.instance().clustering;
    clustering.set(true);

    // subscribe to data and wait for it
    const { range } = Session.get('selectedHour');
    const instance = Template.instance();
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
        console.log('DONE!', clusters);
        // send clusters to map
        window.theMap.addClusters(clusters);
        // stop loading indicator
        clustering.set(false);
        // remove cached data!
        instance.subs.stop();
      }, (error) => {
        console.log('ERROR!', error);
        clustering.set(false);
        // remove cached data!
        instance.subs.stop();
      });
    });
  }
});

function cluster (data, cars, radius) {
  return new Promise((resolve, reject) => {
    if (data.length === 0) {
      reject(cars);
      return;
    }

    // simulate loading with setTimeout
    setTimeout(() => {
      const clusters = [
        {
          x: 18.1621513366699,
          y: 59.3108901977539,
          taxis: [1,2,3,4,5,6,7,8,9],
        },
        {
          x: 18.0748252868652,
          y: 59.326530456543,
          taxis: [1,2,3,4,5,6],
        },
        {
          x: 18.056266784668,
          y: 59.328182220459,
          taxis: [1,2,3,4,5,6,7,8,9,1,2,3,3,4,5,56,6,7],
        },
      ]
      resolve(clusters);
    }, 3000);

    //
    // cluster here!
    //
  });
}

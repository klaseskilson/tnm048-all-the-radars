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
      cluster(data, cars, radius).then((data) => {
        console.log('DONE!', data);
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
    if (data.lenght === 0) {
      reject(cars);
      return;
    }

    // simulate loading with setTimeout
    setTimeout(() => {
      resolve(cars);
    }, 3000);

    //
    // cluster here!
    //
  });
}

Template.clusterbar.helpers({
  hideSidebar (value) {
    value = value || true;
    let taxiId = Session.get('selectedTaxiId');
    return taxiId ? value : false;
  }
});

Template.clusterForm.onCreated(function () {
  var template = this;

  template.autorun(() => {

    // template.subscribe('getTaxis')

	});
});

Template.clusterForm.onCreated(function () {
  this.clustering = new ReactiveVar(false);
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

    const clustering = Template.instance().clustering;
    clustering.set(true);

    cluster(cars, radius).then((data) => {
      console.log('DONE!', data);
      clustering.set(false);
    }, (error) => {
      console.log('ERROR!', error);
      clustering.set(false);
    });
  }
});

function cluster (cars, radius) {
  return new Promise((resolve, reject) => {
    //
    // cluster here!
    //

    if (cars > 10) {
      // simulate loading with setTimeout
      setTimeout(() => {
        resolve(cars);
      }, 3000);
    } else {
      reject(cars);
    }
  });
}

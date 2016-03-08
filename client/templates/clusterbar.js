Template.clusterbar.helpers({
  hideSidebar (value) {
    value = value || true;
    let taxiId = Session.get('selectedTaxiId');
    return taxiId ? value : false;
  }
});

Template.clusterbar.onCreated(function () {
  var template = this;

  template.autorun(() => {

    // template.subscribe('getTaxis')

	});
});

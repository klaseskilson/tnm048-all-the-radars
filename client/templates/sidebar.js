Template.sidebar.helpers({
  hideSidebar (value) {
    value = value || true;
    return !Session.get('selectedTaxiId') ? value : false;
  },

  driver () {
    return Session.get('selectedTaxiId');
  },

  taxiList () {
    return new ReactiveVar([]);
  },
});

Template.sidebar.events({
  'click .js-exit-taxi': () => {
    let dataContext = Session.get('mapDataContext');
    let startTime = dataContext.range[0];
    dataContext.query = {};
    dataContext.range = [startTime, moment(startTime).set({ second: 59, millisecond: 999 }).toDate()];
    Session.set('mapDataContext', dataContext);
    Session.set('selectedTaxiId', null);
  }
});

Template.info.helpers({
  hasData () {
    return TaxisCollection.find({ taxiId: Session.get('selectedTaxiId') }).count() > 0;
  }
});

Template.info.events({
  'change .js-select-driver' (event) {
    let newId = parseInt(event.currentTarget.value);
    let mapContext = Session.get('mapDataContext');
    mapContext.query = _.extend(mapContext.query, { taxiId: newId });
    Session.set('selectedTaxiId', newId);
    Session.set('mapDataContext', mapContext);
  },
});

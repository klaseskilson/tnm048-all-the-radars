Template.sidebar.helpers({
  hideSidebar (value) {
    value = value || true;
    let taxiId = Session.get('selectedTaxiId');
    return !taxiId ? value : false;
  }
});

Template.sidebar.events({
  'click .js-exit-taxi': () => {
    let dataContext = Session.get('mapDataContext');
    let startTime = dataContext.range[0];
    dataContext.subscription = 'getTaxis';
    dataContext.query = {};
    dataContext.range = [startTime, moment(startTime).set({ second: 59, millisecond: 999 }).toDate()];
    Session.set('mapDataContext', dataContext);
    Session.set('selectedTaxiId', null);
  }
});

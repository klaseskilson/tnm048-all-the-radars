Template.sidebar.helpers({
  hideSidebar (value) {
    value = value || true;
    let dataContext = Session.get('dataContext');
    let subscription = dataContext && dataContext.subscription;
    return subscription !== 'getTaxisById' ? value : false;
  }
});

Template.sidebar.events({
  'click .js-exit-taxi': () => {
    let dataContext = Session.get('dataContext');
    dataContext.subscription = 'getTaxisByDate';
    Session.set('dataContext', dataContext);
  }
});

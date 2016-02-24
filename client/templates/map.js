var theMap = new GMap();

Template.map.onCreated(function () {
  Session.setDefault('dataContext', {
    subscription: 'getTaxisByDate',
    params: [new Date(2013, 2, 1), new Date(2013, 2, 31)],
    query: {},
  });

  this.autorun(() => {
    let { subscription, params, query } = Session.get('dataContext');

    this.subscribe(subscription, params, () => {
      // this after flush thingy ensures the template is re-rendered (if needed)
      Tracker.afterFlush(() => {
        theMap.addData(Taxis.find(query).fetch());
        theMap.addData(TaxisCollection.find(query).fetch());
      });
    });
  });
});

Template.map.onRendered(function createMap() {
  theMap.setup(this.find('#map'));
});

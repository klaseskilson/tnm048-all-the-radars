var theMap = new GMap();

Template.map.onCreated(function () {
  this.autorun(() => {
    // ensure timeline is loaded first so that we have a date
    let dataContext = Session.get('dataContext');
    if (!dataContext) {
      return;
    }
    let { subscription, params, query } = dataContext;

    this.subscribe(subscription, params, () => {
      // this after flush thingy ensures the template is re-rendered (if needed)
      Tracker.afterFlush(() => {
        theMap.addData(TaxisCollection.find(query).fetch());
      });
    });
  });
});

Template.map.onRendered(function createMap() {
  theMap.setup(this.find('#map'));
});

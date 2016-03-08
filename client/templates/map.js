window.theMap = new GMap();

Template.map.onCreated(function () {
  this.autorun(() => {
    // ensure timeline is loaded first so that we have a date
    let mapDataContext = Session.get('mapDataContext');
    if (!mapDataContext) {
      return;
    }

    let { range, query } = mapDataContext;
    this.subscribe('getTaxis', range, query, () => {
      query = _.defaults(query, {
        date: {
          $gte: range[0],
          $lte: range[1]
        }
      });
      // this after flush thingy ensures the template is re-rendered (if needed)
      Tracker.afterFlush(() => {
        window.theMap.addData(TaxisCollection.find(query).fetch());
      });
    });
  });
});

Template.map.onRendered(function createMap() {

  window.theMap.setup(this.find('#map'));
});

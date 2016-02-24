var theMap = new GMap();

Template.map.onCreated(function () {
  var template = this;

  template.autorun(() => {
    var data = Template.currentData(),
        subscription = data && data.subscription || 'getTaxisByDate',
        range = data && data.range || [new Date(2013, 02, 01), new Date(2013, 02, 31)];

    template.subscribe(subscription, range, () => {
      // this after flush thingy ensures the template is re-renderd (if needed)
      Tracker.afterFlush(() => {
        theMap.addData(Taxis.find({}).fetch());
      });
    });
  });
});

Template.map.onRendered(function createMap() {
  var template = this;
  theMap.setup(template.firstNode);
});

var theMap = new GMap();
var dsv = d3.dsv(";", "text/plain");

Template.map.onCreated(function () {
  var self = this;

  self.autorun(function () {
    var data = Template.currentData(),
        subscription = data && data.subscription || 'getTaxisById',
        id = data && data.id || 11228;

    self.subscribe(subscription, id);
  });
});

Template.map.onRendered(function createMap() {
  var self = this;
  theMap.setup(self.firstNode);
  dsv('/small-data.dsv', function (error, data) {
    if (error) throw error;
    theMap.addData(data);
  });
});

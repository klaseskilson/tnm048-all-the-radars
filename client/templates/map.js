var theMap = new GMap();
var dsv = d3.dsv(";", "text/plain");

Template.map.onRendered(function createMap() {
  var self = this;
  theMap.setup(self.firstNode);
  dsv('/small-data.dsv', function (error, data) {
    if (error) throw error;
    theMap.addData(data);
  });
});

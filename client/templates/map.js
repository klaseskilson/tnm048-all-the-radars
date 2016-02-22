var theMap = new GMap();

Template.map.onRendered(function createMap() {
  var self = this;
  theMap.setup(self.firstNode);
});

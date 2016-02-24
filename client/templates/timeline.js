
// Template.timeLine.onRendered(function() {
// 	var dsv = d3.dsv(";", "text/plain");
// 	dsv('/small-data.dsv', function (error, data) {
//     if (error) throw error;


//   });

// });

var tl = new Timeline();

Template.timeLine.onCreated(function () {
  var template = this;

  template.autorun(() => {
    var data = Template.currentData(),
        subscription = data && data.subscription || 'getTimeline';

    template.subscribe(subscription, () => {
      // this after flush thingy ensures the template is re-renderd (if needed)
      Tracker.afterFlush(() => {
        tl.drawTimeline(TimelineCollection.find().fetch());
        // theMap.addData(Taxis.find({}).fetch());
      });
    });
  });
});
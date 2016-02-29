
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
      });
    });
  });
});
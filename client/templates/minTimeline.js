var mtl = new minTimeline();

Template.minTimeLine.onCreated(function () {
  var template = this;

  template.autorun(() => {

    let hourData = Session.get('selectedHour');
    if (!hourData) {
      return;
    }

    template.subscribe('getMinuteTimeline', hourData.params, () => {
      // this after flush thingy ensures the template is re-renderd (if needed)
      Tracker.afterFlush(() => {
        let minuteData = TimelineCollection.find({resolution: 'minute', date: {
          $gte: hourData.params[0],
          $lte: hourData.params[1]
          }}).fetch();
        mtl.drawTimeline(minuteData);
      });
    });
  });
});

var tl = new Timeline();

Template.timeLine.onCreated(function () {
  var template = this;

  template.autorun(() => {
    template.subscribe('getTimeline', () => {
      // this after flush thingy ensures the template is re-renderd (if needed)
      Tracker.afterFlush(() => {
        let timelineData = TimelineCollection.find().fetch();
        tl.drawTimeline(timelineData);
        
        let firstDate = timelineData[0].date,
            secondDate = new Date(firstDate);
        secondDate.setMinutes(secondDate.getMinutes() + 1);
        Session.setDefault('mapDataContext', {
          subscription: 'getTaxis',
          range: [firstDate, secondDate],
          query: {},
        })
      });
    });
  });
});

var htl = new hourTimeline();

Template.hourTimeLine.onCreated(function () {
  var template = this;

  template.autorun(() => {
    template.subscribe('getHourTimeline', () => {
      // this after flush thingy ensures the template is re-renderd (if needed)
      Tracker.afterFlush(() => {
        let timelineData = TimelineCollection.find().fetch();
        htl.drawTimeline(timelineData);

        let firstMin = timelineData[0].date,
            lastMin = new Date(firstMin);
        lastMin.setHours(lastMin.getHours() + 1);
        Session.set('selectedHour', {
          subscription: 'getMinuteTimeline',
          range: [firstMin, lastMin],
        });

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

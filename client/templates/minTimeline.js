var mtl = new minTimeline();

Template.minTimeLine.onCreated(function () {
  var template = this;

  template.autorun(() => {

    let hourData = Session.get('selectedHour');
    if (!hourData) {
      return;
    }

    template.subscribe('getMinuteTimeline', hourData.range, () => {
      // this after flush thingy ensures the template is re-renderd (if needed)
      Tracker.afterFlush(() => {
        let minuteData = TimelineCollection.find({
          resolution: 'minute',
          date: {
            $gte: hourData.range[0],
            $lte: hourData.range[1]
          },
        }).fetch();
        mtl.drawTimeline(minuteData);
      });
    });
  });
});

Template.minTimeLine.helpers({
  selectedHour () {
    const { range } = Session.get('selectedHour') || {};
    let from = moment(range[0]).format('MMMM Do, HH:mm'),
        to = moment(range[1]).format('HH:mm');
    return `${from} - ${to}`;
  }
});

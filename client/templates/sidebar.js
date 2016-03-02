Template.sidebar.helpers({
  hideSidebar (value) {
    value = value || true;
    let dataContext = Session.get('dataContext');
    let subscription = dataContext && dataContext.subscription;
    return subscription !== 'getTaxisById' ? value : false;
  }
});

Template.sidebar.events({
  'click .js-exit-taxi': () => {
    let dataContext = Session.get('dataContext');
    dataContext.subscription = 'getTaxisByDate';
    Session.set('dataContext', dataContext);
  }
});

Template.calendar.helpers({
  weeks () {
    let weeksNumbers = [0, 1, 2, 3, 4];
    let firstMarch = moment([2013, 2, 1]);
    let offset = firstMarch.day();
    let firstDay = moment(firstMarch).subtract(offset, 'days');

    // change from array of numbers to array of objects
    return weeksNumbers.map((week) => {
      let weekNumber = week;
      let dayNumbers = [1, 2, 3, 4, 5, 6, 7];
      let days = dayNumbers.map((dayInWeek) => {
        let day = moment(firstDay).add(dayInWeek + weekNumber * 7, 'days');
        let name = day.format('D');
        let weekDay = day.format('ddd');
        let isMarch = day.month() === 2;

        return {
          day,
          name,
          weekDay,
          isMarch,
        }
      });

      return {
        days,
        weekNumber,
      };
    });
  },
});

Template.week.helpers({
  hilfe () {
    debugger;
  },

  monthClass (day) {
    return !day.isMarch && 'week__day__header--gray';
  }
})

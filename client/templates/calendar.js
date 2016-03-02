Template.calendar.helpers({
  fakeWeek() {
    return {
      days: [
        { name: 'mon', },
        { name: 'tue', },
        { name: 'wed', },
        { name: 'thu', },
        { name: 'fri', },
        { name: 'sat', },
        { name: 'sun', },
      ],
      weekClass: 'calendar__week--fake'
    };
  },

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
        let name = day.format('D / M');
        let weekDay = day.format('ddd');
        let isMarch = day.month() === 2;
        let count = isMarch && Math.floor(Math.random() * 100);

        return {
          day,
          name,
          weekDay,
          isMarch,
          count,
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
});

Template.calendar.onCreated(function () {
  let template = this;
  template.taxiId = new ReactiveVar(0);
  template.autorun(function () {
    let { subscription, params } = Session.get('dataContext');

    if (subscription !== 'getTaxisById') return;

    template.taxiId.set(params);
    template.subscribe(subscription, params);
  });
});

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
    const format = 'M_D';
    let taxiId = Template.instance().taxiId.get();
    let taxiData = {};

    TaxisCollection.find({
      taxiId: taxiId,
    }, {
      sort: {
        date: 1,
      }
    }).forEach(function (entry) {
      let key = moment(entry.date).format(format);
      if (!taxiData[key]) {
        taxiData[key] = [];
      }
      taxiData[key].push(entry);
    });

    let weeksNumbers = [0, 1, 2, 3, 4];
    let firstMarch = moment([2013, 2, 1]);
    let offset = firstMarch.day();
    let firstDay = moment(firstMarch).subtract(offset, 'days');

    let counts = [];

    // change from array of numbers to array of objects
    return weeksNumbers.map((week) => {
      let weekNumber = week;
      let dayNumbers = [1, 2, 3, 4, 5, 6, 7];
      let days = dayNumbers.map((dayInWeek) => {
        let day = moment(firstDay).add(dayInWeek + weekNumber * 7, 'days');
        let name = day.format('D / M');
        let weekDay = day.format('ddd');
        let isMarch = day.month() === 2;
        let dayData = taxiData[day.format(format)];
        let count = dayData && getUniqueBookings(dayData);

        counts.push(count);

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
        counts,
      };
    });
  },
});

Template.week.helpers({
  monthClass (day) {
    return !day.isMarch && 'week__day__header--gray';
  },

  dayColor (day) {
    this.max = this.max || _.max(this.counts);
    let count = day.count || 0;

    return {
      style: `background: rgba(253, 141, 60, ${count / this.max});`,
    };
  },
});

let getUniqueBookings = (entries) => {
  let count = 0;

  _.reduce(entries, (old, entry) => {
    if (entry.hired !== old) {
      if (entry.hired) ++count;
      return entry.hired;
    }
    return old;
  }, null);

  return count;
};

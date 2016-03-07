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

Template.calendar.onCreated(function () {
  let template = this;
  template.autorun(function () {
    Tracker.afterFlush(() => {
      template.subscribe('getTaxisById', Session.get('selectedTaxiId'));
    });
  });

  Session.setDefault('activeDay', '1 / 3');
});

Template.calendar.helpers({
  weeks () {
    const format = 'M_D';
    let taxiId = Session.get('selectedTaxiId');
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
  monthClass () {
    return !this.isMarch && 'week__day__header--gray';
  },

  dayColor () {
    let data = Template.parentData();
    data.max = data.max || _.max(data.counts);
    let count = this.count || 0;

    return {
      style: `background: rgba(253, 141, 60, ${count / data.max});`,
    };
  },

  isActive () {
    let range = Session.get('mapDataContext').range;
    return this.day.isSame(range[0], 'day') ? 'week__day--active' : '';
  },
});

Template.week.events({
  'click .js-click-day' (event, intance) {
    let old = Session.get('mapDataContext');
    let newContext = _.extend(old, {
      range: [
        this.day.toDate(),
        moment(this.day).add(1, 'day').toDate()
      ]
    });
    Session.set('mapDataContext', newContext);
  }
});

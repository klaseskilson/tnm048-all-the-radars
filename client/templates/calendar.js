let getUniqueBookings = (entries) => {
  let selected = [];

  _.reduce(entries, (old, entry) => {
    if (entry.hired !== old) {
      if (entry.hired) selected.push(entry);
      return entry.hired;
    }
    return old;
  }, null);

  return selected;
};

Template.calendar.onCreated(function () {
  this.autorun(() => {
    this.oldSubs = this.subs || {};
    this.subs = this.subscribe('getTaxisById', Session.get('selectedTaxiId'));
    // remove old subs cache
    if (this.subs !== this.oldSubs && this.oldSubs.subscriptionId) {
      this.oldSubs.stop();
    }
  });
});

Template.calendar.helpers({
  weeks () {
    const format = 'M_D';
    const taxiId = Session.get('selectedTaxiId');
    const range = Session.get('mapDataContext').range;
    const taxiData = {};

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

    const weeksNumbers = [0, 1, 2, 3, 4];
    const firstMarch = moment([2013, 2, 1]);
    const offset = firstMarch.day();
    const firstDay = moment(firstMarch).subtract(offset, 'days');

    const counts = [];

    // change from array of numbers to array of objects
    return weeksNumbers.map((week) => {
      const weekNumber = week;
      const dayNumbers = [1, 2, 3, 4, 5, 6, 7];
      const days = dayNumbers.map((dayInWeek) => {
        const day = moment(firstDay).add(dayInWeek + weekNumber * 7, 'days');
        const name = day.format('D / M');
        const weekDay = day.format('ddd');
        const isMarch = day.month() === 2;
        const dayData = taxiData[day.format(format)];
        const bookings = dayData && getUniqueBookings(dayData);
        const count = bookings && bookings.length;

        counts.push(count);

        if (day.isSame(range[0], 'day')) {
          this.taxiList.set(bookings);
        }

        return {
          day,
          name,
          weekDay,
          isMarch,
          bookings,
          count,
        };
      });

      return {
        days,
        weekNumber,
        counts,
      };
    });
  },

  taxis () {
    return this.taxiList.get();
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
    Template.parentData().taxiList.set(this.bookings);
  }
});

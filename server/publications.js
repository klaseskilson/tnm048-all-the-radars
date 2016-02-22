/**
 * get taxi data by date
 * @param  {Date}   from  - the start of the range
 * @param  {Date}   to    - the end of the range
 * @return {Cursor}       - mongo cursor
 */
Meteor.publish('getTaxisByDate', (from, to) => {
  return Taxis.find({
    date: {
      $gte: from,
      $lte: to
    }
  }, {
    sort: {
      date: 1
    }
  });
});

/**
 * get taxi data by taxi id
 * @param  {Integer}  id  - the start of the range
 * @return {Cursor}       - mongo cursor
 */
Meteor.publish('getTaxisById', (id) => {
  return Taxis.find({
    taxiId: id
  }, {
    sort: {
      date: 1
    }
  });
});

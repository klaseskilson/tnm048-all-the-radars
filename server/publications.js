/**
 * get taxi data by date
 * @param  {Array[Date, Date]}   range - date range to collect data in
 * @param  {Object}              query - (optional) allows you to specify more specific queries
 * @return {Cursor}                    - mongo cursor
 */
Meteor.publish('getTaxis', (range, query) => {
  query = query || {};
  if (range) {
    query = _.extend(query, {
      date: {
        $gte: range[0],
        $lte: range[1]
      }
    });
  }
  return TaxisCollection.find(query, {
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
  return TaxisCollection.find({
    taxiId: id
  }, {
    sort: {
      date: 1
    }
  });
});

/**
 * get the timeline
 * @return {Cursor}       - mongo cursor
 */
Meteor.publish('getTimeline', () => {
  return TimelineCollection.find({
    resolution: 'tenMinute'
  }, {
    sort: {
      date: 1
    }
  });
});
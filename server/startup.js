Meteor.startup(() => {
  // when the server starts, check to see if we have any data in our database
  if (TaxisCollection.find().count() === 0) {
    Meteor.call('importData', 'data/small-data.dsv', err => {
      if (err) console.error(err);

      Meteor.call('createTimeline');
    });
  }
});
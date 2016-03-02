Meteor.methods({
  /**
   * import data from fileName and store it in mongo collection
   * @param  {string}   fileName    location of data file
   * @param  {number}   limit       optional limit of max num of entries
   * @return {null}
   */
  importData: function(fileName, limit) {
    limit = limit || Infinity;
    console.log(`Importing data from '${fileName}'...`);
    // read file!
    const keys = {
      id: 0,
      date: 1,
      x_coord: 2,
      y_coord: 3,
      hired: 4
    };
    let rootPath = process.env.PWD;

    const readline = Npm.require('readline');
    const fs = Npm.require('fs');

    var lineReader = readline.createInterface({
      input: fs.createReadStream(`${rootPath}/${fileName}`),
      terminal: false,
    });

    var dataArray = [];
    var index = 0;
    lineReader.on('line', Meteor.bindEnvironment((line) => {
      ++index;
      if (index === 1 || line === '' || index > limit) {
        //console.log('Skipping line', index, ':', line);
        return;
      }

      if (index % 100000 === 0) {
        console.log('Line', index);
      }

      // split data on `;`
      let values = line.split(';');
      let newData = {
        taxiId: parseFloat(values[keys.id]),
        // parse date using moment
        date: moment(values[keys.date], 'YYYY-MM-DD HH:mm:ss').toDate(),
        x_coord: parseFloat(values[keys.x_coord]),
        y_coord: parseFloat(values[keys.y_coord]),
        hired: values[keys.hired] === 't'
      };

      // add to collection!
      dataArray.push(newData);
      if (index % 10000 === 0) {
        console.log('Adding!');
        // insert every 10000th line
        TaxisCollection.rawCollection().insert(dataArray, (err, doc) => {
          if (err) {
            console.log(err, doc);
          }
        });
        dataArray = [];
      }
    })).on('close', () => {
      console.log('done with', index, 'lines! Creating date index...');
      TaxisCollection.rawCollection().createIndex({ date: 1 }, (err) => {
        console.log('done (date)!');
        if (err) {
          console.log(err);
        }
      });
      console.log('Creating taxiId index...')
      TaxisCollection.rawCollection().createIndex({ taxiId: 1 }, (err) => {
        console.log('done (taxiId)!');
        if (err) {
          console.log(err);
        }
      });
      console.log('Creating hired index...')
      TaxisCollection.rawCollection().createIndex({ hired: 1 }, (err) => {
        console.log('done (hired)!');
        if (err) {
          console.log(err);
        }
      });
    });
  },

  /**
   * populate Timeline collection from contents of Taxis collection
   */
  createTimeline: function () {
    console.log('Creating timeline data...');

    // empty previous data
    console.log('Emptying previous data...');
    TimelineCollection.remove({});

    // prepare data for different resolutions
    let timelineData = {
      minute: {},
      tenMinute: {},
      hour: {}
    };

    // methods for the different resolutions
    let timestampMethods = {
      minute: function (d) {
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
      },
      tenMinute: function (d) {
        let newMinute = Math.floor(d.getMinutes() / 10) * 10;
        d.setMinutes(newMinute);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
      },
      hour: function (d) {
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d;
      }
    };

    console.log('Counting traffic...');
    let index = 0;
    TaxisCollection.find({ hired: true }).forEach((d) => {
      ++index;
      _.forEach(timelineData, (entries, resolution) => {
        let timestamp = timestampMethods[resolution](d.date);
        let key = `${timestamp}_${resolution}`;
        if (!entries[key]) {
          entries[key] = {
            count: 0,
            date: timestamp,
            resolution: resolution,
          };
        }

        ++entries[key].count;
      });
      if (index % 10000 === 0) {
        console.log('Entry nr', index);
      }
    });

    console.log('Inserting objects...');
    _.forEach(timelineData, (entries, resolution) => {
      let values = _.values(entries);
      TimelineCollection.rawCollection().insert(values, (err) => {
        console.log('inserted values for', resolution);
        if (err) {
          console.log(err);
        }
      });
    });

    console.log('done!');

    console.log('Creating date indices...');
    TaxisCollection.rawCollection().createIndex({ date: 1 }, (err) => {
      console.log('done (date)!');
      if (err) {
        console.log(err);
      }
    });
    console.log('Creating resolution indices...');
    TaxisCollection.rawCollection().createIndex({ resolution: 1 }, (err) => {
      console.log('done (resolution)!');
      if (err) {
        console.log(err);
      }
    });
  },
});

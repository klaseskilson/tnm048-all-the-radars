Meteor.methods({
  /**
   * import data from fileName and store it in mongo collection
   * @param  {string}   fileName    location of data file
   * @return {null}
   */
  importData: function(fileName) {
    console.log(`Importing data from '${fileName}'...`);
    // read file!
    //let fs = Npm.require('fs');
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
      if (index === 1 || ('' + line) === '') {
        console.log('Skipping line', index, ':', line);
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
        console.log('done!');
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
    TimelineCollection.remove({});

    // prepare placeholder for resolution
    let timelineData = {
      minute: {},
      tenMinute: {},
      hour: {}
    };

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

    TaxisCollection.find({ hired: true }).forEach((d) => {
      _.forEach(timelineData, (entries, resolution) => {
        let timestamp = timestampMethods[resolution](d.date);
        if (!entries[timestamp]) {
          entries[timestamp] = {
            count: 0,
            resolution: resolution
          };
        }
        ++entries[timestamp].count;
        Timeline.update({
          date: timestamp,
          resolution: resolution
        }, {
          $inc: {
            count: 1
          },
          $setOnInsert: {
            count: 1,
            date: timestamp,
            resolution: resolution
          }
        }, {
          upsert: true
        });
      });
    });

    console.log('done!');
  },
});

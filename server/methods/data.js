Meteor.methods({
  /**
   * import data from fileName and store it in mongo collection
   * @param  {string}   fileName    location of data file
   * @return {null}
   */
  importData: function(fileName) {
    if (Meteor.isClient) return;
    console.log(`Importing data from '${fileName}'...`);
    // read file!
    let fs = Npm.require('fs');
    const keys = {
      id: 0,
      date: 1,
      x_coord: 2,
      y_coord: 3,
      hired: 4
    };
    let rootPath = process.env.PWD;
    fs.readFile(`${rootPath}/${fileName}`, 'utf8', Meteor.bindEnvironment((err, data) => {
      if (err) throw err;

      // split data on new lines
      let dataArray = data.split(/\n/);
      // loop through each line
      dataArray.forEach((line, index) => {
        if (index === 0 || line === '') return;

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
        Taxis.insert(newData);
      });
    }));
    console.log('done!');
  },

  createTimeline: function () {
    if (Meteor.isClient) return;
    console.log('Creating timeline data...');

    // empty previous data
    Timeline.remove({});

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
        return d.getTime();
      },
      tenMinute: function (d) {
        let newMinute = Math.floor(d.getMinutes() / 10) * 10;
        d.setMinutes(newMinute);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d.getTime();
      },
      hour: function (d) {
        d.setMinutes(0);
        d.setSeconds(0);
        d.setMilliseconds(0);
        return d.getTime();
      }
    };

    Taxis.find({ hired: true }).forEach((d) => {
      _.forEach(timelineData, (entries, resolution) => {
        let timestamp = timestampMethods[resolution](d.date);
        if (!entries[timestamp]) {
          entries[timestamp] = {
            count: 0,
            resolution: resolution
          };
        }
        ++entries[timestamp].count;
      });
    });

    _.forEach(timelineData, (entries, resolution) => {
      _.forEach(entries, (value, timestamp) => {
        let date = new Date();
        date.setTime(timestamp);
        let entry = {
          date: date,
          count: value.count,
          resolution: resolution
        };

        Timeline.insert(entry);
      });
    });

    console.log('done!');
  },
});

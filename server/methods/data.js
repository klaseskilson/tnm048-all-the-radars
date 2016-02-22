Meteor.methods({
  /**
   * import data from fileName and store it in mongo collection
   * @param  {string}   fileName    location of data file
   * @return {null}
   */
  importData: function(fileName) {
    if (Meteor.isClient) return;
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
  },
});

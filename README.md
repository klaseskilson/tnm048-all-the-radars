# All the taxis

## Setup and run

This is a `meteor` application. Make sure you [have it installed](https://www.meteor.com/install), and then run

```bash
meteor
```

in the root of this application to install depenencies and run the app.

### Data importing

There are some Meteor `methods` for importing data. In the repo, a small subset of a 
[larger file](http://webstaff.itn.liu.se/~davgu/viz/taxi_sthlm_march_2013.csv) is available in
[`data/small-data.dsv`](data/small-data.dsv).

To import this data to MongoDB, run

```js
Meteor.call('importData', 'data/small-data.dsv');
```

in your browser. You can change `'data/small-data.dsv'` to whatever file you want, as long as the path is relative to 
the root of this repo. For larger files, this is time consuming. 

To build the timeline data after this, run

```js
Meteor.call('createTimeline');
```


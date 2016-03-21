Template.clusterList.helpers({
  hasClusters () {
    return this.clusters.length > 0;
  },

  selectedHour() {
    let { range } = Session.get('selectedHour') || {};
    range = range || {};
    const from = moment(range[0]).format('MMM Do, HH:mm'),
      to = moment(range[1]).format('HH:mm');
    return `${from} - ${to}`;
  },

  position () {
    const precision = 6;
    return `${this.x_coord.toPrecision(precision)}, ${this.y_coord.toPrecision(precision)}`;
  },

  count () {
    return this.drivers.length;
  },

  expandCluster (value = true) {
    return this.expand.get() ? value : false;
  },

  hoverClass () {
    return this.hover.get() ? 'clusters__entry--hovered' : '';
  },
});

Template.clusterList.events({
  'click .js-toggle-cluster' (event) {
    event.preventDefault();
    this.expand.set(!this.expand.get());
  },

  'mouseenter .js-toggle-cluster' () {
    this.hover.set(true);
  },

  'mouseleave .js-toggle-cluster' () {
    this.hover.set(false);
  },
});

Template.taxiList.onCreated(function () {
  const geocoder = new google.maps.Geocoder();

  const getPosition = ({ lat, lng }) => {
    return new Promise((resolve, reject = console.warn.bind(console)) => {
      const latLng = new google.maps.LatLng(lat, lng);

      geocoder.geocode({ latLng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            resolve(results[0].formatted_address);
          }
        } else {
          reject(status);
        }
      });
    });
  };

  const data = Template.currentData();
  data.taxis = _.chain(data.taxis)
    .sortBy(taxi => taxi.date.getTime())
    .map(taxi => {
      taxi.positionName = new ReactiveVar('');
      const position = {
        lat: taxi.y_coord,
        lng: taxi.x_coord,
      };
      getPosition(position).then(address => taxi.positionName.set(address));
      return taxi;
    })
    .value();
});

Template.taxiList.helpers({
  coordinates () {
    const precision = 6;
    return `${this.x_coord.toPrecision(precision)}, ${this.y_coord.toPrecision(precision)}`;
  },

  position () {
    return this.positionName.get();
  },

  time () {
    return moment(this.date).format('HH:mm');
  },
});

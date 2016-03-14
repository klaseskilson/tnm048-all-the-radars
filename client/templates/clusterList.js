Template.clusterList.helpers({
  hasClusters () {
    return this.clusters.length > 0;
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
});

Template.taxiList.onCreated(function () {
  const geocoder = new google.maps.Geocoder();

  const getPosition = ({ lat, lng }) => {
    return new Promise((resolve, reject = console.warn) => {
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

  const { taxis } = Template.currentData();
  taxis.map(taxi => {
    taxi.positionName = new ReactiveVar('');
    const position = {
      lat: taxi.y_coord,
      lng: taxi.x_coord,
    };
    getPosition(position).then(address => taxi.positionName.set(address));
    return taxi;
  })
});

Template.taxiList.helpers({
  coordinates () {
    const precision = 6;
    return `${this.x_coord.toPrecision(precision)}, ${this.y_coord.toPrecision(precision)}`;
  },

  position () {
    return this.positionName.get();
  },
});

Template.clusterList.events({
  'click .js-toggle-cluster' (event) {
    event.preventDefault();
    this.expand.set(!this.expand.get());
  },
});


Template.taxiList.onCreated(function () {
  const geocoder = new google.maps.Geocoder();
  let delay = 100;
  this.getPosition = ({ lat, lng }) => {
    return new Promise((resolve, reject = console.warn.bind(console)) => {
      const latLng = new google.maps.LatLng(lat, lng);

      geocoder.geocode({ latLng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            resolve(results[0].formatted_address);
          }
        } else {
          if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            reject(delay += 50);
          } else {
            console.error(status);
          }
        }
      });
    });
  };
});

Template.taxiList.helpers({
  taxis () {
    return _.chain(this.taxis)
      .sortBy(taxi => taxi.date.getTime())
      .map(taxi => {
        // check position name is already set
        if (!taxi.positionName) {
          taxi.positionName = new ReactiveVar('finding address...');
          const position = {
            lat: taxi.y_coord,
            lng: taxi.x_coord,
          };
          const instance = Template.instance();
          const getPosition = () => {
            instance.getPosition(position)
              .then(
                // success, set address name
                address => taxi.positionName.set(address),
                // failure, increase delay and try again
                delay => setTimeout(getPosition, delay)
              );
          };
          getPosition();
        }
        return taxi;
      })
      .value();
  },

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

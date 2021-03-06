cluster = function (data, cars, radius) {
  return new Promise((resolve, reject) => {
    if (data.length === 0) {
      reject(cars);
      return;
    }
    var pickUpPoint = [];
    var clusters = [];
    _.reduce(data, (old, entry) => {
      if (entry.hired !== old.hired && entry.hired) {
        pickUpPoint.push(entry);
      }
      return entry;
    }, {});

    //Set first cluster
    var firstCluster = {x_coord: pickUpPoint[0].x_coord, y_coord: pickUpPoint[0].y_coord};
    firstCluster.drivers = [];
    firstCluster.drivers.push(pickUpPoint[0]);
    clusters.push(firstCluster);

    var distance = 0;

    var inserted = 0;

    //Calculate first clusters
    for (var i = 1; i < pickUpPoint.length; i++) {
      for (var j = 0; j < clusters.length; j++) {
        distance = longLatDistance(clusters[j].x_coord, clusters[j].y_coord, pickUpPoint[i].x_coord, pickUpPoint[i].y_coord);
        if( distance <= radius) {
          clusters[j].drivers.push(pickUpPoint[i]);
          inserted = 1;
          break;
        }
      }
      if (inserted == 0) {
        var insertCluster = {drivers: [pickUpPoint[i]], x_coord: pickUpPoint[i].x_coord, y_coord: pickUpPoint[i].y_coord};
        clusters.push(insertCluster);
      }
    }

    //Remove unwanted clusters
    clusters = _.filter(clusters, function (cluster) {
      return cluster.drivers && cluster.drivers.length >= cars;
    });
    var clusterDistance = 0;
    for (var i = 0; i < clusters.length; i++) {
      for (var j = 0; j < clusters.length; j++) {
        if(i === j) {
          continue;
        }
        clusterDistance = longLatDistance(clusters[j].x_coord, clusters[j].y_coord, clusters[i].x_coord, clusters[i].y_coord);
        if (clusterDistance <= radius * 2) {
          if (clusters[i].drivers.length < clusters[j].drivers.length) {
            clusters.splice(i, 1);
            i--;
            break;
          }
          else {
            clusters.splice(j, 1);
            j--;
          }
        }
      }
    }


    var sumOfOldCoords = 0,
      sumOfCoords = 0;
    do {
      sumOfOldCoords = 0;
      sumOfCoords = 0;
      for (var i = 0; i < clusters.length; i++) {
        sumOfOldCoords += clusters[i].x_coord;
        sumOfOldCoords += clusters[i].y_coord;
      }

      //Calculate new center of cluster
      clusters = calcNewCenter(clusters);

      for (var i = 0; i < clusters.length; i++) {
        sumOfCoords += clusters[i].x_coord;
        sumOfCoords += clusters[i].y_coord;
      }

      //Clear old data from clusters
      for (var i = 0; i < clusters.length; i++) {
        clusters[i].drivers = [];
      }

      distance = 0;
      for (var i = 0; i < pickUpPoint.length; i++) {
        for (var j = 0; j < clusters.length; j++) {
          distance = longLatDistance(clusters[j].x_coord, clusters[j].y_coord, pickUpPoint[i].x_coord, pickUpPoint[i].y_coord);
          if (distance <= radius) {
            clusters[j].drivers.push(pickUpPoint[i]);
            break;
          }
        }
      }
    } while (sumOfCoords != sumOfOldCoords)
    resolve(clusters);
  });
}

function longLatDistance(long1, lat1, long2, lat2) {

  var r = 6378.1;
  var diffLat = lat1 - lat2;
  var diffLong = long1 - long2;

  var rlat1 = (lat1 * (Math.PI/180));
  var rlat2 = (lat2 * (Math.PI/180));

  var a = Math.sin(diffLat/2) * Math.sin(diffLat/2) +
    Math.cos(rlat1) * Math.cos(rlat2) *
    Math.sin(diffLong/2) * Math.sin(diffLong/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = r * c;
  return d;
}

function calcNewCenter (clusters) {
  var x_coordinate = 0,
    y_coordinate = 0;
  for (var i = 0; i < clusters.length; i++) {
    for (var j = 0; j < clusters[i].drivers.length; j++) {
      x_coordinate += clusters[i].drivers[j].x_coord;
      y_coordinate += clusters[i].drivers[j].y_coord;
    }
    clusters[i].x_coord = (x_coordinate / clusters[i].drivers.length);
    clusters[i].y_coord = (y_coordinate / clusters[i].drivers.length);
    x_coordinate = 0;
    y_coordinate = 0;
  }
  return clusters;
}
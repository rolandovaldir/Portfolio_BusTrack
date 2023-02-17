// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com

mapboxgl.accessToken =
  "pk.eyJ1Ijoicm9sb3ZhbCIsImEiOiJjbGRwa3N3MWowMjJ1M3Btc3pyemFsMmltIn0.VXJv5S3Tv4UxCr4zDi21pA";

  // Request bus data from MBTA
const getBusLocations = async () => {
  try {
      const response = await fetch('https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip',
      { mode: 'cors' }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

// Ubdate bus locations coordinates on images objects added to the mapbox
const updateBusLocations = (data, map) => {
  const features = data.map((bus) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [bus.attributes.longitude, bus.attributes.latitude]
    },
    properties: {
      id: bus.id,
      route: bus.attributes.route_short_name
    }
  }));

  map.getSource('bus-locations').setData({
    type: 'FeatureCollection',
    features: features
  });
};


  /********** Begin tracking on mapbox *********** */
const initializeTrack = (data) => {

  var map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v12", // style URL
    center: [-71.0636, 42.3581], // starting center in [lng, lat]
    zoom: 12, // starting zoom
  });

  map.on('load', () => {
    // Add the bus icon image
    map.loadImage('./images/bus.png', (error, image) => {
      if (error) throw error;
      map.addImage('bus-icon', image);
    });

    // Create a GeoJSON data source for the bus locations
    map.addSource('bus-locations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add bus images from source
    map.addLayer({
      id: 'bus-locations',
      type: 'symbol',
      source: 'bus-locations',
      layout: {
        'icon-image': 'bus-icon',
        'icon-allow-overlap': true
      }
    });

    // Update the bus locations every 5 seconds
    setInterval(async () => {
      const busData = await getBusLocations();
      updateBusLocations(busData.data, map);
    }, 2000);
  });
};

initializeTrack();
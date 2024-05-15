const axios = require('axios');
const fs = require('fs');

// Your Google Maps API key
const API_KEY = 'AIzaSyCTRA6wGL6hqFAuhb3SXl0O77LJRUKaktc';

// List of Jakarta zip codes
const zipCodes = ['10110', '10120', '10210']; // Add all zip codes

// Function to get geo data for a zip code
const getGeoData = async (zipCode) => {
  const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  const params = {
    address: `${zipCode}, Jakarta, Indonesia`,
    key: API_KEY
  };

  try {
    const response = await axios.get(baseUrl, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for zip code ${zipCode}:`, error);
    return null;
  }
};

// Initialize GeoJSON structure
const geojson = {
  type: "FeatureCollection",
  features: []
};

// Process each zip code
const processZipCodes = async () => {
  for (const zipCode of zipCodes) {
    const data = await getGeoData(zipCode);
    if (data && data.status === 'OK') {
      for (const result of data.results) {
        const geometry = result.geometry;
        const bounds = geometry.bounds || geometry.viewport;
        const coordinates = [
          { lat: bounds.northeast.lat, lng: bounds.southwest.lng },
          { lat: bounds.northeast.lat, lng: bounds.northeast.lng },
          { lat: bounds.southwest.lat, lng: bounds.northeast.lng },
          { lat: bounds.southwest.lat, lng: bounds.southwest.lng },
          { lat: bounds.northeast.lat, lng: bounds.southwest.lng }
        ];

        const feature = {
          type: "Feature",
          properties: {
            zip_code: zipCode,
            formatted_address: result.formatted_address
          },
          geometry: {
            type: "Polygon",
            coordinates: [coordinates.map(coord => [coord.lng, coord.lat])]
          }
        };
        geojson.features.push(feature);
      }
    } else {
      console.error(`Received non OK response: ${JSON.stringify(data)}`);
    }
  }

  // Save GeoJSON to file
  fs.writeFileSync('jakarta_zip_codes.geojson', JSON.stringify(geojson, null, 2));
  console.log("GeoJSON file created successfully.");
};

processZipCodes();
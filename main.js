const fs = require('fs');

// Load the GeoJSON file
const geoJsonData = JSON.parse(fs.readFileSync('./kecamatan.geojson', 'utf8'));

// Load the comprehensive JSON file
const jsonData = JSON.parse(fs.readFileSync('./postal_codes.json', 'utf8'));

// Function to normalize strings by lowercasing and removing extra spaces
const normalizeString = (str) => {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
};

// Initialize zip code mapping
const zipCodeMapping = {};

// Filter for Jakarta zip codes (province_code 31)
const jakartaData = jsonData["31"];

jakartaData.forEach(entry => {
  const zipCode = entry.postal_code;
  const kecamatan = normalizeString(entry.sub_district);

  if (zipCodeMapping[kecamatan]) {
    zipCodeMapping[kecamatan].push(zipCode);
  } else {
    zipCodeMapping[kecamatan] = [zipCode];
  }
});

// Function to create GeoJSON features for each kecamatan
const createGeoJsonFeatures = (geoJsonData, zipCodeMapping) => {
  const features = [];

  geoJsonData.features.forEach(feature => {
    const kecamatanName = normalizeString(feature.properties.name);
    const zipCodes = zipCodeMapping[kecamatanName];

    if (zipCodes) {
      const newFeature = {
        type: "Feature",
        properties: {
          zip_codes: zipCodes,
          name: feature.properties.name
        },
        geometry: feature.geometry
      };
      features.push(newFeature);
    } else {
      // Add the kecamatan even if there are no zip codes
      const newFeature = {
        type: "Feature",
        properties: {
          zip_codes: [],
          name: feature.properties.name
        },
        geometry: feature.geometry
      };
      features.push(newFeature);
    }
  });

  return {
    type: "FeatureCollection",
    features: features
  };
};

// Create GeoJSON features
const updatedGeoJsonData = createGeoJsonFeatures(geoJsonData, zipCodeMapping);

// Save the updated GeoJSON to a file
fs.writeFileSync('kecamatan_zip_codes.geojson', JSON.stringify(updatedGeoJsonData, null, 2));
console.log('Updated GeoJSON file created successfully.');
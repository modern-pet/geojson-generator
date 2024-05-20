const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

// Load the main GeoJSON file
const geoJsonData = JSON.parse(fs.readFileSync('./kecamatan_jakarta.geojson', 'utf8'));

// Load the city GeoJSON files
const southJakartaData = JSON.parse(fs.readFileSync('./south_jakarta.geojson', 'utf8'));
const northJakartaData = JSON.parse(fs.readFileSync('./north_jakarta.geojson', 'utf8'));
const centralJakartaData = JSON.parse(fs.readFileSync('./central_jakarta.geojson', 'utf8'));
const eastJakartaData = JSON.parse(fs.readFileSync('./east_jakarta.geojson', 'utf8'));
const westJakartaData = JSON.parse(fs.readFileSync('./west_jakarta.geojson', 'utf8'));

// Function to normalize strings by uppercasing and removing extra spaces
const normalizeString = (str) => {
  return str.toUpperCase().replace(/\s+/g, ' ').trim();
};

// Normalize GeoJSON features
const normalizeGeoJsonFeatures = (geoJsonData) => {
  geoJsonData.features.forEach(feature => {
    feature.properties.name = normalizeString(feature.properties.name);
  });

  return geoJsonData;
};

// Normalize the main GeoJSON data
const normalizedGeoJsonData = normalizeGeoJsonFeatures(JSON.parse(JSON.stringify(geoJsonData)));

// Add city features to the normalized GeoJSON data
const addCityFeatures = (geoJsonData, cityData, cityName) => {
  cityData.features.forEach(feature => {
    feature.properties.city = cityName;
    geoJsonData.features.push(feature);
  });
  return geoJsonData;
};

// Add all city features
let geoJsonWithCities = JSON.parse(JSON.stringify(normalizedGeoJsonData));
geoJsonWithCities = addCityFeatures(geoJsonWithCities, southJakartaData, 'SOUTH JAKARTA');
geoJsonWithCities = addCityFeatures(geoJsonWithCities, northJakartaData, 'NORTH JAKARTA');
geoJsonWithCities = addCityFeatures(geoJsonWithCities, centralJakartaData, 'CENTRAL JAKARTA');
geoJsonWithCities = addCityFeatures(geoJsonWithCities, eastJakartaData, 'EAST JAKARTA');
geoJsonWithCities = addCityFeatures(geoJsonWithCities, westJakartaData, 'WEST JAKARTA');

// Save the combined GeoJSON with city features to a new file
const geoJsonWithCitiesFilePath = path.join(__dirname, 'normalized_kecamatan_jakarta_with_cities.geojson');
fs.writeFileSync(geoJsonWithCitiesFilePath, JSON.stringify(geoJsonWithCities, null, 2));
console.log(`Normalized GeoJSON with cities file created successfully at ${geoJsonWithCitiesFilePath}`);
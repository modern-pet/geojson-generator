const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

// Load the main GeoJSON file
const geoJsonData = JSON.parse(fs.readFileSync('./input/geojson/kecamatan_jakarta.geojson', 'utf8'));

// Load the comprehensive JSON file
const jsonData = JSON.parse(fs.readFileSync('./input/postal_codes_jakarta.json', 'utf8'));

// Load the city GeoJSON files
const centralJakartaData = JSON.parse(fs.readFileSync('./input/geojson/central_jakarta.geojson', 'utf8'));
const eastJakartaData = JSON.parse(fs.readFileSync('./input/geojson/east_jakarta.geojson', 'utf8'));
const northJakartaData = JSON.parse(fs.readFileSync('./input/geojson/north_jakarta.geojson', 'utf8'));
const southJakartaData = JSON.parse(fs.readFileSync('./input/geojson/south_jakarta.geojson', 'utf8'));
const westJakartaData = JSON.parse(fs.readFileSync('./input/geojson/west_jakarta.geojson', 'utf8'));

// Function to normalize strings by uppercasing and removing extra spaces
const normalizeString = (str) => {
  return str.toUpperCase().replace(/\s+/g, ' ').trim();
};

// Initialize zip code mapping
const zipCodeMapping = {};

// Filter for Jakarta zip codes (province_code 31)
const jakartaData = jsonData["31"];

jakartaData.forEach(entry => {
  const zipCode = entry.postal_code;
  const kecamatan = normalizeString(entry.sub_district);

  if (zipCodeMapping[kecamatan]) {
    if (!zipCodeMapping[kecamatan].includes(zipCode)) {
      zipCodeMapping[kecamatan].push(zipCode);
    }
  } else {
    zipCodeMapping[kecamatan] = [zipCode];
  }
});

// Generate the CSV data
const csvData = [];

Object.keys(zipCodeMapping).forEach(kecamatan => {
  zipCodeMapping[kecamatan].forEach(zipCode => {
    csvData.push({ zip_code: zipCode, kecamatan: kecamatan });
  });
});

// Write the CSV file
const csvFilePath = path.join(outputDir, 'zip_to_kecamatan_mapping.csv');
const csvFields = ['zip_code', 'kecamatan'];
const csvOptions = { fields: csvFields };

try {
  const csv = parse(csvData, csvOptions);
  fs.writeFileSync(csvFilePath, csv);
  console.log(`CSV file created successfully at ${csvFilePath}`);
} catch (err) {
  console.error('Error creating CSV file:', err);
}

// Function to normalize GeoJSON features
const normalizeGeoJsonFeatures = (geoJsonData) => {
  geoJsonData.features.forEach(feature => {
    feature.properties.name = normalizeString(feature.properties.name);
  });

  return geoJsonData;
};

// Normalize GeoJSON features and save to file
const normalizedGeoJsonData = normalizeGeoJsonFeatures(JSON.parse(JSON.stringify(geoJsonData)));
const normalizedGeoJsonFilePath = path.join(outputDir, 'normalized_kecamatan_jakarta.geojson');
fs.writeFileSync(normalizedGeoJsonFilePath, JSON.stringify(normalizedGeoJsonData, null, 2));
console.log(`Normalized GeoJSON file created successfully at ${normalizedGeoJsonFilePath}`);

// Function to combine GeoJSON features
const combineGeoJsonFeatures = (geoJsonFiles) => {
  const combinedGeoJson = {
    type: "FeatureCollection",
    features: []
  };

  geoJsonFiles.forEach(file => {
    combinedGeoJson.features = combinedGeoJson.features.concat(file.features);
  });

  return combinedGeoJson;
};

// Combine the city GeoJSON files
const combinedGeoJsonData = combineGeoJsonFeatures([
  centralJakartaData,
  eastJakartaData,
  northJakartaData,
  southJakartaData,
  westJakartaData
]);

// Save the combined GeoJSON to a file
const combinedGeoJsonFilePath = path.join(outputDir, 'combined_jakarta_cities.geojson');
fs.writeFileSync(combinedGeoJsonFilePath, JSON.stringify(combinedGeoJsonData, null, 2));
console.log(`Combined GeoJSON file created successfully at ${combinedGeoJsonFilePath}`);
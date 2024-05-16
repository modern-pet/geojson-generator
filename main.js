const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

// Load the GeoJSON file
const geoJsonData = JSON.parse(fs.readFileSync('./kecamatan_jakarta.geojson', 'utf8'));

// Load the comprehensive JSON file
const jsonData = JSON.parse(fs.readFileSync('./postal_codes_jakarta.json', 'utf8'));

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
    zipCodeMapping[kecamatan].push(zipCode);
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
const csvFilePath = path.join(__dirname, 'zip_to_kecamatan_mapping.csv');
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

// Normalize GeoJSON features
const updatedGeoJsonData = normalizeGeoJsonFeatures(geoJsonData);

// Save the normalized GeoJSON to a file
const geoJsonFilePath = path.join(__dirname, 'normalized_kecamatan_jakarta.geojson');
fs.writeFileSync(geoJsonFilePath, JSON.stringify(updatedGeoJsonData, null, 2));
console.log(`Normalized GeoJSON file created successfully at ${geoJsonFilePath}`);
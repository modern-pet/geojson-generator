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
const normalizedGeoJsonData = normalizeGeoJsonFeatures(JSON.parse(JSON.stringify(geoJsonData)));

// Save the normalized GeoJSON without points to a file
const normalizedGeoJsonFilePath = path.join(__dirname, 'normalized_kecamatan_jakarta.geojson');
fs.writeFileSync(normalizedGeoJsonFilePath, JSON.stringify(normalizedGeoJsonData, null, 2));
console.log(`Normalized GeoJSON file created successfully at ${normalizedGeoJsonFilePath}`);

// Add clinic locations as points
const clinicLocations = [
  {
    type: "Feature",
    properties: {
      name: "modernvet - PIK",
      description: "modernvet - PIK"
    },
    geometry: {
      type: "Point",
      coordinates: [-6.1121723405128705, 106.7378894251013] // Replace with the actual coordinates of Clinic 1
    }
  },
  {
    type: "Feature",
    properties: {
      name: "modernvet - Kuningan",
      description: "modernvet - Kuningan"
    },
    geometry: {
      type: "Point",
      coordinates: [-6.208584109734385, 106.83647792325063] // Replace with the actual coordinates of Clinic 2
    }
  }
];

// Append clinic locations to the features
const geoJsonWithPointsData = JSON.parse(JSON.stringify(normalizedGeoJsonData));
geoJsonWithPointsData.features.push(...clinicLocations);

// Save the normalized GeoJSON with points to a file
const geoJsonWithPointsFilePath = path.join(__dirname, 'normalized_kecamatan_jakarta_with_points.geojson');
fs.writeFileSync(geoJsonWithPointsFilePath, JSON.stringify(geoJsonWithPointsData, null, 2));
console.log(`Normalized GeoJSON with points file created successfully at ${geoJsonWithPointsFilePath}`);
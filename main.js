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

// Clinic locations
const clinicLocations = [
  {
    kecamatan: "PENJARINGAN",
    coordinates: [-6.1121723405128705, 106.7378894251013], // Replace with the actual coordinates of Clinic 1
    name: "modernvet - PIK",
    description: "modernvet - PIK"
  },
  {
    kecamatan: "SETIABUDI",
    coordinates: [-6.208584109734385, 106.83647792325063], // Replace with the actual coordinates of Clinic 2
    name: "modernvet - Kuningan",
    description: "modernvet - Kuningan"
  }
];

// Function to normalize GeoJSON features and add clinic locations
const normalizeGeoJsonFeatures = (geoJsonData, clinicLocations) => {
  geoJsonData.features.forEach(feature => {
    feature.properties.name = normalizeString(feature.properties.name);

    // Add clinic points to the GeometryCollection of respective kecamatan
    const matchingClinic = clinicLocations.find(clinic => clinic.kecamatan === feature.properties.name);
    if (matchingClinic) {
      feature.geometry = {
        type: "GeometryCollection",
        geometries: [
          feature.geometry,
          {
            type: "Point",
            coordinates: matchingClinic.coordinates,
            properties: {
              name: matchingClinic.name,
              description: matchingClinic.description
            }
          }
        ]
      };
    }
  });

  return geoJsonData;
};

// Normalize GeoJSON features and add clinic points
const updatedGeoJsonDataWithPoints = normalizeGeoJsonFeatures(JSON.parse(JSON.stringify(geoJsonData)), clinicLocations);

// Save the normalized GeoJSON with points to a file
const geoJsonWithPointsFilePath = path.join(__dirname, 'normalized_kecamatan_jakarta_with_points.geojson');
fs.writeFileSync(geoJsonWithPointsFilePath, JSON.stringify(updatedGeoJsonDataWithPoints, null, 2));
console.log(`Normalized GeoJSON with points file created successfully at ${geoJsonWithPointsFilePath}`);
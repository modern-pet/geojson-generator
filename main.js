const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

// Load the main GeoJSON file
const geoJsonData = JSON.parse(fs.readFileSync('./kecamatan_jakarta.geojson', 'utf8'));

// Load the comprehensive JSON file
const jsonData = JSON.parse(fs.readFileSync('./postal_codes_jakarta.json', 'utf8'));

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

// Normalize GeoJSON features and save to file
const normalizedGeoJsonData = normalizeGeoJsonFeatures(JSON.parse(JSON.stringify(geoJsonData)));
const normalizedGeoJsonFilePath = path.join(__dirname, 'normalized_kecamatan_jakarta.geojson');
fs.writeFileSync(normalizedGeoJsonFilePath, JSON.stringify(normalizedGeoJsonData, null, 2));
console.log(`Normalized GeoJSON file created successfully at ${normalizedGeoJsonFilePath}`);

// Clinic locations
const clinicLocations = [
  {
    kecamatan: "PENJARINGAN",
    coordinates: [-6.1121723405128705, 106.7378894251013],
    name: "modernvet - PIK",
    description: "modernvet - PIK"
  },
  {
    kecamatan: "SETIABUDI",
    coordinates: [-6.208584109734385, 106.83647792325063],
    name: "modernvet - Kuningan",
    description: "modernvet - Kuningan"
  }
];

// Function to normalize GeoJSON features and add clinic locations
const addClinicLocations = (geoJsonData, clinicLocations) => {
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
const updatedGeoJsonDataWithPoints = addClinicLocations(JSON.parse(JSON.stringify(normalizedGeoJsonData)), clinicLocations);
const geoJsonWithPointsFilePath = path.join(__dirname, 'normalized_kecamatan_jakarta_with_points.geojson');
fs.writeFileSync(geoJsonWithPointsFilePath, JSON.stringify(updatedGeoJsonDataWithPoints, null, 2));
console.log(`Normalized GeoJSON with points file created successfully at ${geoJsonWithPointsFilePath}`);

// Add city features to the normalized GeoJSON data with transparency properties
const addCityFeatures = (geoJsonData, cityData, cityName, fillColor) => {
  cityData.features.forEach(feature => {
    feature.properties.city = cityName;
    feature.properties.style = {
      fillColor: fillColor,
      fillOpacity: 0.3, // Transparency value
      stroke: true,
      color: fillColor,
      weight: 2
    };
    geoJsonData.features.push(feature);
  });
  return geoJsonData;
};

// Add all city features with different colors for distinction
let geoJsonWithCities = JSON.parse(JSON.stringify(normalizedGeoJsonData));
geoJsonWithCities = addCityFeatures(geoJsonWithCities, southJakartaData, 'SOUTH JAKARTA', '#FF0000'); // Red
geoJsonWithCities = addCityFeatures(geoJsonWithCities, northJakartaData, 'NORTH JAKARTA', '#00FF00'); // Green
geoJsonWithCities = addCityFeatures(geoJsonWithCities, centralJakartaData, 'CENTRAL JAKARTA', '#0000FF'); // Blue
geoJsonWithCities = addCityFeatures(geoJsonWithCities, eastJakartaData, 'EAST JAKARTA', '#FFFF00'); // Yellow
geoJsonWithCities = addCityFeatures(geoJsonWithCities, westJakartaData, 'WEST JAKARTA', '#FF00FF'); // Magenta

// Save the combined GeoJSON with city features to a new file
const geoJsonWithCitiesFilePath = path.join(__dirname, 'normalized_kecamatan_jakarta_with_cities.geojson');
fs.writeFileSync(geoJsonWithCitiesFilePath, JSON.stringify(geoJsonWithCities, null, 2));
console.log(`Normalized GeoJSON with cities file created successfully at ${geoJsonWithCitiesFilePath}`);
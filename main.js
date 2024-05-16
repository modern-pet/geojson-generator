const fs = require('fs');

// Load the GeoJSON file
const geoJsonData = JSON.parse(fs.readFileSync('./kecamatan.geojson', 'utf8'));

// Mapping of kecamatan to zip codes
const zipCodeMapping = {
  "gambir": ["10110", "10120", "10130", "10140", "10150"],
  "tanah abang": ["10210", "10220", "10230", "10240", "10250"],
  "menteng": ["10310", "10320", "10330", "10340", "10350"],
  "senen": ["10410", "10420", "10430", "10440", "10450"],
  "cempaka putih": ["10510", "10520", "10530", "10540", "10550"],
  "kemayoran": ["10610", "10620", "10630", "10640", "10650"],
  "sawah besar": ["10710", "10720", "10730", "10740", "10750"],
  "johar baru": ["10560", "10570", "10580", "10590"],
  "kebon jeruk": ["11510", "11520", "11530", "11540", "11550"],
  "palmerah": ["11410", "11420", "11430", "11440", "11450"],
  "kembangan": ["11610", "11620", "11630", "11640", "11650"],
  "grogol petamburan": ["11460", "11470", "11480", "11490"],
  "taman sari": ["11110", "11120", "11130", "11140", "11150"],
  "tambora": ["11210", "11220", "11230", "11240", "11250"],
  "cengkareng": ["11710", "11720", "11730", "11740", "11750"],
  "kalideres": ["11810", "11820", "11830", "11840", "11850"],
  "setiabudi": ["12910", "12920", "12930", "12940", "12950"],
  "tebet": ["12810", "12820", "12830", "12840", "12850"],
  "mampang prapatan": ["12710", "12720", "12730", "12740", "12750"],
  "pasar minggu": ["12510", "12520", "12530", "12540", "12550"],
  "kebayoran baru": ["12110", "12120", "12130", "12140", "12150"],
  "kebayoran lama": ["12210", "12220", "12230", "12240", "12250"],
  "pancoran": ["12760", "12770", "12780", "12790"],
  "jagakarsa": ["12610", "12620", "12630", "12640", "12650"],
  "matraman": ["13110", "13120", "13130", "13140", "13150"],
  "pulo gadung": ["13210", "13220", "13230", "13240", "13250"],
  "jatinegara": ["13310", "13320", "13330", "13340", "13350"],
  "kramat jati": ["13510", "13520", "13530", "13540", "13550"],
  "pasar rebo": ["13710", "13720", "13730", "13740", "13750"],
  "duren sawit": ["13410", "13420", "13430", "13440", "13450"],
  "cakung": ["13910", "13920", "13930", "13940", "13950"],
  "cipayung": ["13810", "13820", "13830", "13840", "13850"],
  "tanjung priok": ["14310", "14320", "14330", "14340", "14350"],
  "koja": ["14210", "14220", "14230", "14240", "14250"],
  "cilincing": ["14110", "14120", "14130", "14140", "14150"],
  "kelapa gading": ["14240", "14250", "14260", "14270", "14280"],
  "pademangan": ["14410", "14420", "14430", "14440", "14450"],
  "penjaringan": ["14460", "14470", "14480", "14490"]
};

// Function to create GeoJSON features for each zip code
const createGeoJsonFeatures = (geoJsonData, zipCodeMapping) => {
  const features = [];

  geoJsonData.features.forEach(feature => {
    const kecamatanName = feature.properties.name.toLowerCase();
    const zipCodes = zipCodeMapping[kecamatanName];

    if (zipCodes) {
      zipCodes.forEach(zipCode => {
        const newFeature = {
          type: "Feature",
          properties: {
            zip: zipCode,
            name: feature.properties.name
          },
          geometry: feature.geometry
        };
        features.push(newFeature);
      });
    }
  });

  return {
    type: "FeatureCollection",
    features: features
  };
};

// Create GeoJSON features for each zip code
const updatedGeoJsonData = createGeoJsonFeatures(geoJsonData, zipCodeMapping);

// Save the updated GeoJSON to a file
fs.writeFileSync('kecamatan_zip_codes.geojson', JSON.stringify(updatedGeoJsonData, null, 2));
console.log('Updated GeoJSON file created successfully.');
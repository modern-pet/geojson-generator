const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Your Google Maps API key
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// List of Jakarta zip codes
const zipCodes = ['10110', '10120', '10210']; // Add all zip codes

// List of all zipcodes

/*
10110, 10120, 10130, 10140, 10150, 10160, 10170, 10180, 10190,
  10210, 10220, 10230, 10240, 10250, 10260, 10270, 10280, 10290,
  10310, 10320, 10330, 10340, 10350, 10360, 10370, 10380, 10390,
  10410, 10420, 10430, 10440, 10450, 10460, 10470, 10480, 10490,
  10510, 10520, 10530, 10540, 10550, 10560, 10570, 10580, 10590,
  10610, 10620, 10630, 10640, 10650, 10660, 10670, 10680, 10690,
  10710, 10720, 10730, 10740, 10750, 10760, 10770, 10780, 10790,
  10810, 10820, 10830, 10840, 10850, 10860, 10870, 10880, 10890,
  10910, 10920, 10930, 10940, 10950, 10960, 10970, 10980, 10990,
  11010, 11020, 11030, 11040, 11050, 11060, 11070, 11080, 11090,
  11110, 11120, 11130, 11140, 11150, 11160, 11170, 11180, 11190,
  11210, 11220, 11230, 11240, 11250, 11260, 11270, 11280, 11290,
  11310, 11320, 11330, 11340, 11350, 11360, 11370, 11380, 11390,
  11410, 11420, 11430, 11440, 11450, 11460, 11470, 11480, 11490,
  11510, 11520, 11530, 11540, 11550, 11560, 11570, 11580, 11590,
  11610, 11620, 11630, 11640, 11650, 11660, 11670, 11680, 11690,
  11710, 11720, 11730, 11740, 11750, 11760, 11770, 11780, 11790,
  11810, 11820, 11830, 11840, 11850, 11860, 11870, 11880, 11890,
  11910, 11920, 11930, 11940, 11950, 11960, 11970, 11980, 11990,
  12010, 12020, 12030, 12040, 12050, 12060, 12070, 12080, 12090,
  12110, 12120, 12130, 12140, 12150, 12160, 12170, 12180, 12190,
  12210, 12220, 12230, 12240, 12250, 12260, 12270, 12280, 12290,
  12310, 12320, 12330, 12340, 12350, 12360, 12370, 12380, 12390,
  12410, 12420, 12430, 12440, 12450, 12460, 12470, 12480, 12490,
  12510, 12520, 12530, 12540, 12550, 12560, 12570, 12580, 12590,
  12610, 12620, 12630, 12640, 12650, 12660, 12670, 12680, 12690,
  12710, 12720, 12730, 12740, 12750, 12760, 12770, 12780, 12790,
  12810, 12820, 12830, 12840, 12850, 12860, 12870, 12880, 12890,
  12910, 12920, 12930, 12940, 12950, 12960, 12970, 12980, 12990,
  13010, 13020, 13030, 13040, 13050, 13060, 13070, 13080, 13090,
  13110, 13120, 13130, 13140, 13150, 13160, 13170, 13180, 13190,
  13210, 13220, 13230, 13240, 13250, 13260, 13270, 13280, 13290,
  13310, 13320, 13330, 13340, 13350, 13360, 13370, 13380, 13390,
  13410, 13420, 13430, 13440, 13450, 13460, 13470, 13480, 13490,
  13510, 13520, 13530, 13540, 13550, 13560, 13570, 13580, 13590,
  13610, 13620, 13630, 13640, 13650, 13660, 13670, 13680, 13690,
  13710, 13720, 13730, 13740, 13750, 13760, 13770, 13780, 13790,
  13810, 13820, 13830, 13840, 13850, 13860, 13870, 13880, 13890,
  13910, 13920, 13930, 13940, 13950, 13960, 13970, 13980, 13990,
  14010, 14020, 14030, 14040, 14050, 14060, 14070, 14080, 14090,
  14110, 14120, 14130, 14140, 14150, 14160, 14170, 14180, 14190,
  14210, 14220, 14230, 14240, 14250, 14260, 14270, 14280, 14290,
  14310, 14320, 14330, 14340, 14350, 14360, 14370, 14380, 14390,
  14410, 14420, 14430, 14440, 14450, 14460, 14470, 14480, 14490,
  14510, 14520, 14530, 14540, 14550, 14560, 14570, 14580, 14590
*/

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
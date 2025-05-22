import {
  CUISINE_OPTIONS,
  CUISINE_MAPPING,
  DEFAULT_RESTAURANT_PHOTOS,
} from "../lib/constants.js";

// Helper function to get a random photo
function getRandomPhoto() {
  return DEFAULT_RESTAURANT_PHOTOS[
    Math.floor(Math.random() * DEFAULT_RESTAURANT_PHOTOS.length)
  ];
}

// Helper function to calculate distance between two coordinates
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Format distance for display
function formatDistance(distanceInKm) {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)} m`;
  }
  return `${distanceInKm.toFixed(1)} km`;
}

// Get random cuisines for surprise me feature
function getRandomCuisines(count = 5) {
  // Create a copy of the cuisine options excluding "surprise"
  const availableCuisines = CUISINE_OPTIONS.filter(
    (cuisine) => cuisine.id !== "surprise"
  ).map((cuisine) => cuisine.id);

  // Shuffle the array using Fisher-Yates algorithm
  for (let i = availableCuisines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableCuisines[i], availableCuisines[j]] = [
      availableCuisines[j],
      availableCuisines[i],
    ];
  }

  // Return the first 'count' cuisines
  return availableCuisines.slice(0, count);
}

// Get photo URL for restaurant
function getPhotoUrl(place, apiKey) {
  if (place.photos && place.photos.length > 0) {
    const photoRef = place.photos[0].name;
    if (photoRef) {
      return `https://places.googleapis.com/v1/${photoRef}/media?key=${apiKey}&maxHeightPx=800&maxWidthPx=800`;
    }
  }
  // Return a random fallback photo
  return getRandomPhoto();
}

// Map Google Place to our Restaurant format
function mapGooglePlaceToRestaurant(
  place,
  userLat,
  userLng,
  selectedCuisine,
  apiKey
) {
  const placeLat = place.location.latitude;
  const placeLng = place.location.longitude;
  const distanceInKm = getDistanceFromLatLonInKm(
    userLat,
    userLng,
    placeLat,
    placeLng
  );

  const cuisines = ["Restaurant"];

  // Add the user-selected cuisine if it's not already included
  if (selectedCuisine) {
    const cuisineOption = CUISINE_OPTIONS.find(
      (option) => option.id === selectedCuisine
    );
    if (cuisineOption && !cuisines.includes(cuisineOption.name)) {
      cuisines.push(cuisineOption.name);
    }
  }

  // Convert price level string to number
  let priceLevel = 1;
  if (place.priceLevel) {
    switch (place.priceLevel) {
      case "PRICE_LEVEL_INEXPENSIVE":
        priceLevel = 1;
        break;
      case "PRICE_LEVEL_MODERATE":
        priceLevel = 2;
        break;
      case "PRICE_LEVEL_EXPENSIVE":
        priceLevel = 3;
        break;
      case "PRICE_LEVEL_VERY_EXPENSIVE":
        priceLevel = 4;
        break;
    }
  }

  return {
    id: place.id,
    name: place.displayName?.text,
    rating: place.rating,
    priceLevel: priceLevel,
    address: place.formattedAddress || "No address available",
    distance: formatDistance(distanceInKm),
    photo: getPhotoUrl(place, apiKey),
    isOpen: place.currentOpeningHours?.openNow ?? true,
    cuisines: cuisines,
    lat: placeLat,
    lng: placeLng,
    dineIn: place.dineIn | false,
    delivery: place.delivery | false,
  };
}

// Filter duplicate restaurant branches and keep only the closest one
function filterDuplicateRestaurants(restaurants) {
  // Group restaurants by their base name (ignoring branch locations)
  const groupedByBaseName = restaurants.reduce((acc, restaurant) => {
    // Extract the base name of the restaurant (e.g., "Pak Darbar Restaurant" from "Pak Darbar Restaurant Marina")
    const fullName = restaurant.name.trim();
    let baseName = fullName.toLowerCase();

    // Common location indicators that might appear at the end of restaurant names
    const locationKeywords = [
      "branch",
      "marina",
      "mall",
      "al ",
      "ibn ",
      "dubai",
      "sharjah",
      "abu dhabi",
      "jumeirah",
      "deira",
      "barsha",
      "jbr",
      "downtown",
      "business bay",
      "silicon oasis",
      "media city",
      "internet city",
      "knowledge village",
      "discovery gardens",
      "sports city",
      "motor city",
      "meadows",
      "springs",
      "arabian ranches",
      "palm jumeirah",
      "jlt",
      "jvc",
      "international city",
      "sheikh zayed road",
      "szr",
      "karama",
      "bur dubai",
      "tecom",
      "greens",
    ];

    // Check if the restaurant name contains location-specific terms
    // If so, extract the base name (chain name)
    for (const keyword of locationKeywords) {
      const keywordIndex = baseName.indexOf(` ${keyword}`);
      if (keywordIndex > 0) {
        baseName = baseName.substring(0, keywordIndex).trim();
        break;
      }
    }

    // Also handle cases where locations are mentioned with a hyphen or dash
    const dashIndex = baseName.indexOf(" - ");
    if (dashIndex > 0) {
      baseName = baseName.substring(0, dashIndex).trim();
    }

    // Special case for places ending with numbers which often indicate branches
    if (/\s\d+$/.test(baseName)) {
      baseName = baseName.replace(/\s\d+$/, "").trim();
    }

    // Create group or add to existing group
    if (!acc[baseName]) {
      acc[baseName] = [];
    }
    acc[baseName].push(restaurant);

    return acc;
  }, {});

  // For each group, keep only the branch with the shortest distance
  const filteredRestaurants = [];

  for (const baseName in groupedByBaseName) {
    const branches = groupedByBaseName[baseName];

    if (branches.length === 1) {
      // If only one branch exists, add it directly
      filteredRestaurants.push(branches[0]);
    } else {
      // If multiple branches exist, find the closest one
      const closestBranch = branches.reduce((closest, current) => {
        // Parse distance values (converting both km and m to numeric values)
        const getNumericDistance = (dist) => {
          if (dist.includes("km")) {
            return parseFloat(dist.replace(" km", ""));
          } else {
            return parseFloat(dist.replace(" m", "")) / 1000; // Convert meters to km
          }
        };

        const closestDist = getNumericDistance(closest.distance);
        const currentDist = getNumericDistance(current.distance);

        return currentDist < closestDist ? current : closest;
      }, branches[0]);

      filteredRestaurants.push(closestBranch);
    }
  }

  return filteredRestaurants;
}

// Fetch restaurants by cuisine from Google Places API
async function fetchRestaurantsByCuisine(cuisine, location, distance, apiKey) {
  const keyword = CUISINE_MAPPING[cuisine] || cuisine;
  console.log(keyword);
  console.log(location);
  console.log(distance);

  const fieldmask =
    "places.id,places.displayName,places.formattedAddress,places.rating,places.types,places.priceLevel,places.editorialSummary,places.currentOpeningHours.openNow,places.photos,places.location,places.dineIn,places.delivery";

  const body = {
    textQuery: keyword,
    maxResultCount: 20,
    locationBias: {
      circle: {
        center: {
          latitude: location.lat,
          longitude: location.lng,
        },
        radius: distance * 1000,
      },
    },
    includedType: "restaurant",
    rankPreference: "RELEVANCE",
  };

  const url = "https://places.googleapis.com/v1/places:searchText";

  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": fieldmask,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.places || data.places.length === 0) {
      console.log(`No results found for ${keyword}`);
      return [];
    }

    // Map Google Places results to our Restaurant format
    const restaurants = data.places.map((place) =>
      mapGooglePlaceToRestaurant(
        place,
        location.lat,
        location.lng,
        cuisine,
        apiKey
      )
    );

    return restaurants;
  } catch (error) {
    console.error(`Error fetching restaurants for ${cuisine}:`, error);
    return [];
  }
}

// New comprehensive restaurant fetch endpoint
export const getAllRestaurants = async (req, res) => {
  try {
    const {cuisines, location, distance = 5} = req.body;

    if (!Array.isArray(cuisines) || cuisines.length === 0) {
      return res
        .status(400)
        .json({error: "Cuisines must be a non-empty array"});
    }

    if (!location || !location.lat || !location.lng) {
      return res
        .status(400)
        .json({error: "Location with lat and lng is required"});
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const allRestaurants = [];
    const seenPlaceIds = new Set(); // To track unique restaurants

    // Handle "surprise me" option
    if (cuisines.includes("surprise")) {
      const randomCuisines = getRandomCuisines(5);
      console.log("Random cuisines for surprise me:", randomCuisines);

      // Fetch restaurants for each random cuisine
      for (const cuisine of randomCuisines) {
        const cuisineRestaurants = await fetchRestaurantsByCuisine(
          cuisine,
          location,
          distance,
          apiKey
        );

        // Add only unique restaurants to the results
        for (const restaurant of cuisineRestaurants) {
          if (!seenPlaceIds.has(restaurant.id)) {
            seenPlaceIds.add(restaurant.id);
            allRestaurants.push(restaurant);
          }
        }
      }
    } else {
      // For selected cuisines, fetch each separately and combine results
      for (const cuisine of cuisines) {
        const cuisineRestaurants = await fetchRestaurantsByCuisine(
          cuisine,
          location,
          distance,
          apiKey
        );

        // Add only unique restaurants to the combined results
        for (const restaurant of cuisineRestaurants) {
          if (!seenPlaceIds.has(restaurant.id)) {
            seenPlaceIds.add(restaurant.id);
            allRestaurants.push(restaurant);
          }
        }
      }
    }

    // Filter duplicate restaurants and keep only the closest branch
    let finalRestaurants = filterDuplicateRestaurants(allRestaurants);

    // shuffle the final restaurants
    finalRestaurants = [...finalRestaurants].sort(() => Math.random() - 0.5);

    // If surprise me, shuffle and limit to 20
    if (cuisines.includes("surprise") && finalRestaurants.length > 20) {
      finalRestaurants = [...finalRestaurants]
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);
    }

    return res.status(200).json({restaurants: finalRestaurants});
  } catch (error) {
    console.error("Error fetching all restaurants:", error);
    return res.status(500).json({error: "Failed to fetch restaurants"});
  }
};

// Original endpoints below (keep these for compatibility)
// Get restaurants based on cuisine, location, and distance
export const getPlaces = async (req, res) => {
  try {
    const {cuisine, location, distance, dineIn} = req.body;

    const apiKey = process.env.GOOGLE_API_KEY;

    const fieldmask =
      "places.displayName,places.formattedAddress,places.rating,places.types,places.priceLevel,places.editorialSummary,places.currentOpeningHours.openNow,places.photos,places.location";

    const body = {
      textQuery: cuisine,
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng,
          },
          radius: distance * 1000,
        },
      },
      includedType: "restaurant",
      rankPreference: "RELEVANCE",
    };

    const url = "https://places.googleapis.com/v1/places:searchText";

    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldmask,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({error: data.error.message});
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Places API Error:", error);
    return res
      .status(500)
      .json({error: "Failed to fetch from Google Maps API"});
  }
};

// Get place autocomplete suggestions
export const getPlaceSuggestions = async (req, res) => {
  try {
    const {search, location} = req.query;
    const apiKey = process.env.GOOGLE_API_KEY;

    let apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      search
    )}&types=geocode&key=${apiKey}`;

    // Only add location if it's provided
    if (location) {
      const [lat, lng] = location.split(",");
      apiUrl += `&location=${lat},${lng}&radius=50000`;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Autocomplete API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      return res.status(500).json({error: data.error.message});
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Autocomplete API Error:", error);
    return res
      .status(500)
      .json({error: "Failed to fetch autocomplete suggestions"});
  }
};

// Get place details by place ID
export const getPlaceDetails = async (req, res) => {
  try {
    const {placeId} = req.query;

    if (!placeId) {
      return res.status(400).json({error: "Place ID is required"});
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${apiKey}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Place details API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      return res.status(500).json({error: data.error.message});
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Place Details API Error:", error);
    return res.status(500).json({error: "Failed to fetch place details"});
  }
};

// Geocode an address to coordinates
export const geocodeAddress = async (req, res) => {
  try {
    const {address} = req.query;

    if (!address) {
      return res.status(400).json({error: "Address is required"});
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      return res.status(500).json({error: data.error.message});
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Geocoding API Error:", error);
    return res.status(500).json({error: "Failed to geocode address"});
  }
};

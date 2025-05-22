import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.post("/api/places", async (req, res) => {
  try {
    const {cuisine, location, distance, dineIn} = req.body;

    const apiKey = process.env.GOOGLE_API_KEY; // Fixed from GOOGLE_MAPS_API_KEY to match .env

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
          radius: distance * 1000, // Fixed from radius to distance
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

    console.log(response);
    if (!response.ok) {
      throw new Error("something went wrong");
    }

    const data = await response.json();
    console.log(data);
    if (data.error) {
      return res.status(500).json({error: data.error.message});
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Places Proxy Error:", error);
    return res
      .status(500)
      .json({error: "Failed to fetch from Google Maps API"});
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

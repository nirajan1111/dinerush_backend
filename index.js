import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  getPlaces,
  getPlaceSuggestions,
  getPlaceDetails,
  geocodeAddress,
  getAllRestaurants,
} from "./controllers/places.controllers.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.post("/api/places", getPlaces);
app.get("/api/search", getPlaceSuggestions);
app.get("/api/place-details", getPlaceDetails);
app.get("/api/geocode", geocodeAddress);
app.post("/api/restaurants", getAllRestaurants);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

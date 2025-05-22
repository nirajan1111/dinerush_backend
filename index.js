import express from "express";
import cors from "cors";
import {
  getPlaces,
  getPlaceSuggestions,
  getPlaceDetails,
  geocodeAddress,
  getAllRestaurants,
} from "./controllers/places.controllers.js";



const app = express();


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

export default app;
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import compression from "compression";
import dotenv from "dotenv";
dotenv.config();

import {
  getPlaces,
  getPlaceSuggestions,
  getPlaceDetails,
  geocodeAddress,
  getAllRestaurants,
} from "./controllers/places.controllers.js";

const app = express();

const allowedOrigins = ['http://localhost:8080', 'https://dinerush.food', 'http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); 
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization','Accept'],
  credentials: true,
  samesite : 'None',
};
app.use(compression());
app.use(bodyParser.json());
app.use(cors(corsOptions));


app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.post("/api/places", getPlaces);
app.get("/api/search", getPlaceSuggestions);
app.get("/api/place-details", getPlaceDetails);
app.get("/api/geocode", geocodeAddress);
app.post("/api/restaurants", getAllRestaurants);

app.options('/*path', cors(corsOptions));



export default app;
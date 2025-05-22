// Map user cuisine selections to keyword search terms for Google Places API
export const CUISINE_MAPPING = {
  pakistani: "Pakistani Restaurants",
  arabic: "Arabic Restaurants",
  indian: "Indian Restaurants",
  italian: "Italian Restaurants",
  chinese: "Chinese Restaurants",
  japanese: "Japanese Restaurants",
  mexican: "Mexican Restaurants",
  thai: "Thai Restaurants",
  american: "American Restaurants",
  mediterranean: "Mediterranean Restaurants",
  IceCreamDesserts: "Dessert",
  surprise: "", // Will be handled separately
};

// All available cuisine options matching the UI
export const CUISINE_OPTIONS = [
  {id: "pakistani", name: "Pakistani", emoji: "🍽️"},
  {id: "arabic", name: "Arabic", emoji: "🥙"},
  {id: "indian", name: "Indian", emoji: "🍛"},
  {id: "italian", name: "Italian", emoji: "🍝"},
  {id: "chinese", name: "Chinese", emoji: "🥡"},
  {id: "japanese", name: "Japanese", emoji: "🍣"},
  {id: "mexican", name: "Mexican", emoji: "🌮"},
  {id: "thai", name: "Thai", emoji: "🍲"},
  {id: "american", name: "American", emoji: "🍔"},
  {id: "mediterranean", name: "Mediterranean", emoji: "🥗"},
  {id: "IceCreamDesserts", name: "Ice Cream & Desserts", emoji: "🍨"},
];

// Default restaurant photos if Google doesn't provide any
export const DEFAULT_RESTAURANT_PHOTOS = [
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&w=800&q=80",
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.0.3&w=800&q=80",
  "https://images.unsplash.com/photo-1579684947550-22e945225d9a?ixlib=rb-4.0.3&w=800&q=80",
  "https://images.unsplash.com/photo-1569058242567-93de6f36f8e1?ixlib=rb-4.0.3&w=800&q=80",
  "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&w=800&q=80",
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&w=800&q=80",
  "https://images.unsplash.com/photo-1559314809-0d155014e29e?ixlib=rb-4.0.3&w=800&q=80",
  "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&w=800&q=80",
  "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&w=800&q=80",
];

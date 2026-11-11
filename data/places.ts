export type Place = {
  name: string;
  lat: number;
  lng: number;
  aliases?: string[];
};

export const placeLabel = (p: Place) =>
  p.name === "Bengaluru" ? "Bengaluru" : `${p.name}, Bengaluru`;

export const PLACES: Place[] = [
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946, aliases: ["Bangalore", "Banglore", "Bengalooru", "Bangalor", "Bengaluru city"] },
  { name: "Indiranagar", lat: 12.9784, lng: 77.6408, aliases: ["Indira Nagar"] },
  { name: "Koramangala", lat: 12.9352, lng: 77.6245 },
  { name: "HSR Layout", lat: 12.9116, lng: 77.6474, aliases: ["HSR"] },
  { name: "MG Road", lat: 12.9756, lng: 77.6068, aliases: ["Church Street", "Brigade Road"] },
  { name: "Jayanagar", lat: 12.925, lng: 77.5938 },
  { name: "JP Nagar", lat: 12.9063, lng: 77.5857 },
  { name: "BTM Layout", lat: 12.9166, lng: 77.6101, aliases: ["BTM"] },
  { name: "Whitefield", lat: 12.9698, lng: 77.75 },
  { name: "Marathahalli", lat: 12.9569, lng: 77.7011 },
  { name: "Bellandur", lat: 12.9304, lng: 77.6784 },
  { name: "Sarjapur Road", lat: 12.91, lng: 77.687 },
  { name: "Electronic City", lat: 12.8452, lng: 77.6602 },
  { name: "Malleshwaram", lat: 13.0035, lng: 77.571 },
  { name: "Sadashivanagar", lat: 13.0068, lng: 77.5813 },
  { name: "Basavanagudi", lat: 12.9422, lng: 77.575 },
  { name: "Banashankari", lat: 12.9255, lng: 77.5468 },
  { name: "Rajajinagar", lat: 12.9916, lng: 77.552 },
  { name: "Cunningham Road", lat: 12.9899, lng: 77.5953 },
  { name: "Richmond Road", lat: 12.966, lng: 77.6 },
  { name: "Lavelle Road", lat: 12.971, lng: 77.599 },
  { name: "Frazer Town", lat: 12.9985, lng: 77.613 },
  { name: "Shivajinagar", lat: 12.9857, lng: 77.6057 },
  { name: "Ulsoor", lat: 12.981, lng: 77.62, aliases: ["Halasuru"] },
  { name: "Domlur", lat: 12.961, lng: 77.6387 },
  { name: "CV Raman Nagar", lat: 12.9857, lng: 77.6636 },
  { name: "Kalyan Nagar", lat: 13.028, lng: 77.64 },
  { name: "Banaswadi", lat: 13.014, lng: 77.65 },
  { name: "RT Nagar", lat: 13.021, lng: 77.595 },
  { name: "Hebbal", lat: 13.0358, lng: 77.597 },
  { name: "Yelahanka", lat: 13.1007, lng: 77.5963 },
  { name: "Bannerghatta Road", lat: 12.89, lng: 77.599 },
];
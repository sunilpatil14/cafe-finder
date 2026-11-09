import snapshot from "@/data/cafes-bengaluru.json";

export type Cafe = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  address: string;
  openingHours?: string;
  phone?: string;
  website?: string;
  wifi: boolean;
  outdoorSeating: boolean;
};


const UA = "cafe-finder-hobby/0.1 (personal learning project)";

type SnapshotCafe = Omit<Cafe, "distanceKm">;
const SNAP = snapshot as unknown as SnapshotCafe[];
const BOX = { south: 12.83, west: 77.45, north: 13.14, east: 77.8 };

function inBengaluru(lat: number, lng: number) {
  return lat >= BOX.south && lat <= BOX.north && lng >= BOX.west && lng <= BOX.east;
}

export async function geocodeCity(q: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });
    if (!res.ok) throw new Error(`Nominatim error ${res.status}`);
  const data = await res.json();
  if (!data.length) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    label: data[0].display_name as string,
  };
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function findCafes(
  
  lat: number,
  lng: number,
  radiusM = 4000
  
): Promise<Cafe[]> {

    if (SNAP.length > 0 && inBengaluru(lat, lng)) {
    return SNAP.map((c) => ({
      ...c,
      distanceKm: distanceKm(lat, lng, c.lat, c.lng),
    }))
      .filter((c) => c.distanceKm <= radiusM / 1000)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 60);
  }

  const query = `[out:json][timeout:25];(node["amenity"="cafe"](around:${radiusM},${lat},${lng});way["amenity"="cafe"](around:${radiusM},${lat},${lng}););out center tags;`;
  const res = await fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
    { headers: { "User-Agent": UA }, next: { revalidate: 60 * 60 * 24 } }
  );
  if (!res.ok) throw new Error(`Overpass error ${res.status}`);
  const json = await res.json();

    // Overpass sometimes replies "200 OK" with no data when it is overloaded
  if (!json.elements?.length && json.remark) {
    throw new Error(`Overpass: ${json.remark}`);
  }

    // a big city returning zero cafes means the server failed, not that there are none
  if (!json.elements?.length && inBengaluru(lat, lng)) {
    throw new Error("Overpass returned no data");
  }

  const cafes: Cafe[] = [];
  for (const el of json.elements ?? []) {
    const t = el.tags ?? {};
    if (!t.name) continue;
    const cLat = el.lat ?? el.center?.lat;
    const cLng = el.lon ?? el.center?.lon;
    if (cLat == null || cLng == null) continue;

    const address = [
      [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "),
      t["addr:suburb"],
      t["addr:city"],
    ]
      .filter(Boolean)
      .join(", ");

    cafes.push({
      id: `${el.type}-${el.id}`,
      name: t.name,
      lat: cLat,
      lng: cLng,
      distanceKm: distanceKm(lat, lng, cLat, cLng),
      address,
      openingHours: t.opening_hours,
      phone: t.phone ?? t["contact:phone"],
      website: t.website ?? t["contact:website"],
      wifi: t.internet_access === "wlan" || t.internet_access === "yes",
      outdoorSeating: t.outdoor_seating === "yes",
    });
  }

  return cafes.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 60);
}

export async function getCafeById(id: string): Promise<Cafe | null> {
  const hit = SNAP.find((c) => c.id === id);
  if (hit) return { ...hit, distanceKm: 0 };
  const m = /^(node|way)-(\d+)$/.exec(id);
  if (!m) return null;
  const [, type, num] = m;

  const query = `[out:json][timeout:25];${type}(${num});out center tags;`;
  const res = await fetch(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
    { headers: { "User-Agent": UA }, next: { revalidate: 60 * 60 * 24 } }
  );
  if (!res.ok) throw new Error(`Overpass error ${res.status}`);
  const json = await res.json();

  const el = json.elements?.[0];
  if (!el) return null;
  const t = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!t.name || lat == null || lng == null) return null;

  const address = [
    [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "),
    t["addr:suburb"],
    t["addr:city"],
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id,
    name: t.name,
    lat,
    lng,
    distanceKm: 0,
    address,
    openingHours: t.opening_hours,
    phone: t.phone ?? t["contact:phone"],
    website: t.website ?? t["contact:website"],
    wifi: t.internet_access === "wlan" || t.internet_access === "yes",
    outdoorSeating: t.outdoor_seating === "yes",
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat=${lat}&lon=${lng}`,
      { headers: { "User-Agent": UA }, next: { revalidate: 60 * 60 * 24 * 30 } }
    );
    if (!res.ok) return "";
    const d = await res.json();
    const a = d.address ?? {};
    const parts = [
      a.house_number,
      a.road,
      a.neighbourhood ?? a.suburb,
      a.city ?? a.town ?? a.village,
      a.postcode,
    ].filter(Boolean);
    return parts.length ? parts.join(", ") : d.display_name ?? "";
  } catch {
    return "";
  }
}
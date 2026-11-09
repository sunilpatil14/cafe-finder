import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const S = 12.83, W = 77.45, N = 13.14, E = 77.8; // Bengaluru
const ROWS = 4, COLS = 4;
const FILE = "data/cafes-bengaluru.json";

const SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchTile(bbox) {
  const query = `[out:json][timeout:60];nwr["amenity"="cafe"]["name"](${bbox});out center tags;`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const server of SERVERS) {
      try {
        const res = await fetch(server, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "cafe-finder-hobby/0.1 (personal learning project)",
          },
          body: "data=" + encodeURIComponent(query),
          signal: AbortSignal.timeout(70000),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (json.remark && !json.elements?.length) throw new Error(json.remark);
        return json.elements ?? [];
      } catch (e) {
        console.log(`   ${server.split("/")[2]} failed: ${e.message}`);
      }
    }
    console.log(`   waiting before retry ${attempt}/3...`);
    await sleep(8000 * attempt);
  }
  return null;
}

mkdirSync("data", { recursive: true });

// start from whatever was saved before
const byId = new Map();
if (existsSync(FILE)) {
  try {
    for (const c of JSON.parse(readFileSync(FILE, "utf8"))) byId.set(c.id, c);
  } catch {}
}
console.log(`Starting with ${byId.size} saved cafes`);

const dLat = (N - S) / ROWS;
const dLng = (E - W) / COLS;
let failed = 0;

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const s = (S + r * dLat).toFixed(4);
    const n = (S + (r + 1) * dLat).toFixed(4);
    const w = (W + c * dLng).toFixed(4);
    const e = (W + (c + 1) * dLng).toFixed(4);
    const n_ = r * COLS + c + 1;
    console.log(`Tile ${n_}/${ROWS * COLS}`);

    const elements = await fetchTile(`${s},${w},${n},${e}`);
    if (!elements) {
      failed++;
      console.log("   gave up on this tile");
      continue;
    }

    for (const el of elements) {
      const t = el.tags ?? {};
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (!t.name || lat == null || lng == null) continue;
      const address = [
        [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "),
        t["addr:suburb"],
        t["addr:city"],
      ]
        .filter(Boolean)
        .join(", ");
      byId.set(`${el.type}-${el.id}`, {
        id: `${el.type}-${el.id}`,
        name: t.name,
        lat,
        lng,
        address,
        openingHours: t.opening_hours,
        phone: t.phone ?? t["contact:phone"],
        website: t.website ?? t["contact:website"],
        wifi: t.internet_access === "wlan" || t.internet_access === "yes",
        outdoorSeating: t.outdoor_seating === "yes",
      });
    }

    // save after every tile so progress is never lost
    writeFileSync(FILE, JSON.stringify([...byId.values()]));
    console.log(`   saved, total ${byId.size}`);
    await sleep(3000);
  }
}

console.log(
  failed
    ? `Done with ${byId.size} cafes, but ${failed} tile(s) failed. Run the script again to fill the gaps.`
    : `Done! ${byId.size} cafes saved.`
);
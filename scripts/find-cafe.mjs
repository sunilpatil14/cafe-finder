import { readFileSync } from "node:fs";

const q = (process.argv[2] ?? "").toLowerCase();
const cafes = JSON.parse(readFileSync("data/cafes-bengaluru.json", "utf8"));

for (const c of cafes.filter((c) => c.name.toLowerCase().includes(q))) {
  console.log(c.id, "|", c.name, "|", c.address || "(no address)");
}
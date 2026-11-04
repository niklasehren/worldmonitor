// gkg (unübersetzt) für die Zeitpunkte der Kandidaten-Geschichten laden. Obergrenze dieser Etappe: 300 MB. Nur data.gdeltproject.org, mind. 5 s Pause.
import { get, log, totalBytes, stats, DATA } from "./lib.mjs";
import { gdeltUrl } from "./load.mjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
const c = JSON.parse(readFileSync(join(DATA, "story-candidates.json"), "utf8"));
const slots = [...new Set(c.cands.map((x) => x.repSlot))].sort();
const start = totalBytes(); let skipped = 0;
for (const ts of slots) {
  if (totalBytes() - start >= 300_000_000) { log("STOPP: 300-MB-Grenze dieser Etappe erreicht"); skipped++; continue; }
  const r = await get(gdeltUrl(ts, "gkg", "csv"));
  log(`${ts} gkg: ${r.ok === false ? "FEHLER " + r.error : (r.bytes / 1e6).toFixed(2) + " MB" + (r.fromCache ? " (Cache)" : "")}`);
}
console.log("Etappe MB:", ((totalBytes() - start) / 1e6).toFixed(1), "Zeitpunkte:", slots.length, "ausgelassen:", skipped, stats());

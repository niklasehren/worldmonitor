// Zufällige Zeitpunkte (feste Zufallszahl) für unverzerrte Stichproben: gkg (unübersetzt). Obergrenze dieser Etappe: 250 MB.
import { get, log, totalBytes, stats, cached, DATA } from "./lib.mjs";
import { gdeltUrl, stamps, sample } from "./load.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const N = 36;
const fresh = stamps.filter((ts) => !cached(gdeltUrl(ts, "gkg", "csv")));
const chosen = sample(fresh, N, 20261101).sort();
writeFileSync(join(DATA, "random-slots.json"), JSON.stringify(chosen));
const start = totalBytes(); let skipped = 0;
for (const ts of chosen) {
  if (totalBytes() - start >= 250_000_000) { log("STOPP: 250-MB-Grenze dieser Etappe erreicht"); skipped++; continue; }
  const r = await get(gdeltUrl(ts, "gkg", "csv"));
  log(`${ts} gkg (Zufall): ${r.ok === false ? "FEHLER " + r.error : (r.bytes / 1e6).toFixed(2) + " MB" + (r.fromCache ? " (Cache)" : "")}`);
}
console.log("Etappe MB:", ((totalBytes() - start) / 1e6).toFixed(1), "Zeitpunkte:", chosen.length, "ausgelassen:", skipped, stats());

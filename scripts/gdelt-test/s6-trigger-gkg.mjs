// Etappe 6: gkg (nur unübersetzt, dort stehen laut Messung alle Ereignis-Artikel) für die Zeitpunkte der 20 Stichproben-Auslöser. Obergrenze: 300 MB.
import { get, log, totalBytes, stats } from "./lib.mjs";
import { gdeltUrl } from "./load.mjs";
import { readFileSync } from "node:fs";
import { DATA } from "./lib.mjs";
import { join } from "node:path";
const s = JSON.parse(readFileSync(join(DATA, "trigger-sample20.json"), "utf8"));
const slots = [...new Set(s.map((x) => x.slot))].sort();
const start = totalBytes();
for (const ts of slots) {
  if (totalBytes() - start >= 300_000_000) { log("STOPP: 300-MB-Grenze dieser Etappe erreicht"); break; }
  const r = await get(gdeltUrl(ts, "gkg", "csv"));
  log(`${ts} gkg: ${r.ok === false ? "FEHLER " + r.error : (r.bytes / 1e6).toFixed(2) + " MB" + (r.fromCache ? " (Cache)" : "")}`);
}
console.log("Etappe MB:", ((totalBytes() - start) / 1e6).toFixed(1), stats());

// Etappe 5: 15-Minuten-Dateien (export + mentions) der letzten 3 Tage ab Zeitanker. Fortsetzbar (Cache).
import { get, stats, log, DATA, totalBytes } from "./lib.mjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const { lastExport } = JSON.parse(readFileSync(join(DATA, "anchor.json"), "utf8"));
const toDate = (t) => new Date(Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8), +t.slice(8, 10), +t.slice(10, 12), +t.slice(12, 14)));
const fmt = (d) => d.toISOString().replace(/[-:T]/g, "").slice(0, 14);
const end = toDate(lastExport);
const STEPS = 288; // 3 Tage x 96
const stamps = Array.from({ length: STEPS }, (_, i) => fmt(new Date(end.getTime() - (STEPS - 1 - i) * 15 * 60000)));

let fails = 0, missing = 0, done = 0;
for (const ts of stamps) {
  for (const kind of ["export", "mentions"]) {
    const r = await get(`http://data.gdeltproject.org/gdeltv2/${ts}.${kind}.CSV.zip`);
    if (r.ok === false) { missing++; fails++; log(`fehlt/Fehler ${ts} ${kind}: ${r.error}`); }
    else fails = 0;
    if (fails >= 10) { log("ABBRUCH: 10 Fehler in Folge"); console.log(stats()); process.exit(2); }
  }
  done++;
  if (done % 24 === 0) log(`Fortschritt: ${done}/${STEPS} Zeitpunkte, fehlende Dateien: ${missing}, geladen gesamt ${(totalBytes() / 1e6).toFixed(1)} MB`);
}
log(`FERTIG: ${done} Zeitpunkte, fehlende Dateien: ${missing}`);
console.log(stats());

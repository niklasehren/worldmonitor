// build-data.mjs (Cache-Modus): erzeugt aus dem lokalen GDELT-Test-Cache (data/gdelt-test, kein Netzwerk) die Daten für die Oberfläche.
//   public/data/world.json (nicht im Git), public/data/world.sample.json (im Git, "beispiel": true), public/data/countries/*.json, index.json
//   data/world.json und data/build-data-bericht.json (nicht im Git)
// Dieselbe Logik wie die Pipeline in GitHub Actions (scripts/pipeline/lauf.mjs), die den Zustand aus Netz-Downloads aufbaut.
// Start (im Projektordner): node scripts/build-data.mjs
import { loadContext, endMin, cacheStartMin, ROOT } from "./lib/pipeline-cache.mjs";
import { schreibeAusgabe } from "./lib/ausgabe.mjs";
import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync(ROOT + "data", { recursive: true });
const ctx = loadContext();
const r = schreibeAusgabe(ctx, { endMin, cacheStartMin, out: ROOT + "public/data", dataDir: ROOT + "data", sample: true, verlauf: [], lauf: "cache" });
writeFileSync(ROOT + "data/build-data-bericht.json", JSON.stringify(r.bericht, null, 1));
console.log(JSON.stringify(r.bericht, null, 1));
console.log("TOP 8:"); r.top8.forEach((t, i) => console.log(i + 1, t.medien, t.laender.join("+") || "-", t.titel ?? t.adresstext));

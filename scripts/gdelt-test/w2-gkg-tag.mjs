// Runde 4, Nachtlauf: gkg (ohne translation.gkg) für die 96 Zeitpunkte des letzten vollständigen Tages im Datenfenster.
// Start: WM_MAX_REQUESTS=920 WM_MAX_BYTES=1300000000 node scripts/gdelt-test/w2-gkg-tag.mjs
import { get, cached, log, stats } from "./lib.mjs";
import { stamps, gdeltUrl } from "./load.mjs";
import { execSync } from "node:child_process";
const day = stamps.slice(-96); const missing = day.filter((ts) => !cached(gdeltUrl(ts, "gkg", "csv")));
log(`w2: Tag ${day[0]} bis ${day.at(-1)}, gkg fehlt für ${missing.length} von 96`);
const free = execSync("df -k . | tail -1 | awk '{print $4}'").toString().trim() * 1024; if (free < 5e9) { log("ABBRUCH: weniger als 5 GB frei"); process.exit(2); }
let fails = 0, done = 0, skipped = [];
for (const ts of missing) {
  const st = stats(); if (st.bytes >= Number(process.env.WM_MAX_BYTES ?? 1e9)) { log(`STOPP: Gesamtmenge ${(st.bytes / 1e6).toFixed(0)} MB erreicht`); break; }
  const r = await get(gdeltUrl(ts, "gkg", "csv"));
  if (r.ok === false) { skipped.push(ts); fails++; log(`w2: ${ts} übersprungen (${r.error})`); if (fails >= 10) { log("w2: ABBRUCH, 10 Fehler in Folge"); break; } } else { fails = 0; done++; if (done % 10 === 0) log(`w2: Fortschritt ${done}/${missing.length}, ${(stats().bytes / 1e6).toFixed(0)} MB gesamt`); }
}
log(`w2: FERTIG geladen ${done}, übersprungen ${skipped.length} ${skipped.join(",")}`);

// Etappe 7: Wie schnell erscheint ein neuer 15-Minuten-Zeitpunkt auf dem Server? lastupdate.txt wird minütlich gelesen (nur diese eine Adresse).
// Gemessen wird: Server-Uhrzeit (Date-Header) beim ersten Auftauchen eines neuen Zeitpunkts minus Zeitpunkt-Bezeichnung.
import { appendFileSync, writeFileSync } from "node:fs";
import { DATA } from "./lib.mjs";
import { join } from "node:path";
const URL_ = "https://data.gdeltproject.org/gdeltv2/lastupdate.txt";
const N = Number(process.argv[2] ?? 50), PAUSE = 60_000;
const first = new Map(); const log = [];
const toMs = (t) => Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8), +t.slice(8, 10), +t.slice(10, 12), +t.slice(12, 14));
for (let i = 0; i < N; i++) {
  try {
    const res = await fetch(URL_, { headers: { "User-Agent": "worldmonitor-privatetest/0.1" }, signal: AbortSignal.timeout(60000) });
    const txt = await res.text(); const srv = new Date(res.headers.get("date")).getTime();
    const slot = txt.match(/(\d{14})\.export\.CSV\.zip/)?.[1];
    log.push({ i, local: new Date().toISOString(), server: new Date(srv).toISOString(), slot, status: res.status });
    if (slot && !first.has(slot)) first.set(slot, { slot, firstSeenServer: new Date(srv).toISOString(), lagMin: +((srv - toMs(slot)) / 60000).toFixed(1), localMinusServerSec: +((Date.now() - srv) / 1000).toFixed(0) });
  } catch (e) { log.push({ i, fehler: String(e.cause?.code ?? e.message) }); }
  writeFileSync(join(DATA, "lag.json"), JSON.stringify({ neueZeitpunkte: [...first.values()], anfragen: log.length, verlauf: log }, null, 1));
  await new Promise((r) => setTimeout(r, PAUSE));
}

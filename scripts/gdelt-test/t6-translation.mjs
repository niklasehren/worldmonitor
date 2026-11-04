// Aufgabe 6: Größe von translation.export / translation.mentions schätzen; bei < 300 MB je Tag und eingehaltenem Gesamtlimit 1 Tag laden.
import { get, log, totalBytes, stats, DATA } from "./lib.mjs";
import { gdeltUrl, toDate, fmt } from "./load.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const PROBE = ["20261030140000", "20261101030000"]; // lebhafte Werktagszeit und ruhige Nachtzeit
const sizes = [];
for (const ts of PROBE) {
  let pair = 0;
  for (const k of ["translation.export", "translation.mentions"]) { const r = await get(gdeltUrl(ts, k)); log(`${ts} ${k}: ${r.ok === false ? "FEHLER " + r.error : (r.bytes / 1e6).toFixed(2) + " MB"}`); pair += r.bytes ?? 0; }
  sizes.push({ ts, bytes: pair });
}
const maxPair = Math.max(...sizes.map((s) => s.bytes)), avgPair = sizes.reduce((s, x) => s + x.bytes, 0) / sizes.length;
const estMax = maxPair * 96, estAvg = avgPair * 96;
const now = totalBytes();
const decision = estMax < 300e6 && now + estMax < 1e9 ? "laden" : "nicht laden";
const info = { paare: sizes, schaetzungTagOberGrenzeMB: +(estMax / 1e6).toFixed(0), schaetzungTagMittelMB: +(estAvg / 1e6).toFixed(0), bisherMB: +(now / 1e6).toFixed(0), entscheidung: decision, regel: "Obergrenze der Schätzung (größeres Paar x 96) < 300 MB und bisherige Menge + Schätzung < 1 GB" };
writeFileSync(join(DATA, "translation-estimate.json"), JSON.stringify(info, null, 2));
console.log(JSON.stringify(info, null, 2));
if (decision === "laden") {
  const end = toDate("20261101041500"); const stamps = Array.from({ length: 96 }, (_, i) => fmt(new Date(end.getTime() - (95 - i) * 15 * 60000)));
  let fails = 0;
  for (const ts of stamps) {
    if (totalBytes() >= 950e6) { log("STOPP: Gesamtlimit fast erreicht (950 MB)"); break; }
    for (const k of ["translation.export", "translation.mentions"]) { const r = await get(gdeltUrl(ts, k)); if (r.ok === false) { fails++; log(`fehlt/Fehler ${ts} ${k}: ${r.error}`); } else fails = 0; if (fails >= 10) { log("ABBRUCH: 10 Fehler in Folge"); process.exit(2); } }
  }
  log("Übersetzungsdateien (1 Tag) fertig");
}
console.log(stats());

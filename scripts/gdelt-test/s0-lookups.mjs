// Etappe 0: lastupdate.txt (Zeitanker) und Nachschlagelisten (Themen, Länder) von data.gdeltproject.org
import { get, readText, stats, log, DATA } from "./lib.mjs";
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const urls = [
  "http://data.gdeltproject.org/gdeltv2/lastupdate.txt",
  "http://data.gdeltproject.org/api/v2/guides/LOOKUP-GKGTHEMES.TXT",
  "http://data.gdeltproject.org/api/v2/guides/LOOKUP-COUNTRIES.TXT",
];
for (const u of urls) {
  const r = await get(u);
  log(`${u} -> ${r.ok === false ? "FEHLER " + r.error : r.bytes + " Bytes" + (r.fromCache ? " (Cache)" : "")}`);
}
const lu = "http://data.gdeltproject.org/gdeltv2/lastupdate.txt";
const anchorFile = join(DATA, "anchor.json");
try {
  const m = readText(lu).match(/(\d{14})\.export\.CSV\.zip/);
  if (m && !existsSync(anchorFile)) writeFileSync(anchorFile, JSON.stringify({ lastExport: m[1] }));
  console.log("Zeitanker:", m?.[1]);
} catch (e) { console.log("Kein Zeitanker:", e.message); }
console.log(stats());

// Etappe 2b: gkg + translation.gkg für vier weitere Tageszeiten. Obergrenze für diese Etappe: 100 MB.
import { get, stats, log, totalBytes } from "./lib.mjs";
const SLOTS = ["20261030080000", "20261030140000", "20261030200000", "20261031120000"];
const CAP = 100_000_000;
const start = totalBytes();
for (const ts of SLOTS) for (const kind of ["gkg", "translation.gkg"]) {
  if (totalBytes() - start >= CAP) { log("STOPP: 100-MB-Grenze dieser Etappe erreicht"); console.log(stats()); process.exit(0); }
  const r = await get(`http://data.gdeltproject.org/gdeltv2/${ts}.${kind}.csv.zip`);
  log(`${ts} ${kind}: ${r.ok === false ? "FEHLER " + r.error : (r.bytes / 1e6).toFixed(2) + " MB" + (r.fromCache ? " (Cache)" : "")}`);
}
console.log("Etappe-Volumen MB:", ((totalBytes() - start) / 1e6).toFixed(1), stats());

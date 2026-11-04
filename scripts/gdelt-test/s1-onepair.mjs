// Etappe 1: genau ein Dateipaar (export + mentions) laden, Größe und Aufbau messen.
import { get, cachePath, stats, log } from "./lib.mjs";
import { execFileSync } from "node:child_process";

const ts = process.argv[2] ?? "20261101030000";
const out = {};
for (const kind of ["export", "mentions"]) {
  const url = `http://data.gdeltproject.org/gdeltv2/${ts}.${kind}.CSV.zip`;
  const r = await get(url);
  if (r.ok === false) { console.log(kind, "FEHLER", r.error); continue; }
  // Nur als Text lesen, nie ausführen: unzip -p gibt den Inhalt auf die Standardausgabe.
  const txt = execFileSync("unzip", ["-p", cachePath(url)], { maxBuffer: 1 << 30 }).toString("utf8");
  const lines = txt.split("\n").filter(Boolean);
  const cols = new Set(lines.slice(0, 2000).map((l) => l.split("\t").length));
  out[kind] = { zipBytes: r.bytes, textBytes: Buffer.byteLength(txt), rows: lines.length, columnCounts: [...cols] };
}
console.log(JSON.stringify(out, null, 2));
console.log(stats());

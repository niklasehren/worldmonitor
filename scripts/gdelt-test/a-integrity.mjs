// Datenqualität: Vollständigkeit und Unversehrtheit der geladenen Rohdateien (nur lesen, kein Netzwerk).
import { cachePath, cached, readMeta } from "./lib.mjs";
import { stamps, gdeltUrl, GKG_SLOTS } from "./load.mjs";
import { execFileSync, spawnSync } from "node:child_process";
import { statSync, writeFileSync, readFileSync } from "node:fs";
import { DATA } from "./lib.mjs";
import { join } from "node:path";

const res = { erwartet: stamps.length * 2, vorhanden: 0, fehlend: [], leer: [], unzipFehler: [], groesseWeichtAb: [], zeilen: { export: { gesamt: 0, falscheSpaltenzahl: 0 }, mentions: { gesamt: 0, falscheSpaltenzahl: 0 } }, leereTextdateien: [], letzteZeileUnvollstaendig: [] };
const cols = { export: 61, mentions: 16, gkg: 27, "translation.gkg": 27 };
function check(url, kind, ext, label) {
  if (!cached(url)) { res.fehlend.push(label); return null; }
  res.vorhanden++;
  const size = statSync(cachePath(url)).size, meta = readMeta(url);
  if (size === 0) { res.leer.push(label); return null; }
  if (meta.bytes !== size) res.groesseWeichtAb.push(`${label}: Meta ${meta.bytes} / Datei ${size}`);
  const t = spawnSync("unzip", ["-tq", cachePath(url)], { encoding: "utf8" });
  if (t.status !== 0) { res.unzipFehler.push(`${label}: ${(t.stdout + t.stderr).trim().slice(0, 80)}`); return null; }
  const txt = execFileSync("unzip", ["-p", cachePath(url)], { maxBuffer: 1 << 30 }).toString("utf8");
  if (!txt.length) { res.leereTextdateien.push(label); return null; }
  if (!txt.endsWith("\n")) res.letzteZeileUnvollstaendig.push(label);
  const lines = txt.split("\n").filter(Boolean);
  if (res.zeilen[kind]) { res.zeilen[kind].gesamt += lines.length; for (const l of lines) if (l.split("\t").length !== cols[kind]) res.zeilen[kind].falscheSpaltenzahl++; }
  return lines.length;
}
const perSlot = {};
for (const ts of stamps) { perSlot[ts] = { export: check(gdeltUrl(ts, "export"), "export", "CSV", ts + " export"), mentions: check(gdeltUrl(ts, "mentions"), "mentions", "CSV", ts + " mentions") }; }
// auffällig kleine Zeitpunkte (Lücken im Verlauf): weniger als 25 % des Medians
const ex = Object.values(perSlot).map((x) => x.export ?? 0).sort((a, b) => a - b), med = ex[Math.floor(ex.length / 2)];
res.ereignisseProZeitpunkt = { min: ex[0], median: med, max: ex[ex.length - 1] };
res.auffaelligKleineZeitpunkte = Object.entries(perSlot).filter(([, v]) => (v.export ?? 0) < med * 0.25).map(([k, v]) => `${k}: ${v.export} Ereignisse, ${v.mentions} Erwähnungen`);
res.zeitpunkteOhneErwaehnungenOderEreignisse = Object.entries(perSlot).filter(([, v]) => !v.export || !v.mentions).map(([k]) => k);
// Zeitraster lückenlos?
const t = stamps.map((s) => Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(8, 10), +s.slice(10, 12)));
res.rasterLuecken = t.slice(1).filter((x, i) => x - t[i] !== 15 * 60000).length;
// gkg-Dateien (5 Zeitpunkte x 2, dazu Stichproben-Zeitpunkte nur gkg)
const gk = { vorhanden: 0, erwartet: GKG_SLOTS.length * 2, fehler: [] };
for (const ts of GKG_SLOTS) for (const k of ["gkg", "translation.gkg"]) { const before = res.vorhanden; const n = check(gdeltUrl(ts, k, "csv"), k, "csv", `${ts} ${k}`); if (n !== null) gk.vorhanden++; }
res.gkgHaupt = gk;
const samp = JSON.parse(readFileSync(join(DATA, "trigger-sample20.json"), "utf8")); const sl = [...new Set(samp.map((x) => x.slot))];
let sOk = 0; for (const ts of sl) if (check(gdeltUrl(ts, "gkg", "csv"), "gkg", "csv", `${ts} gkg (Stichprobe)`) !== null) sOk++;
res.gkgStichprobe = { erwartet: sl.length, ok: sOk };
res.vorhanden = res.vorhanden; // enthält auch gkg-Prüfungen, daher getrennt unten
writeFileSync(join(DATA, "integrity.json"), JSON.stringify(res, null, 2));
console.log(JSON.stringify(res, null, 2));

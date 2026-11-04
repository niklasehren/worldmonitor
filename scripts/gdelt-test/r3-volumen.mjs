// Runde 3, Aufgabe 7: Datenmenge und Laufzeit aus vorhandenen Dateigrößen und dem Protokoll (kein Netzwerk).
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RAW, DATA } from "./lib.mjs";
const kinds = {};
for (const f of readdirSync(RAW).filter((x) => x.endsWith(".json"))) {
  let m; try { m = JSON.parse(readFileSync(join(RAW, f), "utf8")); } catch { continue; }
  const url = m.url ?? ""; const k = url.match(/\d{14}\.([a-z.]+?)\.(?:CSV|csv)\.zip/i)?.[1]; if (!k) continue;
  let size; try { size = statSync(join(RAW, f.replace(/\.json$/, ".bin"))).size; } catch { continue; }
  const hh = +url.match(/gdeltv2\/\d{8}(\d{2})/)?.[1];
  (kinds[k] ??= []).push({ size, hh });
}
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.ceil(p * s.length) - 1)]; };
const MB = (b) => b / 1e6;
const res = {};
for (const [k, a] of Object.entries(kinds)) { const s = a.map((x) => x.size); const mean = s.reduce((x, y) => x + y, 0) / s.length; res[k] = { n: s.length, meanMB: +MB(mean).toFixed(3), medianMB: +MB(q(s, 0.5)).toFixed(3), p90MB: +MB(q(s, 0.9)).toFixed(3), maxMB: +MB(Math.max(...s)).toFixed(3) }; }
// Download-Geschwindigkeit aus dem Protokoll: aufeinanderfolgende gkg-Zeilen (Abstand = Pause 5 s + Download der nächsten Datei)
const lines = readFileSync(join(DATA, "messages.log"), "utf8").split("\n"); const pts = [];
for (const l of lines) { const m = l.match(/^(\S+Z) (\d{14}) ((?:translation\.)?gkg): ([\d.]+) MB/); if (m) pts.push({ t: Date.parse(m[1]), mb: +m[4] }); }
const sec = []; for (let i = 1; i < pts.length; i++) { const d = (pts[i].t - pts[i - 1].t) / 1000; if (d > 0 && d < 40) sec.push({ d, mb: pts[i].mb }); }
const perMB = sec.map((x) => (x.d - 5) / x.mb).filter((x) => x > 0).sort((a, b) => a - b);
const gesamt = sec.reduce((a, b) => a + b.d, 0), gesamtMB = sec.reduce((a, b) => a + b.mb, 0);
res._download = { paare: sec.length, medianSekProMB: +perMB[Math.floor(perMB.length / 2)].toFixed(2), p90SekProMB: +perMB[Math.floor(perMB.length * 0.9)].toFixed(2), mittelSekProDatei: +(gesamt / sec.length).toFixed(1), mittelMBproDatei: +(gesamtMB / sec.length).toFixed(2), hinweis: "Abstand zwischen Protokollzeilen = 5 s Pause + Download; Lauf auf Heim-/Hotel-Netz, nicht auf GitHub" };
// Kleine Dateien: 48 Dateien je Fortschrittszeile
const prog = lines.map((l) => l.match(/^(\S+Z) Fortschritt: (\d+)\/288/)).filter(Boolean).map((m) => ({ t: Date.parse(m[1]), n: +m[2] }));
const gaps = []; for (let i = 1; i < prog.length; i++) { const d = (prog[i].t - prog[i - 1].t) / 1000, files = (prog[i].n - prog[i - 1].n) * 2; if (d < 400) gaps.push(d / files); }
res._kleineDateien = { messungen: gaps.length, medianSekProDatei: gaps.length ? +gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)].toFixed(2) : null };
writeFileSync(join(DATA, "r3-volumen.json"), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));

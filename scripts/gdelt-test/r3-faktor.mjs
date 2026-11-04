// Runde 3, Aufgabe 5: Top 20 nach roher Medienzahl (mit Alterungsabschlag) mit/ohne Länderfaktor; Wirkung der Stufe "erhöht".
import { loadEvents, min, stamps } from "./load.mjs";
import { buildGroups } from "./stories.mjs";
import { classOf, cname, primary } from "./common2.mjs";
import { DATA } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const { events, mentions } = loadEvents();
const groups = buildGroups(events, mentions);
const last = min(stamps.at(-1));
const cuts = Array.from({ length: 12 }, (_, i) => last - i * 6 * 60 - 0);
const FS = { mit: { hoch: 2, erhoeht: 1.5, basis: 1 }, ohne: { hoch: 1, erhoeht: 1, basis: 1 }, ohneErh: { hoch: 2, erhoeht: 1, basis: 1 } };
const g = (countries, f) => Math.max(f.basis, ...Object.keys(countries).map((c) => f[classOf(c)] ?? f.basis));
const res = []; const gain = {}, loss = {}, gainClass = { hoch: 0, erhoeht: 0, basis: 0, ohne_land: 0 }, lossClass = { hoch: 0, erhoeht: 0, basis: 0, ohne_land: 0 };
let erhInTop = 0, erhIn21to40 = 0, erhRows = 0;
for (const cut of cuts) {
  const rows = [];
  for (const gr of groups.values()) { if (!gr.ms.length || gr.ms[0].tm > cut) continue; let latest = -1; const srcs = new Set(); for (const m of gr.ms) { if (m.tm > cut) break; srcs.add(m.src); latest = m.tm; } if (cut - latest > 1440) continue; rows.push({ key: gr.key, M: srcs.size, A: Math.pow(0.5, (cut - latest) / 720), c: gr.countries }); }
  const top = (f) => rows.map((r) => ({ ...r, s: r.M * r.A * g(r.c, FS[f]) })).sort((a, b) => b.s - a.s);
  const T = Object.fromEntries(["mit", "ohne", "ohneErh"].map((f) => [f, top(f)]));
  const set = (f, n = 20) => new Set(T[f].slice(0, n).map((r) => r.key));
  const a = set("mit"), b = set("ohne"), c = set("ohneErh");
  const inter = (x, y) => [...x].filter((k) => y.has(k)).length;
  const klasseOf = (r) => classOf(primary(r.c)), nameOf = (r) => cname(primary(r.c));
  for (const r of T.mit.slice(0, 20)) if (!b.has(r.key)) { gain[nameOf(r)] = (gain[nameOf(r)] ?? 0) + 1; gainClass[klasseOf(r)]++; }
  for (const r of T.ohne.slice(0, 20)) if (!a.has(r.key)) { loss[nameOf(r)] = (loss[nameOf(r)] ?? 0) + 1; lossClass[klasseOf(r)]++; }
  const eMit = T.mit.slice(0, 20).filter((r) => klasseOf(r) === "erhoeht").length;
  erhInTop += eMit;
  res.push({ cut: new Date(cut * 60000).toISOString().slice(5, 16), geschichten: rows.length, gemeinsamMitOhne: inter(a, b), ersetzt: 20 - inter(a, b), gemeinsamMitOhneErh: inter(a, c), basisMit: T.mit.slice(0, 20).filter((r) => klasseOf(r) === "basis").length, basisOhne: T.ohne.slice(0, 20).filter((r) => klasseOf(r) === "basis").length, erhoehtImTop20Mit: eMit, erhoehtImTop20Ohne: T.ohne.slice(0, 20).filter((r) => klasseOf(r) === "erhoeht").length, hochMit: T.mit.slice(0, 20).filter((r) => klasseOf(r) === "hoch").length, hochOhne: T.ohne.slice(0, 20).filter((r) => klasseOf(r) === "hoch").length });
}
const top = (o, n = 10) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
const out = { zeitpunkte: res, profitieren: top(gain), verlieren: top(loss), profitierenKlasse: gainClass, verlierenKlasse: lossClass, erhoehtImTop20GesamtMit: erhInTop };
writeFileSync(join(DATA, "r3-faktor.json"), JSON.stringify(out, null, 1));
console.table(res); console.log(JSON.stringify({ profitieren: out.profitieren, verlieren: out.verlieren, gainClass, lossClass, erhInTop }));

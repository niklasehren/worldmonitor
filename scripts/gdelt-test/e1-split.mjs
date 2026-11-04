// Runde 3, Aufgabe 1a: Geschichten der Varianten B, C, D1 -> Entwicklungs-/Prüfmenge (fester Zufall).
import { loadEvents, min, stamps, norm } from "./load.mjs";
import { classOf, cname, primary } from "./common2.mjs";
import { DATA } from "./lib.mjs";
import { loadTitles, textOf, hash } from "./r3common.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const ROOTS = new Set(["18", "19", "20"]);
const WAFFEN = new Set(["183", "1831", "1832", "1833", "1834", "193", "194", "195", "196", "200", "201", "202", "203", "204"]);
const BEW = new Set(["MIL", "REB", "UAF", "INS", "SEP", "GOV"]);
const evB = (e) => WAFFEN.has(e.code), evC = (e) => BEW.has(e.a1type) || BEW.has(e.a2type);
const V = { B: evB, C: evC, D1: (e) => evB(e) && evC(e) };
const { events, mentions } = loadEvents();
const TM = loadTitles();
const tStart = min(stamps[0]), tEnd = min(stamps.at(-1)), days = (tEnd - tStart) / 1440;
const groups = new Map();
for (const e of events.values()) { if (!ROOTS.has(e.root)) continue; const k = norm(e.url); if (!k) continue; (groups.get(k) ?? groups.set(k, []).get(k)).push(e); }
const evMs = (e) => (mentions.get(e.id) ?? []).filter((m) => m.type === "1").map((m) => ({ tm: min(m.t), src: m.src }));
const all = new Map();
for (const [name, f] of Object.entries(V)) for (const [key, evs] of groups) {
  const q = evs.filter(f); if (!q.length) continue;
  const ms = q.flatMap(evMs).sort((a, b) => a.tm - b.tm); if (!ms.length) continue;
  const added = Math.min(...q.map((e) => min(e.added))); if (added < tStart || added > tEnd - 60) continue;
  const t1 = ms[0].tm, seen = new Set(); for (const m of ms) { if (m.tm - t1 > 60) break; seen.add(m.src); }
  if (seen.size < 2) continue;
  let r = all.get(key);
  if (!r) { const cc = {}; for (const e of q) if (e.country) cc[e.country] = (cc[e.country] ?? 0) + 1; const rep = q.reduce((a, b) => (b.nm > a.nm ? b : a)); const tx = textOf(TM, rep.url);
    all.set(key, (r = { key, vars: [], n60: seen.size, cc: primary(cc), land: cname(primary(cc)), klasse: classOf(primary(cc)), code: rep.code, text: tx.text, quelle: tx.quelle, first: Math.min(...ms.map((m) => m.tm)), a1: rep.a1type, a2: rep.a2type })); }
  r.vars.push(name);
}
const list = [...all.values()].map((r) => ({ ...r, menge: hash(r.key, 4711) < 0.5 ? "entw" : "pruef" }));
const stat = {}; for (const v of Object.keys(V)) { const l = list.filter((r) => r.vars.includes(v)); stat[v] = { gesamt: l.length, entw: l.filter((r) => r.menge === "entw").length, pruef: l.filter((r) => r.menge === "pruef").length, mitTitel: l.filter((r) => r.quelle === "titel").length }; }
writeFileSync(join(DATA, "e1-stories.json"), JSON.stringify({ tage: days, list }, null, 1));
console.log(JSON.stringify(stat), "Tage", days.toFixed(2), "Union", list.length);

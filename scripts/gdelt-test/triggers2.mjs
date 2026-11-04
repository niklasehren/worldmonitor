// Runde 2, Aufgabe 3: Eilmeldungs-Varianten auf Geschichten-Ebene (gleiche Quell-Adresse = eine Geschichte).
import { loadEvents, min, stamps, toDate, norm, sample, GKG_SLOTS, loadGkg } from "./load.mjs";
import { classOf, cname, titleMap, primary } from "./common2.mjs";
import { DATA, cached } from "./lib.mjs";
import { gdeltUrl } from "./load.mjs";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOTS = new Set(["18", "19", "20"]);
const WAFFEN = new Set(["183", "1831", "1832", "1833", "1834", "193", "194", "195", "196", "200", "201", "202", "203", "204"]);
const BEWAFFNET = new Set(["MIL", "REB", "UAF", "INS", "SEP", "GOV"]);
const evB = (e) => WAFFEN.has(e.code);
const evC = (e) => BEWAFFNET.has(e.a1type) || BEWAFFNET.has(e.a2type);
const VARIANTEN = {
  "V0 Codes 18-20, >=2 Medien (Referenz)": { ev: () => true, n: 2 },
  "A5 Codes 18-20, >=5 Medien": { ev: () => true, n: 5 },
  "A10 Codes 18-20, >=10 Medien": { ev: () => true, n: 10 },
  "B Waffen-/Luftangriff-/Massengewalt-Codes, >=2": { ev: evB, n: 2 },
  "C bewaffnete/staatliche Akteure, >=2": { ev: evC, n: 2 },
  "D1 B und C, >=2": { ev: (e) => evB(e) && evC(e), n: 2 },
  "D2 B, >=5": { ev: evB, n: 5 },
  "D3 B und C, >=5": { ev: (e) => evB(e) && evC(e), n: 5 },
  "D4 B, >=10": { ev: evB, n: 10 },
};
const { events, mentions } = loadEvents();
const tStart = min(stamps[0]), tEnd = min(stamps[stamps.length - 1]), days = (tEnd - tStart) / 1440;
// Gruppen (Geschichten) über Quell-Adresse
const groups = new Map();
for (const e of events.values()) { if (!ROOTS.has(e.root)) continue; const k = norm(e.url); if (!k) continue; (groups.get(k) ?? groups.set(k, []).get(k)).push(e); }
const evMs = (e) => (mentions.get(e.id) ?? []).filter((m) => m.type === "1").map((m) => ({ tm: min(m.t), src: m.src }));
// zulässige Zeitpunkte für Stichproben: Haupt-, Auslöser-Stichproben- und Zufalls-Zeitpunkte (keine nach Größe ausgewählten)
const trigSlots = existsSync(join(DATA, "trigger-sample20.json")) ? [...new Set(JSON.parse(readFileSync(join(DATA, "trigger-sample20.json"), "utf8")).map((x) => x.slot))] : [];
const rndSlots = existsSync(join(DATA, "random-slots.json")) ? JSON.parse(readFileSync(join(DATA, "random-slots.json"), "utf8")) : [];
const sampleSlots = [...new Set([...GKG_SLOTS, ...trigSlots, ...rndSlots])].filter((ts) => cached(gdeltUrl(ts, "gkg", "csv")));
const TM = titleMap(sampleSlots);
const out = { fensterTage: +days.toFixed(2), zeitpunkteMitTiteln: sampleSlots.length, varianten: {} };
const samples = {}, stories = {};
let seed = 900;
for (const [name, v] of Object.entries(VARIANTEN)) {
  const trig = []; let cens = 0;
  for (const [key, evs] of groups) {
    const q = evs.filter(v.ev); if (!q.length) continue;
    const ms = q.flatMap(evMs).sort((a, b) => a.tm - b.tm); if (!ms.length) continue;
    const added = Math.min(...q.map((e) => min(e.added)));
    if (added < tStart || added > tEnd - 60) { cens++; continue; }
    const t1 = ms[0].tm, seen = new Set(); for (const m of ms) { if (m.tm - t1 > 60) break; seen.add(m.src); }
    if (seen.size < v.n) continue;
    const cc = {}; for (const e of q) if (e.country) cc[e.country] = (cc[e.country] ?? 0) + 1;
    const rep = q.reduce((a, b) => (b.nm > a.nm ? b : a));
    trig.push({ key, n60: seen.size, country: primary(cc), klasse: classOf(primary(cc)), code: rep.code, slot: rep.slot, url: rep.url, a1: rep.a1type, a2: rep.a2type });
  }
  const by = {}; for (const t of trig) by[t.klasse] = (by[t.klasse] ?? 0) + 1;
  const univ = trig.filter((t) => sampleSlots.includes(t.slot) && TM.has(norm(t.url)));
  const s = sample(univ, 20, seed++);
  samples[name] = s.map((t) => t.key);
  for (const t of s) stories[t.key] ??= { titel: TM.get(norm(t.url))?.title?.slice(0, 150), land: cname(t.country), klasse: t.klasse, code: t.code, n60: t.n60, a1: t.a1, a2: t.a2, slot: t.slot };
  out.varianten[name] = { geschichten: trig.length, proTag: +(trig.length / days).toFixed(1), nachKlasse: by, abgeschnitten: cens, imStichprobenUniversum: univ.length, stichprobe: s.length };
}
writeFileSync(join(DATA, "trig2-samples.json"), JSON.stringify({ samples, stories }, null, 1));
writeFileSync(join(DATA, "trig2-summary.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
console.log("Stichproben-Geschichten (einzigartig):", Object.keys(stories).length);

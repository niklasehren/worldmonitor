// Eilmeldungs-Auslöser: >= 2 verschiedene Web-Quellen innerhalb von 60 Min. nach der ersten Erwähnung, schwerer Ereignistyp.
// Aufteilung nach Länder-Gewichtung aus config/weights.json (FIPS-Codes). Ausgabe: Zahlen + Stichprobe von 20 Auslösern.
import { loadEvents, min, sample, stamps, toDate } from "./load.mjs";
import { DATA } from "./lib.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CW = JSON.parse(readFileSync(new URL("../../config/weights.json", import.meta.url), "utf8")).laender.zuordnung;
const hoch = new Set(CW.hoch.map((x) => x.fips)), erh = new Set(CW.erhoeht.map((x) => x.fips));
const cls = (cc) => (!cc ? "ohne_ereignisland" : hoch.has(cc) ? "hoch" : erh.has(cc) ? "erhoeht" : "basis");
const { events, mentions, perSlot, missing } = loadEvents();
const tStart = min(stamps[0]), tEnd = min(stamps[stamps.length - 1]);
const days = (tEnd - tStart) / 1440;
const rootCounts = {}; for (const e of events.values()) rootCounts[e.root] = (rootCounts[e.root] ?? 0) + 1;

function run({ roots, maxG = Infinity, freshDays = null }) {
  const res = []; let censored = 0, noMention = 0, notTwo = 0;
  for (const e of events.values()) {
    if (!roots.has(e.root) || !(e.goldstein <= maxG)) continue;
    const added = min(e.added);
    if (added < tStart || added > tEnd - 60) { censored++; continue; }
    if (freshDays !== null && added - toDate(e.sqldate + "000000").getTime() / 60000 > freshDays * 1440) continue;
    const ms = (mentions.get(e.id) ?? []).filter((m) => m.type === "1").map((m) => ({ ...m, tm: min(m.t) })).sort((a, b) => a.tm - b.tm);
    if (!ms.length) { noMention++; continue; }
    const t1 = ms[0].tm, seen = new Map();
    for (const m of ms) { if (m.tm - t1 > 60) break; if (!seen.has(m.src)) seen.set(m.src, { src: m.src, t: m.t, url: m.url }); }
    if (seen.size < 2) { notTwo++; continue; }
    res.push({ id: e.id, root: e.root, code: e.code, goldstein: e.goldstein, nm: e.nm, country: e.country, place: e.place, klasse: cls(e.country), sqldate: e.sqldate, added: e.added, t1: ms[0].t, srcs: [...seen.values()], srcUrl: e.url, slot: e.slot });
  }
  return { res, censored, noMention, notTwo };
}
const V = {
  "V1 Hauptcodes 18-20": { roots: new Set(["18", "19", "20"]) },
  "V2 Hauptcodes 18-20 und Goldstein <= -8": { roots: new Set(["18", "19", "20"]), maxG: -8 },
  "V3 V1 und Ereignisdatum höchstens 1 Tag alt": { roots: new Set(["18", "19", "20"]), freshDays: 1 },
};
const out = { fensterTage: +days.toFixed(2), zeitpunkteMitDaten: Object.keys(perSlot).length, zeitpunkteOhneDaten: missing, ereignisseGesamt: events.size, ereignisseOhneEreignisland: [...events.values()].filter((e) => !e.country).length, hauptcodeVerteilung: rootCounts, varianten: {} };
const mkSummary = (r) => { const by = {}; for (const x of r.res) by[x.klasse] = (by[x.klasse] ?? 0) + 1; return { ausloeser: r.res.length, proTag: +(r.res.length / days).toFixed(1), nachGewichtung: by, abgeschnitten: r.censored, ohneWebErwaehnung: r.noMention, nurEineQuelle: r.notTwo }; };
let v1;
for (const [name, v] of Object.entries(V)) { const r = run(v); out.varianten[name] = mkSummary(r); if (name.startsWith("V1")) v1 = r.res; }
// Wie viele Auslöser bleiben bei höheren Mindestzahlen unabhängiger Quellen (nur Zählung, keine Empfehlung)?
out.nachMindestzahlQuellenIn60Min = Object.fromEntries([2, 3, 5, 10].map((n) => [`>= ${n}`, v1.filter((r) => r.srcs.length >= n).length]));
const codes = {}; for (const r of v1) codes[r.code] = (codes[r.code] ?? 0) + 1;
out.haeufigsteEreigniscodesBeiAusloesern = Object.fromEntries(Object.entries(codes).sort((x, y) => y[1] - x[1]).slice(0, 12));
const st = {}; for (const r of v1) { const d = (min(r.added) - toDate(r.sqldate + "000000").getTime() / 60000) / 1440; const k = d <= 1 ? "<= 1 Tag" : d <= 7 ? "1-7 Tage" : "> 7 Tage"; st[k] = (st[k] ?? 0) + 1; }
out.altersverteilungEreignisdatumBeiAusloesern = st;
// Zeitabstand zwischen erster und zweiter Quelle (15-Minuten-Raster, daher grob)
const gaps = v1.map((r) => min(r.srcs[1].t) - min(r.t1)).sort((a, b) => a - b);
out.zeitAbstandErsteZweiteQuelleMin = { median: gaps[Math.floor(gaps.length / 2)] ?? null, p90: gaps[Math.floor(gaps.length * 0.9)] ?? null, anteilGleicherZeitpunkt: gaps.length ? +(100 * gaps.filter((g) => g === 0).length / gaps.length).toFixed(0) : null };
const s20 = sample(v1, 20, 2026);
writeFileSync(join(DATA, "triggers-v1.json"), JSON.stringify(v1));
writeFileSync(join(DATA, "trigger-sample20.json"), JSON.stringify(s20));
writeFileSync(join(DATA, "triggers-summary.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
console.log("Slots der Stichprobe:", [...new Set(s20.map((x) => x.slot))].length);

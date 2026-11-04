// Geschichten bilden: Ereignisse mit gleicher (vereinheitlichter) Quell-Adresse gehören zu einer Geschichte (auch mit verschiedenen Ländern).
import { norm, min } from "./load.mjs";
import { readFileSync } from "node:fs";

const W = JSON.parse(readFileSync(new URL("../../config/weights.json", import.meta.url), "utf8")).laender;
const F = W.stufen, hoch = new Set(W.zuordnung.hoch.map((x) => x.fips)), erh = new Set(W.zuordnung.erhoeht.map((x) => x.fips));
export const factor = (cc) => (hoch.has(cc) ? F.hoch : erh.has(cc) ? F.erhoeht : F.basis);
const R = JSON.parse(readFileSync(new URL("./regions.json", import.meta.url), "utf8"));
const regionOf = {}; for (const [r, codes] of Object.entries(R)) if (!r.startsWith("_")) for (const c of codes) regionOf[c] = r;
export const region = (cc) => (!cc ? "ohne Ereignisland" : regionOf[cc] ?? "Sonstige");

export function buildGroups(events, mentions) {
  const groups = new Map();
  for (const e of events.values()) {
    const k = norm(e.url); if (!k) continue;
    let g = groups.get(k); if (!g) groups.set(k, (g = { key: k, evIds: [], ms: [], countries: {}, rep: null }));
    g.evIds.push(e.id); if (e.country) g.countries[e.country] = (g.countries[e.country] ?? 0) + 1;
    if (!g.rep || e.nm > g.rep.nm) g.rep = { id: e.id, nm: e.nm, slot: e.slot, url: e.url };
    for (const m of mentions.get(e.id) ?? []) if (m.type === "1") g.ms.push({ tm: min(m.t), src: m.src });
  }
  for (const g of groups.values()) g.ms.sort((a, b) => a.tm - b.tm);
  return groups;
}
export const primaryCountry = (countries) => Object.entries(countries).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

// Bewertung zum Zeitpunkt cut (Minuten). M = verschiedene Web-Quellen bis cut; Land-Gewicht = höchster Faktor der beteiligten Länder.
export function scoreGroups(groups, cut) {
  const rows = [];
  for (const g of groups.values()) {
    if (!g.ms.length || g.ms[0].tm > cut) continue;
    let latest = -1; const seen = new Set();
    for (const m of g.ms) { if (m.tm > cut) break; seen.add(m.src); latest = m.tm; }
    if (cut - latest > 24 * 60) continue;
    rows.push(scoreRow(g.key, seen, latest, g.countries, g, cut));
  }
  return rows;
}
export function scoreRow(key, srcSet, latest, countries, extra, cut) {
  const M = srcSet.size, A = Math.pow(0.5, (cut - latest) / 60 / 12);
  const gl = Math.max(F.basis, ...Object.keys(countries).map(factor));
  return { key, M, latest, countries, srcs: srcSet, G: gl, A, raw: M * gl * A, log: Math.log(1 + M) * gl * A, rep: extra?.rep, nEvents: extra?.evIds?.length ?? 0 };
}

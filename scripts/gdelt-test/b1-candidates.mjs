// Geschichten-Ranking: Vorbereitung (kein Netzwerk). Zählt Dubletten in den alten Top 20 und wählt Kandidaten, deren Titel aus gkg gebraucht werden.
import { loadEvents, min, stamps } from "./load.mjs";
import { buildGroups, scoreGroups, factor, region, primaryCountry } from "./stories.mjs";
import { DATA } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const { events, mentions } = loadEvents();
const groups = buildGroups(events, mentions);
const last = min(stamps[stamps.length - 1]);
const top = (rows, k, n) => [...rows].sort((a, b) => b[k] - a[k]).slice(0, n);

// alte Rangliste auf Ereignis-Ebene (wie vorher): Ereignis = eine Zeile
const prep = [];
for (const e of events.values()) { const ms = (mentions.get(e.id) ?? []).filter((m) => m.type === "1").map((m) => ({ tm: min(m.t), src: m.src })).sort((a, b) => a.tm - b.tm); if (ms.length) prep.push({ e, ms }); }
function eventRows(cut) {
  const rows = [];
  for (const { e, ms } of prep) { if (ms[0].tm > cut) continue; let latest = -1; const seen = new Set(); for (const m of ms) { if (m.tm > cut) break; seen.add(m.src); latest = m.tm; } if (cut - latest > 1440) continue; const M = seen.size, A = Math.pow(0.5, (cut - latest) / 720), g = factor(e.country); rows.push({ id: e.id, key: e.url ? e.url.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/#.*$/, "").replace(/\/+$/, "").toLowerCase() : e.id, M, raw: M * g * A, log: Math.log(1 + M) * g * A }); }
  return rows;
}
const out = { zeitpunkte: [] };
const cuts = [0, 6, 12, 18].map((h) => last - h * 60);
let finalOld;
for (const cut of cuts) {
  const er = eventRows(cut), gr = scoreGroups(groups, cut);
  const oldRaw = top(er, "raw", 20), oldLog = top(er, "log", 20);
  const newRaw = top(gr, "raw", 20), newLog = top(gr, "log", 20);
  out.zeitpunkte.push({ ende: new Date(cut * 60000).toISOString(), ereignisse: er.length, geschichten: gr.length,
    alteTop20_verschiedeneGeschichtenNachAdresse: { roh: new Set(oldRaw.map((r) => r.key)).size, log: new Set(oldLog.map((r) => r.key)).size },
    neueTop20_verschiedeneGeschichten: { roh: new Set(newRaw.map((r) => r.key)).size, log: new Set(newLog.map((r) => r.key)).size },
    ueberlappungNeuTop20: newRaw.filter((r) => newLog.some((l) => l.key === r.key)).length });
  if (cut === last) { finalOld = { raw: oldRaw, log: oldLog }; }
}
// Kandidaten am letzten Zeitpunkt
const gr = scoreGroups(groups, last);
const cand = new Map();
const add = (r, why) => { const c = cand.get(r.key) ?? { key: r.key, why: [] }; c.why.push(why); cand.set(r.key, c); };
for (const r of top(gr, "raw", 40)) add(r, "raw40");
for (const r of top(gr, "log", 40)) add(r, "log40");
for (const k of ["raw", "log"]) for (const r of finalOld[k]) { const g = groups.get(r.key); if (g) add({ key: r.key }, "alteTop20_" + k); }
// beste Geschichte je Weltregion nach Medienzahl (ohne Länder-Gewichtung); Region = Region des Landes mit den meisten Ereignissen der Geschichte
const byRegion = {};
for (const r of gr) { const reg = region(primaryCountry(r.countries)); if (!byRegion[reg] || r.M > byRegion[reg].M) byRegion[reg] = r; }
for (const r of Object.values(byRegion)) add(r, "region");
const byKey = new Map(gr.map((r) => [r.key, r]));
const list = [];
for (const c of cand.values()) {
  const g = groups.get(c.key); const r = byKey.get(c.key);
  const seen = new Set(); let latest = -1; for (const m of g.ms) { if (m.tm > last) break; seen.add(m.src); latest = m.tm; }
  list.push({ key: c.key, why: c.why, repUrl: g.rep.url, repSlot: g.rep.slot, M: seen.size, latest, countries: g.countries, srcs: [...seen], nEvents: g.evIds.length, inWindow: !!r });
}
out.kandidaten = list.length; out.slots = [...new Set(list.map((c) => c.repSlot))].length;
out.regionBeste = Object.fromEntries(Object.entries(byRegion).map(([k, r]) => [k, { key: r.key, M: r.M }]));
writeFileSync(join(DATA, "story-candidates.json"), JSON.stringify({ last, cands: list, regionBest: Object.fromEntries(Object.entries(byRegion).map(([k, r]) => [k, r.key])), alteTop20Keys: { raw: finalOld.raw.map((r) => r.key), log: finalOld.log.map((r) => r.key) } }));
writeFileSync(join(DATA, "story-summary.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));

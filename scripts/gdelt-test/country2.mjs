// Runde 2, Aufgabe 5: Ist das Ereignisland (ActionGeo) plausibel? 30 Stichproben + Alternativen (Actor1Geo, gkg-Orte).
import { loadEvents, loadGkg, GKG_SLOTS, norm, sample } from "./load.mjs";
import { cname } from "./common2.mjs";
import { DATA, cached } from "./lib.mjs";
import { gdeltUrl } from "./load.mjs";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const trigSlots = existsSync(join(DATA, "trigger-sample20.json")) ? [...new Set(JSON.parse(readFileSync(join(DATA, "trigger-sample20.json"), "utf8")).map((x) => x.slot))] : [];
const rndSlots = existsSync(join(DATA, "random-slots.json")) ? JSON.parse(readFileSync(join(DATA, "random-slots.json"), "utf8")) : [];
const sampleSlots = [...new Set([...GKG_SLOTS, ...trigSlots, ...rndSlots])].filter((ts) => cached(gdeltUrl(ts, "gkg", "csv")));
const art = new Map();
for (const ts of sampleSlots) for (const r of loadGkg(ts)) if (!r.tr && r.title && !art.has(norm(r.url))) art.set(norm(r.url), r);
const { events } = loadEvents();
const univ = [...events.values()].filter((e) => sampleSlots.includes(e.slot) && art.has(norm(e.url)));
const mostFreq = (locs) => { const c = {}; for (const l of locs) if (l.fips) c[l.fips] = (c[l.fips] ?? 0) + 1; return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""; };
const stat = { ereignisse: univ.length, ohneActionGeo: 0, ohneGkgOrte: 0, actionGeoInGkgOrten: 0, actionGeoGleichGkgHaeufigstes: 0, actionGeoGleichActor1Geo: 0 };
for (const e of univ) {
  const a = art.get(norm(e.url)); const lc = a.locs.map((l) => l.fips).filter(Boolean);
  if (!e.country) stat.ohneActionGeo++; if (!lc.length) stat.ohneGkgOrte++;
  if (e.country && lc.includes(e.country)) stat.actionGeoInGkgOrten++;
  if (e.country && mostFreq(a.locs) === e.country) stat.actionGeoGleichGkgHaeufigstes++;
  if (e.country && e.a1geo === e.country) stat.actionGeoGleichActor1Geo++;
}
const withBoth = univ.filter((e) => e.country && art.get(norm(e.url)).locs.length);
stat.anteilActionGeoInGkgOrtenProzent = +(100 * stat.actionGeoInGkgOrten / Math.max(1, withBoth.length)).toFixed(1);
const seen = new Set(), pool = [];
for (const e of sample(univ, univ.length, 31415)) { const k = norm(e.url); if (seen.has(k)) continue; seen.add(k); pool.push(e); }
const s30 = pool.slice(0, 30).map((e, i) => { const a = art.get(norm(e.url)); return { nr: i + 1, titel: a.title.slice(0, 140), root: e.root, code: e.code, actionGeo: cname(e.country), ort: e.place, actor1Geo: e.a1geo ? cname(e.a1geo) : "", gkgErstesLand: a.locs[0]?.fips ? cname(a.locs[0].fips) : "", gkgHaeufigstesLand: mostFreq(a.locs) ? cname(mostFreq(a.locs)) : "", gkgOrte: [...new Set(a.locs.map((l) => l.name))].slice(0, 3).join(" / ") }; });
writeFileSync(join(DATA, "country2-samples.json"), JSON.stringify({ stat, s30 }, null, 1));
console.log(JSON.stringify(stat, null, 1));
for (const x of s30) console.log(`${x.nr}. ${x.titel}\n    Aktion: ${x.actionGeo} (${x.ort}) | Akteur1: ${x.actor1Geo || "-"} | gkg erstes: ${x.gkgErstesLand || "-"} | gkg häufigstes: ${x.gkgHaeufigstesLand || "-"}`);

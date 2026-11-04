// Runde 2, Aufgabe 4: Themen-Methoden vergleichen (Kürzel, Kürzel + Stichwort im Titel, Kürzel mit Mindestzahl im Artikel, Ereigniscodes).
import { loadEvents, loadGkg, GKG_SLOTS, stamps, norm, sample, rng } from "./load.mjs";
import { cleanTitle, tokens, jaccard, cname, titleMap } from "./common2.mjs";
import { DATA, cached } from "./lib.mjs";
import { gdeltUrl } from "./load.mjs";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const TOPICS = {
  konflikte: ["ARMEDCONFLICT"], diplomatie: ["NEGOTIATIONS", "CEASEFIRE"], sanktionen: ["SANCTIONS"],
  wahlen: ["ELECTION", "RESIGNATION"], energie: ["ENV_OIL", "ENV_NATURALGAS", "ENV_COAL"],
  maerkte: ["ECON_CENTRALBANK", "ECON_STOCKMARKET", "ECON_GOLDPRICE", "ECON_INTEREST_RATES"],
};
const KW = {
  konflikte: /\b(war|attack(s|ed)?|fighting|offensive|strikes?|killed|troops|missiles?|drones?|krieg|angriff|gefechte|offensive|truppen|raketen)\b/i,
  diplomatie: /\b(diplomacy|diplomatic|diplomats?|talks|summit|negotiat\w*|ceasefire|envoy|diplomatie|diplomatisch|gespräche|gipfel|verhandlung\w*|waffenruhe)/i,
  sanktionen: /\b(sanction\w*|embargo|tariffs?|sanktion\w*|zölle)/i,
  wahlen: /\b(election\w*|vote[sr]?|voting|ballot|campaign|coup|resign\w*|prime minister|wahl\w*|putsch|rücktritt|regierungsbildung|kanzler)/i,
  energie: /\b(oil|gas|energy|fuel|gasoline|diesel|coal|lithium|refiner\w*|öl|erdgas|energie\w*|benzin|kohle|rohstoff\w*)\b/i,
  maerkte: /\b(central bank|stocks?|shares|markets?|gold|interest rates?|inflation|fed|ecb|yen|dollar|nasdaq|dax|notenbank|börse|goldpreis|leitzins|inflation|aktien|kurs)\b/i,
};
const EVT = { konflikte: (e) => ["18", "19", "20"].includes(e.root), diplomatie: (e) => ["04", "05"].includes(e.root), sanktionen: (e) => /^(163|172)/.test(e.code) };
const MIN_COUNT = 3;

// Universum A: Artikel (deutsch + unübersetzt) aus den 5 Haupt-Zeitpunkten, Dubletten vorher entfernt
const all = GKG_SLOTS.flatMap((s) => loadGkg(s)).filter((r) => r.title && (r.lang === "unübersetzt" || r.lang === "deu"));
const seenUrl = new Set(), kept = [], toks = [];
const shuf = sample(all, all.length, 4242);
for (const r of shuf) {
  const k = norm(r.url); if (seenUrl.has(k)) continue; seenUrl.add(k);
  const t = tokens(cleanTitle(r.title)); let dup = false;
  if (t.size >= 4) for (const o of toks) if (jaccard(t, o) >= 0.8) { dup = true; break; }
  if (dup) continue; kept.push(r); toks.push(t);
}
const out = { artikelUniversum: all.length, nachDublettenEntfernung: kept.length, themen: {} };
const samples = {}, items = {};
const has = (r, codes) => codes.some((c) => r.themes.has(c));
const methods = {
  "M1 Kürzel": (r, k) => has(r, TOPICS[k]),
  "M2 Kürzel + Stichwort im Titel": (r, k) => has(r, TOPICS[k]) && KW[k].test(r.title),
  [`M3 Kürzel, mindestens ${MIN_COUNT} Vorkommen im Artikel`]: (r, k) => TOPICS[k].reduce((s, c) => s + (r.themeCounts.get(c) ?? 0), 0) >= MIN_COUNT,
};
for (const k of Object.keys(TOPICS)) {
  out.themen[k] = {};
  for (const [mn, f] of Object.entries(methods)) {
    const hits = kept.filter((r) => f(r, k)); // Reihenfolge = eine gemeinsame Zufallsreihenfolge
    const s = hits.slice(0, 20);
    samples[`${k}|${mn}`] = s.map((r) => norm(r.url));
    for (const r of s) items[norm(r.url)] ??= { titel: r.title.slice(0, 150), domain: r.domain, sprache: r.lang };
    out.themen[k][mn] = { treffer: hits.length, davonDeutsch: hits.filter((r) => r.lang === "deu").length, stichprobe: s.length };
  }
}
// Mehrfachthemen je Methode
out.mehrfachthemen = {};
for (const [mn, f] of Object.entries(methods)) {
  let one = 0, two = 0, more = 0, any = 0;
  for (const r of kept) { const n = Object.keys(TOPICS).filter((k) => f(r, k)).length; if (n >= 1) any++; if (n === 1) one++; else if (n === 2) two++; else if (n >= 3) more++; }
  out.mehrfachthemen[mn] = { mitMindestEinemThema: any, genauEins: one, genauZwei: two, dreiOderMehr: more, anteilMehrfachProzent: any ? +(100 * (two + more) / any).toFixed(0) : null };
}
// Universum B: Ereignisse mit Titel (Zeitpunkte mit gkg-Titeln, keine nach Größe gewählten), Ereigniscodes
const trigSlots = existsSync(join(DATA, "trigger-sample20.json")) ? [...new Set(JSON.parse(readFileSync(join(DATA, "trigger-sample20.json"), "utf8")).map((x) => x.slot))] : [];
const rndSlots = existsSync(join(DATA, "random-slots.json")) ? JSON.parse(readFileSync(join(DATA, "random-slots.json"), "utf8")) : [];
const sampleSlots = [...new Set([...GKG_SLOTS, ...trigSlots, ...rndSlots])].filter((ts) => cached(gdeltUrl(ts, "gkg", "csv")));
const TM = titleMap(sampleSlots);
const { events } = loadEvents();
const evUniv = [...events.values()].filter((e) => sampleSlots.includes(e.slot) && TM.has(norm(e.url)));
const codeFreq = {}; for (const e of events.values()) if (/^(04|05|16|17)/.test(e.root)) { const c = e.code; codeFreq[c] = (codeFreq[c] ?? 0) + 1; }
out.ereigniscodesDiplomatieSanktionen = Object.fromEntries(Object.entries(codeFreq).sort((a, b) => b[1] - a[1]).slice(0, 30));
out.zeitpunkteFuerEreignisMethode = sampleSlots.length;
const seenS = new Set(), evKept = [], evToks = [];
for (const e of sample(evUniv, evUniv.length, 777)) {
  const key = norm(e.url); if (seenS.has(key)) continue; seenS.add(key);
  const title = TM.get(key).title; const t = tokens(cleanTitle(title)); let dup = false;
  if (t.size >= 4) for (const o of evToks) if (jaccard(t, o) >= 0.8) { dup = true; break; }
  if (dup) continue; evKept.push({ e, title, key }); evToks.push(t);
}
out.ereignisUniversum = { ereignisse: evUniv.length, nachDublettenEntfernung: evKept.length };
for (const [k, f] of Object.entries(EVT)) {
  const hits = evKept.filter((x) => f(x.e)); const s = hits.slice(0, 20);
  samples[`${k}|M4 Ereigniscodes`] = s.map((x) => x.key);
  for (const x of s) items[x.key] ??= { titel: x.title.slice(0, 150), domain: "", sprache: "unübersetzt", code: x.e.code, land: cname(x.e.country) };
  out.themen[k]["M4 Ereigniscodes"] = { treffer: hits.length, stichprobe: s.length };
}
writeFileSync(join(DATA, "topics2-samples.json"), JSON.stringify({ samples, items }, null, 1));
writeFileSync(join(DATA, "topics2-summary.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
console.log("einzigartige Titel in den Stichproben:", Object.keys(items).length);

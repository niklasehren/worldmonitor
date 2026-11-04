// Themenqualität auf gkg-Basis: Treffer je Thema über Themenkürzel, Stichprobe 20 je Thema (Deutsch + unübersetzt/Englisch).
import { loadGkg, GKG_SLOTS, sample } from "./load.mjs";
import { writeFileSync } from "node:fs";
import { DATA } from "./lib.mjs";
import { join } from "node:path";
const TOPICS = {
  konflikte: ["ARMEDCONFLICT"], diplomatie: ["NEGOTIATIONS", "CEASEFIRE"], sanktionen: ["SANCTIONS"],
  wahlen: ["ELECTION", "RESIGNATION"], energie: ["ENV_OIL", "ENV_NATURALGAS", "ENV_COAL"],
  maerkte: ["ECON_CENTRALBANK", "ECON_STOCKMARKET", "ECON_GOLDPRICE", "ECON_INTEREST_RATES"],
};
// Stichwort-Gegenprobe (nur Zählung, keine Qualitätsbewertung)
const KW = {
  konflikte: /\b(war|attack|fighting|offensive|krieg|angriff|gefechte)\b/i, diplomatie: /\b(diplomacy|diplomatic|peace talks|summit|diplomatie|friedensgespr|gipfeltreffen)/i,
  sanktionen: /\b(sanction|embargo|sanktion)/i, wahlen: /\b(election|coup|resigns?|new government|wahl|putsch|rücktritt|regierungsbildung)/i,
  energie: /\b(oil|natural gas|energy prices|lithium|öl|erdgas|energiepreis|rohstoff)/i, maerkte: /\b(central bank|stock market|gold|interest rates|notenbank|börse|goldpreis|leitzins)/i,
};
const all = GKG_SLOTS.flatMap((s) => loadGkg(s));
const uni = all.filter((r) => r.title && (r.lang === "unübersetzt" || r.lang === "deu"));
const langCount = {}; for (const r of all) langCount[r.lang] = (langCount[r.lang] ?? 0) + 1;
const res = { artikelGesamt: all.length, imUniversum_DE_EN: uni.length, sprachverteilungTop: Object.fromEntries(Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 8)), themen: {} };
const samples = {};
let seed = 100;
for (const [k, codes] of Object.entries(TOPICS)) {
  const hits = uni.filter((r) => codes.some((c) => r.themes.has(c)));
  const kw = uni.filter((r) => KW[k].test(r.title));
  const both = hits.filter((r) => KW[k].test(r.title)).length;
  const dom = new Set(hits.map((r) => r.domain));
  res.themen[k] = { treffer: hits.length, davonDeutsch: hits.filter((r) => r.lang === "deu").length, domainsVerschieden: dom.size, stichwortTreffer: kw.length, ueberlappung: both, anteilThemenTrefferMitStichwortImTitel: hits.length ? +(100 * both / hits.length).toFixed(0) : null };
  samples[k] = sample(hits, 20, seed++).map((r, i) => ({ nr: i + 1, titel: r.title.slice(0, 140), domain: r.domain, lang: r.lang, slot: r.slot, url: r.url }));
}
writeFileSync(join(DATA, "topic-sample.json"), JSON.stringify(samples, null, 1));
writeFileSync(join(DATA, "topic-counts.json"), JSON.stringify(res, null, 2));
console.log(JSON.stringify(res, null, 2));
for (const [k, s] of Object.entries(samples)) { console.log(`\n## ${k} (${s.length})`); for (const x of s) console.log(`${x.nr}. [${x.lang}] ${x.titel} (${x.domain})`); }

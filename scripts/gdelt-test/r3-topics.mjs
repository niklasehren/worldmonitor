// Runde 3, Aufgabe 4: Sanktionen (Stichwortlisten) und Märkte (Einzelaktien-Ausschluss). Nur Cache.
import { loadGkg, GKG_SLOTS, sample } from "./load.mjs";
import { cleanTitle } from "./common2.mjs";
import { DATA, cached } from "./lib.mjs";
import { gdeltUrl } from "./load.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const rnd = JSON.parse(readFileSync(join(DATA, "random-slots.json"), "utf8"));
const slots = [...new Set([...GKG_SLOTS, ...rnd])].filter((ts) => cached(gdeltUrl(ts, "gkg", "csv")));
const all = slots.flatMap((s) => loadGkg(s)).filter((r) => r.title && (r.lang === "unübersetzt" || r.lang === "deu"));
const seen = new Set(), rows = [];
for (const r of all) { const k = cleanTitle(r.title).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim(); if (seen.has(r.url) || seen.has("t:" + k)) continue; seen.add(r.url); seen.add("t:" + k); rows.push(r); }
const SK = /\b(sanction\w*|embargo\w*|tariffs?|export (ban|control)s?|import bans?|blacklist\w*|asset freeze|frozen assets|price cap|trade war|boycott\w*|sanktion\w*|zölle?|strafzoll\w*|handelskrieg|einfuhrverbot|exportverbot)\b/i;
const DIPLO_T = ["NEGOTIATIONS", "CEASEFIRE"], DIPLO_KW = /\b(diplomacy|diplomatic|diplomats?|talks|summit|negotiat\w*|ceasefire|envoy|diplomatie|diplomatisch|gespräche|gipfel|verhandlung\w*|waffenruhe)/i;
const isDiplo = (r) => DIPLO_T.some((c) => r.themes.has(c)) || DIPLO_KW.test(r.title);
const perDay = (n) => +(n * 96 / slots.length).toFixed(1);
const S = { stichwort: rows.filter((r) => SK.test(r.title)) };
S.stichwortPlusKuerzel = S.stichwort.filter((r) => r.themes.has("SANCTIONS"));
S.kuerzelAllein = rows.filter((r) => r.themes.has("SANCTIONS"));
S.stichwortUndDiplomatie = S.stichwort.filter(isDiplo);
S.stichwortOhneDiplomatie = S.stichwort.filter((r) => !isDiplo(r));
// Märkte
const MT = ["ECON_CENTRALBANK", "ECON_STOCKMARKET", "ECON_GOLDPRICE", "ECON_INTEREST_RATES"];
const MK = /\b(central bank|stocks?|shares|markets?|gold|interest rates?|inflation|fed|ecb|yen|dollar|nasdaq|dax|notenbank|börse|goldpreis|leitzins|aktien|kurs)\b/i;
const M2 = rows.filter((r) => MT.some((c) => r.themes.has(c)) && MK.test(r.title));
const EINZEL = /\b(earnings|q[1-4]\b|quarter\w*|price target|dividends?|eps|revenue|ipo|analysts?|rating|upgrades?|downgrades?|stake|position (in|raised|lowered|trimmed|boosted)|holdings?|shares (of|sold|bought|acquired)|stock (falls|rises|jumps|drops|surges|plunges|rallies|crashes)|(nasdaq|nyse|otc|tsx|asx|lon):\s?[A-Z]+|\([A-Z]{2,5}:[A-Z]{1,5}\)|aktie|quartalszahlen|kursziel|dividende)\b|\((?:NASDAQ|NYSE|OTC|TSX|ASX|LON)[^)]*\)/i;
const M2neu = M2.filter((r) => !EINZEL.test(r.title));
const show = (r) => `${r.title.replace(/\s+/g, " ").slice(0, 95)}  [${r.domain}]`;
const out = { slots: slots.length, artikelUniversum: all.length, nachDubletten: rows.length,
  sanktionen: Object.fromEntries(Object.entries(S).map(([k, v]) => [k, { treffer: v.length, proTagHochgerechnet: perDay(v.length) }])),
  maerkte: { M2: M2.length, M2proTag: perDay(M2.length), einzelaktieStichwort: M2.length - M2neu.length, anteilEinzel: +((M2.length - M2neu.length) / M2.length * 100).toFixed(1), nachFilter: M2neu.length, nachFilterProTag: perDay(M2neu.length) },
  proben: { sanktionenStichwort: sample(S.stichwort, 20, 61).map(show), sanktionenStichwortUndDiplo: sample(S.stichwortUndDiplomatie, 20, 62).map(show), sanktionenOhneDiplo: sample(S.stichwortOhneDiplomatie, 20, 63).map(show), maerkteVorher: sample(M2, 20, 64).map(show), maerkteNachher: sample(M2neu, 20, 65).map(show), maerkteAusgeschlossen: sample(M2.filter((r) => EINZEL.test(r.title)), 20, 66).map(show) } };
writeFileSync(join(DATA, "r3-topics.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ ...out, proben: undefined }, null, 1));
for (const [k, v] of Object.entries(out.proben)) { console.log("\n##", k); v.forEach((x, i) => console.log(i + 1, x)); }

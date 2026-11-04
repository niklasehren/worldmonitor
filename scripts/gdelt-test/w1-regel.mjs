// Runde 4, Teil 2: Regel-Entwurf v0 "wichtig" (transparent, nicht auf die 19 Noten optimiert). Nur Cache.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DATA } from "./lib.mjs";
import { sample } from "./load.mjs";
import { cname } from "./common2.mjs";
export const POS_THEMES = new Set(["NEGOTIATIONS", "CEASEFIRE", "SANCTIONS", "ALLIANCE", "MILITARY_COOPERATION", "SLFID_MILITARY_SPENDING", "SOC_DIPLOMRECOG", "ECON_TRADE_DISPUTE", "ECON_FREETRADE", "WB_698_TRADE", "ECON_STOCKMARKET", "ECON_CENTRALBANK", "ECON_INTEREST_RATES", "ECON_INFLATION", "ECON_OILPRICE", "ECON_DEBT", "ECON_BITCOIN", "TERROR", "MILITARY", "BORDER", "CYBER_ATTACK", "POLITICAL_TURMOIL", "UNREST_BELLIGERENT", "SOVEREIGNTY", "ENV_OIL", "ENV_NATURALGAS", "ECON_WORLDCURRENCIES_DOLLAR", "ECON_WORLDCURRENCIES_DOLLARS"]);
export const NEG_THEMES = /^(SOC_GENERALCRIME|ARREST|CRIME_|KIDNAP|TOURISM|SOC_SUSPICIOUSACTIVITY)/;
export const POS_KW = /\b(war|wars|missiles?|drones?|air ?strikes?|ceasefire|truce|talks|summit|treaty|nuclear|sanctions?|tariffs?|embargo|nato|foreign minister|diplomat\w*|ambassador|security council|g20|g7|opec|brent|oil price|central bank|ecb|fed|inflation|interest rates?|wall street|nasdaq|stock markets?|bond yields?|gdp|trade (deal|war|talks)|military|troops|navy|invasion|coup|blockade|hormuz|pentagon|kremlin|krieg|waffenruhe|gipfel|sanktion\w*|zölle|notenbank|börse)\b/i;
export const STRONG_KW = /\b(war|missiles?|drones?|air ?strikes?|ceasefire|nuclear|sanctions?|tariffs?|nato|military|invasion|coup|embargo)\b/i;
export const NEG_KW = /\b(arrested?|arrests|charged|murder\w*|stabb\w*|shoot\w*|police|sheriff|trial|lawsuit|jailed|sentenced|robbery|crash|dies|obituary|nhl|nfl|nba|mlb|ufc|football|soccer|tennis|cricket|rugby|golf|olympics?|wins|beats?|defeat|tournament|league|goal|season|movie|film|actor|actress|singer|album|concert|celebrity|star trek|theatre|halloween|deals?|sale|recipe|skin|beauty|fashion|horoscope|travel|wedding|sandwich|dentist|school|schools|teacher|students?|mayor|mayoral|governor|county|city council|ballot|candidates?|campaign|poll|polls|pledge|midterms?)\b/i;
// v0: Wachstum (m120 >= 5, durch W1 gegeben) UND nicht ausgeschlossen UND positiv
export function regel(p, mitEndungen = false) {
  const t = p.text; const themes = new Set(p.themes);
  const posT = [...themes].some((x) => POS_THEMES.has(x)) || (themes.has("ARMEDCONFLICT") && themes.has("MILITARY")); const posK = POS_KW.test(t);
  const negK = NEG_KW.test(t), negT = [...themes].some((x) => NEG_THEMES.test(x));
  let grund = "";
  if (p.m120 < 5) grund = "Wachstum < 5";
  else if (negK && !STRONG_KW.test(t)) grund = "Negativwort";
  else if (negT && !(posT || posK)) grund = "Negativthema ohne Positiv";
  else if (!(posT || posK)) grund = "kein Positivthema/-wort";
  else if (mitEndungen && p.tlds.length < 3) grund = "weniger als 3 Domain-Endungen";
  return { ok: grund === "", grund };
}
if (process.argv[2] === "anwenden") {
  const pool = JSON.parse(readFileSync(join(DATA, "w1-pool.json"), "utf8")); const byKey = new Map(pool.map((p) => [p.key, p]));
  const smp = JSON.parse(readFileSync(join(DATA, "w1-sample20.json"), "utf8")).pick; const notes = JSON.parse(readFileSync(join(DATA, "user-ratings.json"), "utf8")).noten;
  const r19 = smp.filter((p) => notes[p.nr] !== undefined).map((p) => ({ nr: p.nr, note: notes[p.nr], titel: p.titel, p: byKey.get(p.key) }));
  for (const mit of [false, true]) { let hi = 0, hiK = 0, lo = 0, loK = 0; const det = [];
    for (const r of r19) { const x = regel(r.p, mit); if (r.note >= 5) { hi++; if (x.ok) hiK++; } if (r.note <= 2) { lo++; if (x.ok) loK++; } det.push(`${r.nr}(${r.note}):${x.ok ? "bleibt" : "fällt: " + x.grund}`); }
    console.log(`\nRegel v0${mit ? " + Endungen>=3" : ""}: Note>=5: ${hiK} von ${hi} bleiben; Note<=2: ${loK} von ${lo} bleiben (${lo - loK} fallen weg)`); console.log(det.join("; ")); }
  const W1 = pool.filter((p) => p.lesbar && p.m120 >= 5); const tage = 2.91;
  for (const mit of [false, true]) { const k = W1.filter((p) => regel(p, mit).ok); const cls = {}; for (const p of k) cls[p.klasse] = (cls[p.klasse] ?? 0) + 1; const why = {}; for (const p of W1) { const x = regel(p, mit); if (!x.ok) why[x.grund] = (why[x.grund] ?? 0) + 1; }
    console.log(`\nPool W1 lesbar ${W1.length} (${(W1.length / tage).toFixed(0)}/Tag) -> v0${mit ? "+Endungen" : ""}: ${k.length} (${(k.length / tage).toFixed(1)}/Tag), Klassen ${JSON.stringify(cls)}, Ausschlussgründe ${JSON.stringify(why)}`); }
  // Liste 2: 40 Geschichten, nicht unter den 20, Seed 11
  const used = new Set(smp.map((p) => p.key)); const cand = pool.filter((p) => p.lesbar && p.m120 >= 5 && !used.has(p.key)).sort((a, b) => (a.key < b.key ? -1 : 1));
  const pick = sample(cand, 40, 11);
  const md = ["# Bewertungsliste 2 (W1, Seed 11)", "", "40 zufällige Geschichten aus dem W1-Pool (mindestens 5 Medien nach 120 Minuten, lesbarer Titel, gleiche Geschichten zusammengefasst), **ohne** die 20 aus Liste 1. Kein Urteil und kein Ergebnis einer Regel angegeben. Bitte jede Geschichte mit 0 bis 10 bewerten (10 = sehr wichtig für ein Nachrichtenportal zu Weltpolitik, Sicherheit, Wirtschaft).", "", "| Nr. | Titel | Land | Medien nach 30 / 120 Min. | Note (0–10) |", "|---|---|---|---|---|"];
  pick.forEach((p, i) => md.push(`| ${i + 1} | ${p.text.replace(/\|/g, "/").slice(0, 150)} | ${cname(p.land)} | ${p.m30} / ${p.m120} |  |`));
  writeFileSync(new URL("../../docs/bewertung-liste-2.md", import.meta.url), md.join("\n") + "\n");
  writeFileSync(join(DATA, "liste2-pick.json"), JSON.stringify(pick.map((p, i) => ({ nr: i + 1, key: p.key, titel: p.text, regelV0: regel(p).ok, regelGrund: regel(p).grund, regelV0Endungen: regel(p, true).ok })), null, 1));
  console.log("\nListe 2: Pool", cand.length); pick.forEach((p, i) => console.log(`${i + 1}. ${p.text.slice(0, 100)} | ${cname(p.land)} | ${p.m30}/${p.m120}`));
}

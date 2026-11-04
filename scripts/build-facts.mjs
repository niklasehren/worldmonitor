// build-facts.mjs: erzeugt public/data/facts.json (Länderfakten) aus zwei einmal geladenen Wikidata-Abfragen.
// Rohdateien (nicht im Git): data/fakten/wikidata-laender.json (Abfrage q.rq: Einwohner, Fläche) und
// data/fakten/wikidata-f2.json (Abfrage q2.rq: Hauptstadt deutsch/englisch, ISO-Codes der Amtssprachen und Währungen, Kontinente).
// Wikidata-Daten stehen unter CC0 (Public Domain). Sprachen und Währungen werden als Codes gespeichert (ISO 639, ISO 4217) und in der
// Oberfläche über Intl.DisplayNames in der gewählten Sprache benannt; Kontinente als Schlüssel (africa, europe, asia, north_america, south_america, oceania, antarctica).
// Hauptstadt: ein Text, wenn deutscher und englischer Name gleich sind, sonst [deutsch, englisch].
// Keine Politiker oder Amtsträger. Fehlt ein Feld, steht null (die Oberfläche zeigt "–"). Start: node scripts/build-facts.mjs
import { readFileSync, writeFileSync } from "node:fs";
const ROOT = new URL("../", import.meta.url).pathname;
const raw = JSON.parse(readFileSync(ROOT + "data/fakten/wikidata-laender.json", "utf8")).results.bindings;
const f2 = new Map(JSON.parse(readFileSync(ROOT + "data/fakten/wikidata-f2.json", "utf8")).results.bindings.map((r) => [r.iso.value, r]));
const dn = new Intl.DisplayNames(["de"], { type: "region" });
const dnL = ["de", "en"].map((l) => new Intl.DisplayNames([l], { type: "language" })), dnC = ["de", "en"].map((l) => new Intl.DisplayNames([l], { type: "currency" }));
const benannt = (dns, c) => dns.every((d) => { try { const n = d.of(c); return !!n && n !== c; } catch { return false; } });
const KONTINENT = { Q15: "africa", Q46: "europe", Q48: "asia", Q49: "north_america", Q18: "south_america", Q538: "oceania", Q55643: "oceania", Q51: "antarctica" };
const val = (r, k) => r?.[k]?.value?.trim() || "";
const liste = (s) => [...new Set(s.split(";").map((x) => x.trim()).filter((x) => x && !/^Q\d+$/.test(x)))];
const out = {};
let ohneName = 0, sprachenVerworfen = 0;
for (const r of raw) {
  const iso = val(r, "iso");
  if (!/^[A-Z]{2}$/.test(iso)) continue;
  let name; try { name = dn.of(iso); } catch { name = null; }
  if (!name || name === iso) { ohneName++; continue; }
  // Einwohner: neuester Eintrag (nach Datum); bei gleichem Datum der erste
  const pops = liste(val(r, "pops")).map((p) => { const [d, n] = p.split("|"); return { jahr: d && d !== "undefined" ? +d.slice(0, 4) : null, n: Math.round(+n) }; }).filter((p) => p.n > 0);
  pops.sort((a, b) => (b.jahr ?? 0) - (a.jahr ?? 0));
  const p = pops[0];
  const flaeche = val(r, "areaMax") ? Math.round(+val(r, "areaMax")) : null;
  const x = f2.get(iso);
  const caps = [...new Set(val(x, "caps").split(";").filter((c) => c.replace("|", "")).map((c) => { const [de, en] = c.split("|"); const d = de || en, e = en || de; return d === e ? d : JSON.stringify([d, e]); }))].map((c) => (c.startsWith("[") ? JSON.parse(c) : c));
  // mehrere Hauptstädte (z. B. Südafrika): je Sprache zusammen, höchstens 3
  const capDe = caps.slice(0, 3).map((c) => (Array.isArray(c) ? c[0] : c)).join(", "), capEn = caps.slice(0, 3).map((c) => (Array.isArray(c) ? c[1] : c)).join(", ");
  const alleSprachen = liste(val(x, "langs")), sprachen = alleSprachen.filter((c) => benannt(dnL, c));
  sprachenVerworfen += alleSprachen.length - sprachen.length;
  sprachen.sort((a, b) => a.length - b.length);
  const curs = liste(val(x, "curs")).filter((c) => /^[A-Z]{3}$/.test(c) && benannt(dnC, c));
  const conts = [...new Set(val(x, "conts").split(";").map((q) => KONTINENT[q.trim()]).filter(Boolean))];
  out[iso] = {
    hauptstadt: caps.length ? (capDe === capEn ? capDe : [capDe, capEn]) : null,
    einwohner: p ? { zahl: p.n, jahr: p.jahr } : null,
    flaeche: flaeche && flaeche > 0 ? flaeche : null,
    sprachen: sprachen.length ? sprachen.slice(0, 6) : null,
    waehrung: curs.length ? curs.slice(0, 2) : null,
    region: conts.length ? conts : null,
  };
}
const json = JSON.stringify({ quelle: "Wikidata (CC0)", abfrage: "2026-11-03 und 2026-11-04", laender: out });
writeFileSync(ROOT + "public/data/facts.json", json);
const fehlt = (k) => Object.values(out).filter((x) => x[k] == null).length;
console.log(JSON.stringify({ laender: Object.keys(out).length, bytes: Buffer.byteLength(json), ohneNameVerworfen: ohneName, sprachcodesOhneNamenVerworfen: sprachenVerworfen, hauptstadtZweisprachig: Object.values(out).filter((x) => Array.isArray(x.hauptstadt)).length, fehlt: Object.fromEntries(["hauptstadt", "einwohner", "flaeche", "sprachen", "waehrung", "region"].map((k) => [k, fehlt(k)])) }));
for (const k of ["DE", "MA", "IR", "KN", "KP", "CN", "PS", "XK", "EG", "ZA", "US", "TW"]) console.log(k, JSON.stringify(out[k]));

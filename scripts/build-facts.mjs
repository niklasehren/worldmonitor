// build-facts.mjs: erzeugt public/data/facts.json (Länderfakten) aus der einmal geladenen Wikidata-Abfrage.
// Rohdatei: data/fakten/wikidata-laender.json (Abfrage: data/fakten/q.rq, nicht im Git). Wikidata-Daten stehen unter CC0 (Public Domain).
// Felder je Land (ISO 3166-1 alpha-2): Hauptstadt, Einwohner (Zahl und Jahr), Fläche in km², Amtssprachen, Währung, Region (Kontinent).
// Keine Politiker oder Amtsträger. Fehlt ein Feld, steht null (die Oberfläche zeigt "–"). Start: node scripts/build-facts.mjs
import { readFileSync, writeFileSync } from "node:fs";
const ROOT = new URL("../", import.meta.url).pathname;
const raw = JSON.parse(readFileSync(ROOT + "data/fakten/wikidata-laender.json", "utf8")).results.bindings;
const dn = new Intl.DisplayNames(["de"], { type: "region" });
const val = (r, k) => r[k]?.value?.trim() || "";
const liste = (s) => [...new Set(s.split(";").map((x) => x.trim()).filter((x) => x && !/^Q\d+$/.test(x)))];
const out = {};
let ohneName = 0;
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
  const caps = liste(val(r, "caps")), langs = liste(val(r, "langs")), curs = liste(val(r, "curs")), conts = liste(val(r, "conts"));
  out[iso] = {
    name,
    hauptstadt: caps.length ? caps.slice(0, 3).join(", ") : null,
    einwohner: p ? { zahl: p.n, jahr: p.jahr } : null,
    flaeche: flaeche && flaeche > 0 ? flaeche : null,
    sprachen: langs.length ? langs.slice(0, 6) : null,
    waehrung: curs.length ? curs.slice(0, 2).join(", ") : null,
    region: conts.length ? conts.join(" / ") : null,
  };
}
const json = JSON.stringify({ quelle: "Wikidata (CC0)", abfrage: "2026-11-03", laender: out });
writeFileSync(ROOT + "public/data/facts.json", json);
const fehlt = (k) => Object.values(out).filter((x) => x[k] == null).length;
console.log(JSON.stringify({ laender: Object.keys(out).length, bytes: Buffer.byteLength(json), ohneNameVerworfen: ohneName, fehlt: Object.fromEntries(["hauptstadt", "einwohner", "flaeche", "sprachen", "waehrung", "region"].map((k) => [k, fehlt(k)])) }));
for (const k of ["DE", "MA", "IR", "KN", "KP", "CN", "PS", "XK", "EG"]) console.log(k, JSON.stringify(out[k]));

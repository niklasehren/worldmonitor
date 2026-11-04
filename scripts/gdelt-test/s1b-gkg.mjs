// Etappe 1b: ein gkg-Paar (gkg + translation.gkg) laden, Größe und Felder messen. Nur Text lesen.
import { get, cachePath, stats } from "./lib.mjs";
import { execFileSync } from "node:child_process";

const ts = process.argv[2] ?? "20261101030000";
const THEMES = { konflikte: ["ARMEDCONFLICT"], diplomatie: ["NEGOTIATIONS", "CEASEFIRE"], sanktionen: ["SANCTIONS"], wahlen: ["ELECTION", "RESIGNATION"], energie: ["ENV_OIL", "ENV_NATURALGAS", "ENV_COAL"], maerkte: ["ECON_CENTRALBANK", "ECON_STOCKMARKET", "ECON_GOLDPRICE", "ECON_INTEREST_RATES"] };
const result = {};
for (const kind of ["gkg", "translation.gkg"]) {
  const url = `http://data.gdeltproject.org/gdeltv2/${ts}.${kind}.csv.zip`;
  const r = await get(url);
  if (r.ok === false) { result[kind] = { fehler: r.error }; continue; }
  const txt = execFileSync("unzip", ["-p", cachePath(url)], { maxBuffer: 1 << 30 }).toString("utf8");
  const rows = txt.split("\n").filter(Boolean).map((l) => l.split("\t"));
  const colCounts = [...new Set(rows.map((c) => c.length))];
  const ne = (i) => rows.filter((c) => (c[i] ?? "").trim() !== "").length;
  const title = (c) => (c[26] ?? "").match(/<PAGE_TITLE>([\s\S]*?)<\/PAGE_TITLE>/)?.[1];
  const langs = {};
  for (const c of rows) { const m = (c[25] ?? "").match(/srclc:([a-z]+)/); const k = m ? m[1] : "(leer)"; langs[k] = (langs[k] ?? 0) + 1; }
  const themeHits = {};
  for (const [k, codes] of Object.entries(THEMES)) themeHits[k] = rows.filter((c) => codes.some((t) => (c[8] ?? "").split(";").some((x) => x.split(",")[0] === t))).length;
  const sample = rows.filter((c) => title(c)).slice(0, 3).map((c) => ({ domain: c[3], url: c[4], title: title(c)?.slice(0, 100), themes: (c[8] ?? "").split(";").slice(0, 3).map((x) => x.split(",")[0]), locations: (c[10] ?? "").split(";").slice(0, 2).map((x) => x.split("#").slice(1, 3).join("/")), translationInfo: c[25] }));
  result[kind] = { zipBytes: r.bytes, textBytes: Buffer.byteLength(txt), rows: rows.length, columnCounts: colCounts,
    nichtLeer: { Domain: ne(3), URL: ne(4), Themen: ne(8), Orte: ne(10), Personen: ne(12), Ton: ne(15), Uebersetzungsinfo: ne(25), SeitenTitel: rows.filter((c) => title(c)).length },
    sprachen: Object.fromEntries(Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 8)), themenTreffer: themeHits, beispiele: sample };
}
console.log(JSON.stringify(result, null, 2));
console.log(stats());

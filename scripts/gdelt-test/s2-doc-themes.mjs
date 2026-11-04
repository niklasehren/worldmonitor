// Etappe 2: DOC 2.0 ArtList, 6 Themen x 2 Varianten x 2 Sprachen = 24 Abfragen, 24 Std., max. 250 Treffer.
import { get, readText, stats, log } from "./lib.mjs";
import { TOPICS, LANGS, docUrl } from "./queries.mjs";

const rows = [];
for (const t of TOPICS) for (const v of ["A", "B"]) for (const lang of LANGS) {
  const query = v === "A" ? t.A : t.B[lang];
  const url = docUrl(query, lang, { mode: "ArtList", maxrecords: "250", timespan: "24h", sort: "DateDesc" });
  const r = await get(url);
  let n = null, note = "";
  if (r.ok === false) note = r.error;
  else {
    const txt = readText(url);
    try { n = (JSON.parse(txt).articles ?? []).length; } catch { note = "keine JSON-Antwort: " + txt.slice(0, 120).replace(/\s+/g, " "); }
  }
  rows.push({ topic: t.key, v, lang, n, note });
  log(`${t.key} ${v} ${lang}: ${n ?? "-"} Treffer ${note}`);
}
console.table(rows);
console.log(stats());

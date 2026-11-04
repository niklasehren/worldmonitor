// Auswertung der Themen-Einschätzungen (Artikelmethoden M1-M3; M4 wird separat ergänzt).
import { readFileSync, writeFileSync } from "node:fs";
import { DATA } from "./lib.mjs";
import { join } from "node:path";
const d = JSON.parse(readFileSync(join(DATA, "topics2-samples.json"), "utf8"));
const L = JSON.parse(readFileSync(new URL("./topics2-labels.json", import.meta.url), "utf8"));
const out = {}; const order = {};
for (const t of Object.keys(L)) {
  if (t.startsWith("_")) continue;
  const seen = []; // einzigartige Titel in Reihenfolge M1, M2, M3
  for (const [key, lst] of Object.entries(d.samples)) { const [tt, m] = key.split("|"); if (tt !== t || m.startsWith("M4")) continue; for (const u of lst) if (!seen.includes(u)) seen.push(u); }
  if (seen.length !== L[t].length) throw new Error(`${t}: ${seen.length} Titel, ${L[t].length} Urteile`);
  const lab = Object.fromEntries(seen.map((u, i) => [u, L[t][i]]));
  order[t] = lab; out[t] = {};
  for (const [key, lst] of Object.entries(d.samples)) {
    const [tt, m] = key.split("|"); if (tt !== t || m.startsWith("M4")) continue;
    const c = { P: 0, U: 0, N: 0 }; for (const u of lst) c[lab[u]]++;
    out[t][m] = { stichprobe: lst.length, passt: c.P, unklar: c.U, passtNicht: c.N, fehlerquoteProzent: lst.length ? +(100 * c.N / lst.length).toFixed(0) : null, nichtEindeutigProzent: lst.length ? +(100 * (c.N + c.U) / lst.length).toFixed(0) : null };
  }
}
writeFileSync(join(DATA, "topics2-judgment-articles.json"), JSON.stringify({ out, labels: order }, null, 1));
for (const [t, ms] of Object.entries(out)) { console.log("\n" + t); for (const [m, v] of Object.entries(ms)) console.log(`  ${m.slice(0, 40).padEnd(42)} n=${String(v.stichprobe).padStart(2)}  passt ${v.passt} / unklar ${v.unklar} / nicht ${v.passtNicht}  -> Fehler ${v.fehlerquoteProzent}%  (nicht eindeutig ${v.nichtEindeutigProzent}%)`); }

// Einschätzung des Modells zu den 20 Stichproben-Auslösern (nur nach Titel): P = frisches schweres Gewalt-/Militärereignis, N = nein, U = unklar.
import { readFileSync, writeFileSync } from "node:fs";
import { DATA } from "./lib.mjs";
import { join } from "node:path";
const L = "NNNPNNNPNPNNNPPNUNNN";
const S = JSON.parse(readFileSync(join(DATA, "trigger-sample20-titles.json"), "utf8"));
if (L.length !== S.length) throw new Error("Länge");
const rows = S.map((x, i) => ({ ...x, urteil: L[i] }));
const sum = { gesamt: { P: 0, U: 0, N: 0 }, nachKlasse: {} };
for (const r of rows) { sum.gesamt[r.urteil]++; (sum.nachKlasse[r.klasse] ??= { P: 0, U: 0, N: 0 })[r.urteil]++; }
writeFileSync(join(DATA, "trigger-judgment.json"), JSON.stringify({ summe: sum, zeilen: rows }, null, 1));
console.log(JSON.stringify(sum));

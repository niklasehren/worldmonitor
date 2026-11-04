import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DATA } from "./lib.mjs";
import { hash } from "./r3common.mjs";
const menge = process.argv[2], N = +process.argv[3] || 40;
const { list } = JSON.parse(readFileSync(join(DATA, "e1-stories.json"), "utf8"));
const pick = new Map();
for (const v of ["D1", "B", "C"]) { const l = list.filter((r) => r.menge === menge && r.vars.includes(v)).sort((a, b) => hash(a.key, 99) - hash(b.key, 99)); const need = v === "D1" ? l.length : N; let have = [...pick.values()].filter((r) => r.vars.includes(v)).length; for (const r of l) { if (have >= need) break; if (!pick.has(r.key)) { pick.set(r.key, r); have++; } } }
const arr = [...pick.values()].sort((a, b) => hash(a.key, 5) - hash(b.key, 5));
writeFileSync(join(DATA, `e1-${menge}-auswahl.json`), JSON.stringify(arr.map((r, i) => ({ nr: i + 1, key: r.key })), null, 1));
arr.forEach((r, i) => console.log(`${i + 1} [${r.vars.join("")}] ${r.klasse[0]}/${r.land.slice(0, 10)}/${r.n60}/${r.code} ${r.quelle[0]}: ${r.text.replace(/\s+/g, " ").slice(0, 105)}`));
console.log("Anzahl", arr.length);

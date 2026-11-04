import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DATA } from "./lib.mjs";
import { wilson, pct } from "./r3common.mjs";
import { ausgeschlossen } from "./e1-filter.mjs";
const menge = process.argv[2];
const { list, tage } = JSON.parse(readFileSync(join(DATA, "e1-stories.json"), "utf8"));
const by = Object.fromEntries(list.map((r) => [r.key, r]));
const sel = JSON.parse(readFileSync(join(DATA, `e1-${menge}-auswahl.json`), "utf8"));
const lab = JSON.parse(readFileSync(new URL("./e1-labels.json", import.meta.url), "utf8"))[menge];
if (lab.length !== sel.length) throw new Error(`Labels ${lab.length} != ${sel.length}`);
const rows = sel.map((s, i) => ({ ...by[s.key], l: lab[i] }));
const fmt = (k, n) => { const [a, b] = wilson(k, n); return `${k}/${n} = ${pct(k / n)} (95 %: ${pct(a)}–${pct(b)})`; };
for (const v of ["B", "C", "D1"]) {
  const r = rows.filter((x) => x.vars.includes(v)); const keep = r.filter((x) => !ausgeschlossen(x.text));
  const c = (a, ch) => a.filter((x) => x.l === ch).length;
  const all = list.filter((x) => x.menge === menge && x.vars.includes(v)); const allKeep = all.filter((x) => !ausgeschlossen(x.text));
  console.log(`\n${menge} ${v}: beurteilt ${r.length}; P ${c(r, "P")} U ${c(r, "U")} N ${c(r, "N")}`);
  console.log(`  Fehlalarm N vorher: ${fmt(c(r, "N"), r.length)}; N+U: ${fmt(c(r, "N") + c(r, "U"), r.length)}`);
  console.log(`  nach Filter: übrig ${keep.length}; P ${c(keep, "P")} U ${c(keep, "U")} N ${c(keep, "N")}; N: ${fmt(c(keep, "N"), keep.length)}; N+U: ${fmt(c(keep, "N") + c(keep, "U"), keep.length)}`);
  console.log(`  ausgeschlossen ${r.length - keep.length}: davon P ${c(r.filter((x) => ausgeschlossen(x.text)), "P")} (verlorene echte Treffer), N ${c(r.filter((x) => ausgeschlossen(x.text)), "N")}`);
  const nb = (a) => a.filter((x) => x.klasse === "basis").length;
  console.log(`  Menge gesamt (${menge}): ${all.length} -> nach Filter ${allKeep.length}; Basisanteil vorher ${nb(all)}/${all.length}, nachher ${nb(allKeep)}/${allKeep.length}; Auslöser/Tag (Menge ist ~Hälfte der Tage-Geschichten, auf ganze Menge hochgerechnet ×2): vorher ${(all.length * 2 / tage).toFixed(1)}, nachher ${(allKeep.length * 2 / tage).toFixed(1)}`);
}
if (process.argv[3] === "beispiele") {
  const ok = rows.filter((x) => x.l === "P" && x.klasse === "basis" && !ausgeschlossen(x.text));
  console.log("\nECHTE TREFFER Basisländer:"); ok.slice(0, 8).forEach((x) => console.log(`  ${x.text.slice(0, 90)} | ${x.land} | ${x.n60} Medien | Code ${x.code} | ${x.quelle}`));
  const fa = rows.filter((x) => x.l === "N" && !ausgeschlossen(x.text));
  console.log("FEHLALARME trotz Liste:"); fa.slice(0, 8).forEach((x) => console.log(`  ${x.text.slice(0, 90)} | ${x.land} | ${x.n60} Medien | Code ${x.code} | ${x.quelle}`));
}

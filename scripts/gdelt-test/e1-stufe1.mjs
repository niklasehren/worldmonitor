// E1 Stufe 1: Filter an Cache-Tag 1 und 2 einstellen (Tag 3 wird hier NICHT ausgegeben). Gibt Stichproben zum Beurteilen aus.
import { loadContext, bauePipeline, anzeigbar, endMin } from "../lib/pipeline-cache.mjs";
import { sample } from "./load.mjs";
import { writeFileSync } from "node:fs";
const ctx = loadContext();
const days = [[endMin - 72 * 60, endMin - 48 * 60, "T1"], [endMin - 48 * 60, endMin - 24 * 60, "T2"]];
const out = {};
for (const [a, b, name] of days) {
  const P = bauePipeline(ctx, a, b, { laender: false, pool: 1000 });
  const aus = P.global.filter((c) => c.grund && c.lesbar), keep = anzeigbar(P.global).slice(0, 60);
  out[name] = { ausgeschlossen: sample(aus, 40, 11).map((c) => ({ g: c.grund + (c.detail ? " " + c.detail : ""), m: c.medien, t: c.lesbar.slice(0, 120) })), behalten: sample(keep, 40, 12).map((c) => ({ m: c.medien, t: c.lesbar.slice(0, 120) })), gesamt: { pool: P.global.length, ausgeschlossen: P.global.filter((c) => c.grund).length, ohneText: P.global.filter((c) => !c.grund && !c.lesbar).length } };
  console.log("=====", name, JSON.stringify(out[name].gesamt));
  console.log("-- AUSGESCHLOSSEN (40 Stichprobe)"); out[name].ausgeschlossen.forEach((x, i) => console.log(i, `[${x.g}]`, x.m, x.t));
  console.log("-- BEHALTEN (40 Stichprobe aus Top 60)"); out[name].behalten.forEach((x, i) => console.log(i, x.m, x.t));
}
writeFileSync(new URL("../../data/e1-stufe1.json", import.meta.url).pathname, JSON.stringify(out, null, 1));

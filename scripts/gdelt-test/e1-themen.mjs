// E1: Welche GKG-Themen treten bei Treffern der Wortlisten gehäuft auf? (nur Cache)
import { ladeAusschluss } from "../lib/pipeline-cache.mjs";
import { loadTitles } from "./r3common.mjs";
const TM = loadTitles();
const kat = ladeAusschluss();
const rows = [...TM.values()].filter((r) => r.title);
const total = rows.length, tcount = new Map();
for (const r of rows) for (const t of r.themes) tcount.set(t, (tcount.get(t) ?? 0) + 1);
console.log("gkg-Zeilen mit Titel:", total);
for (const [name, k] of Object.entries(kat)) {
  const hit = rows.filter((r) => k.woerter?.test(r.title));
  const c = new Map(); for (const r of hit) for (const t of r.themes) c.set(t, (c.get(t) ?? 0) + 1);
  const lift = [...c.entries()].filter(([t, n]) => n >= Math.max(5, hit.length * 0.04)).map(([t, n]) => ({ t, n, anteilTreffer: +(n / hit.length).toFixed(2), anteilAlle: +(tcount.get(t) / total).toFixed(3), lift: +((n / hit.length) / (tcount.get(t) / total)).toFixed(1) })).sort((a, b) => b.lift - a.lift).slice(0, 12);
  console.log("\n##", name, "Treffer:", hit.length); for (const l of lift) console.log(" ", JSON.stringify(l));
}

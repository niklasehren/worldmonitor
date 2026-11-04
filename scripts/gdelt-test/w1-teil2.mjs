// Runde 4, Teil 2: Vergleich mit Nutzernoten, Merkmale, Regel-Entwurf v0. Nur Cache.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DATA } from "./lib.mjs";
import { cname } from "./common2.mjs";
const pool = JSON.parse(readFileSync(join(DATA, "w1-pool.json"), "utf8"));
const smp = JSON.parse(readFileSync(join(DATA, "w1-sample20.json"), "utf8")).pick;
const notes = JSON.parse(readFileSync(join(DATA, "user-ratings.json"), "utf8")).noten;
const mine = Object.fromEntries(JSON.parse(readFileSync(join(DATA, "w1-judgment-claude.json"), "utf8")).urteile.map((u) => [u.nr, u.urteil[0] === "p" && u.urteil.startsWith("passt nicht") ? "N" : u.urteil === "passt" ? "P" : "N" === u.urteil ? "N" : u.urteil === "unklar" ? "U" : "N"]));
const toPUN = (n) => (n >= 6 ? "P" : n >= 3 ? "U" : "N");
const byKey = new Map(pool.map((p) => [p.key, p]));
const rows = smp.filter((p) => notes[p.nr] !== undefined).map((p) => ({ ...p, note: notes[p.nr], user: toPUN(notes[p.nr]), mine: mine[p.nr], po: byKey.get(p.key) }));
export { rows, pool };
if (process.argv[2] === "vergleich") {
  let eq = 0, eqb = 0; const dev = [];
  for (const r of rows) { if (r.user === r.mine) eq++; if ((r.user === "P") === (r.mine === "P")) eqb++; else dev.push(r); }
  console.log("n", rows.length, "Dreier", eq, "passt/nicht", eqb);
  for (const r of rows) if (r.user !== r.mine) console.log(`${r.nr}. ${r.titel.slice(0, 80)} | Note ${r.note} (${r.user}) | mein Urteil ${r.mine}`);
  // Rangkorrelation Note ~ mein Urteil (P=2,U=1,N=0)
  const rank = (a) => { const idx = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]); const r = Array(a.length); let i = 0; while (i < idx.length) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; const avg = (i + j) / 2 + 1; for (let k = i; k <= j; k++) r[idx[k][1]] = avg; i = j + 1; } return r; };
  const x = rank(rows.map((r) => r.note)), y = rank(rows.map((r) => ({ P: 2, U: 1, N: 0 })[r.mine])); const mx = x.reduce((a, b) => a + b) / x.length, my = y.reduce((a, b) => a + b) / y.length;
  const cov = x.reduce((a, v, i) => a + (v - mx) * (y[i] - my), 0), sx = Math.sqrt(x.reduce((a, v) => a + (v - mx) ** 2, 0)), sy = Math.sqrt(y.reduce((a, v) => a + (v - my) ** 2, 0)); console.log("Spearman Note vs mein Urteil:", (cov / (sx * sy)).toFixed(2));
}
if (process.argv[2] === "merkmale") {
  console.log("nr note m30 m120 domains tlds land | Themen (ohne TAX_FNCACT/WB_/EPU_/UNGP)");
  const show = (t) => t.filter((x) => !/^(TAX_|WB_|EPU_|UNGP_|SOC_POINTS|MEDIA_|GENERAL_GOV|USPEC)/.test(x)).slice(0, 14).join(" ");
  for (const r of [...rows].sort((a, b) => b.note - a.note)) console.log(`${r.nr} ${r.note} ${r.po.m30} ${r.po.m120} ${r.po.nDomains} ${r.po.tlds.length} ${cname(r.po.land)} | ${show(r.po.themes)}`);
  const grp = (f) => rows.filter(f); const hi = grp((r) => r.note >= 6), lo = grp((r) => r.note <= 2);
  const avg = (a, f) => (a.reduce((s, r) => s + f(r), 0) / a.length).toFixed(1);
  for (const [n, g] of [["Note>=6", hi], ["Note<=2", lo], ["Note 3-<6", grp((r) => r.note >= 3 && r.note < 6)]]) console.log(n, "n", g.length, "Mittel m30", avg(g, (r) => r.po.m30), "m120", avg(g, (r) => r.po.m120), "Domains", avg(g, (r) => r.po.nDomains), "Endungen", avg(g, (r) => r.po.tlds.length));
  const cnt = (g) => { const c = {}; for (const r of g) for (const t of new Set(r.po.themes)) if (!/^(TAX_FNCACT|WB_|EPU_|UNGP_|SOC_POINTS)/.test(t)) c[t] = (c[t] ?? 0) + 1; return c; };
  const ch = cnt(hi), cl = cnt(lo); console.log("Themen bei Note>=6 (Anzahl von", hi.length, "):", Object.entries(ch).filter(([, v]) => v >= 3).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => k + ":" + v).join(" "));
  console.log("Themen bei Note<=2 (Anzahl von", lo.length, "):", Object.entries(cl).filter(([, v]) => v >= 4).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => k + ":" + v).join(" "));
  const x = rows.map((r) => r.note); const corr = (f) => { const y = rows.map(f); const mx = x.reduce((a, b) => a + b) / x.length, my = y.reduce((a, b) => a + b) / y.length; const c = x.reduce((a, v, i) => a + (v - mx) * (y[i] - my), 0); return (c / Math.sqrt(x.reduce((a, v) => a + (v - mx) ** 2, 0) * y.reduce((a, v) => a + (v - my) ** 2, 0))).toFixed(2); };
  console.log("Pearson Note~m30", corr((r) => r.po.m30), "~m120", corr((r) => r.po.m120), "~log m120", corr((r) => Math.log(r.po.m120)), "~Domains", corr((r) => r.po.nDomains), "~Endungen", corr((r) => r.po.tlds.length));
}

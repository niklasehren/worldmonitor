// Runde 3, Aufgabe 3: Schwellen 0,5/0,6/0,7/0,8 für Titelähnlichkeit, ohne und mit Eigennamen-Vergleich.
import { loadEvents, min, stamps, norm, sample } from "./load.mjs";
import { buildGroups } from "./stories.mjs";
import { tokens, jaccard, slugText, cleanTitle } from "./common2.mjs";
import { loadTitles } from "./r3common.mjs";
import { DATA } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const { events, mentions } = loadEvents();
const groups = buildGroups(events, mentions);
const TM = loadTitles();
const last = min(stamps.at(-1));
const cuts = [0, 6, 12, 18, 24, 30].map((h) => last - h * 60);
const names = (t) => new Set((t.match(/\b[A-ZÄÖÜ][\p{L}'-]{2,}/gu) ?? []).slice(1).map((x) => x.toLowerCase()));
function pool(cut) {
  const rows = [];
  for (const g of groups.values()) {
    if (!g.ms.length || g.ms[0].tm > cut) continue;
    let latest = -1; const srcs = new Set(); for (const m of g.ms) { if (m.tm > cut) break; srcs.add(m.src); latest = m.tm; }
    if (cut - latest > 1440) continue;
    rows.push({ key: g.key, M: srcs.size, srcs, latest, url: g.rep.url });
  }
  rows.sort((a, b) => b.M - a.M);
  return rows.slice(0, 150).map((r) => { const t = TM.get(norm(r.url))?.title; const text = t ? cleanTitle(t) : slugText(r.url); return { ...r, text, hasT: !!t, tk: tokens(text), nm: names(text) }; });
}
function merge(rows, thr, useNames) {
  const par = rows.map((_, i) => i); const find = (i) => (par[i] === i ? i : (par[i] = find(par[i])));
  const pairs = [];
  for (let i = 0; i < rows.length; i++) { if (rows[i].tk.size < 4) continue; for (let j = i + 1; j < rows.length; j++) { if (rows[j].tk.size < 4) continue; const jc = jaccard(rows[i].tk, rows[j].tk); if (jc < thr) continue;
    if (useNames && rows[i].hasT && rows[j].hasT) { let sh = 0; for (const n of rows[i].nm) if (rows[j].nm.has(n)) sh++; if (sh < 1) continue; }
    if (find(i) !== find(j)) pairs.push({ i, j, jc }); par[find(j)] = find(i); } }
  const gs = new Map(); rows.forEach((r, i) => { const k = find(i); (gs.get(k) ?? gs.set(k, []).get(k)).push(r); });
  const merged = [...gs.values()].map((g) => { const srcs = new Set(); g.forEach((r) => r.srcs.forEach((s) => srcs.add(s))); return { M: srcs.size, members: g, text: g.reduce((a, b) => (b.M > a.M ? b : a)).text }; }).sort((a, b) => b.M - a.M);
  return { merged, pairs };
}
const out = { schwellen: {}, top20: {} };
const THR = [0.5, 0.6, 0.7, 0.8];
const allPairs = {}; // für Stichprobe: Paare im Band
for (const useNames of [false, true]) for (const thr of THR) {
  const key = `${thr}${useNames ? " mit Namen" : ""}`; const per = [];
  for (const cut of cuts) {
    const rows = pool(cut); const { merged, pairs } = merge(rows, thr, useNames);
    const top = merged.slice(0, 20); let dup = 0;
    for (let a = 0; a < top.length; a++) for (let b = a + 1; b < top.length; b++) if (jaccard(tokens(top[a].text), tokens(top[b].text)) >= 0.4) dup++;
    per.push({ gruppen: merged.length, zusammengefuehrt: rows.length - merged.length, top20Paare_Aehnlichkeit_ab_0_4: dup, top20Verschiedene: top.length });
    if (!useNames && cut === cuts[0]) out.top20[key] = top.map((g) => `${g.members.length}x M${g.M} ${g.text.slice(0, 80)}`);
    if (!useNames) for (const p of pairs) { const a = rows[p.i], b = rows[p.j]; const band = p.jc >= 0.8 ? 0.8 : p.jc >= 0.7 ? 0.7 : p.jc >= 0.6 ? 0.6 : 0.5; (allPairs[band] ??= []).push({ jc: +p.jc.toFixed(2), a: a.text.slice(0, 90), b: b.text.slice(0, 90), ta: a.hasT, tb: b.hasT }); }
  }
  out.schwellen[key] = per;
}
// Stichprobe je Band (nur Paare, die erst bei dieser Schwelle zusammengeführt werden)
out.stichprobe = {}; for (const b of [0.5, 0.6, 0.7, 0.8]) { const uniq = new Map(); for (const p of allPairs[b] ?? []) uniq.set(p.a + "|" + p.b, p); out.stichprobe[b] = { anzahlPaareGesamt: uniq.size, paare: sample([...uniq.values()], 20, 500 + b * 10) }; }
writeFileSync(join(DATA, "r3-merge.json"), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out.schwellen)) console.log(k, "Gruppen je Zeitpunkt:", v.map((x) => x.gruppen).join(","), "| zusammengeführt:", v.map((x) => x.zusammengefuehrt).join(","), "| Rest-Paare Top20:", v.map((x) => x.top20Paare_Aehnlichkeit_ab_0_4).join(","));
for (const [b, s] of Object.entries(out.stichprobe)) console.log("Band", b, "Paare gesamt", s.anzahlPaareGesamt);

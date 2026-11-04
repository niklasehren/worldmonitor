// Runde 2, Aufgaben 1 und 2: Geschichten zusammenfassen, Ranking-Varianten, regionale Spitzenmeldung, verdecktes Blatt 2.
import { loadEvents, min, stamps, norm, rng } from "./load.mjs";
import { buildGroups } from "./stories.mjs";
import { mergeSimilar, slugText, cleanTitle, titleMap, classOf, fmtLand, primary, cname } from "./common2.mjs";
import { region } from "./stories.mjs";
import { DATA } from "./lib.mjs";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const FAC = { weit: { hoch: 2, erhoeht: 1.5, basis: 1 }, eng: { hoch: 1.5, erhoeht: 1.25, basis: 1 } };
const REGIONEN = ["Nordamerika", "Lateinamerika und Karibik", "Europa", "Naher Osten und Nordafrika", "Afrika (inkl. Sudan)", "Asien (inkl. Kaukasus, Zentralasien)", "Ozeanien"];
const gOf = (countries, fs) => Math.max(fs.basis, ...Object.keys(countries).map((c) => fs[classOf(c)] ?? fs.basis));
const { events, mentions } = loadEvents();
const groups = buildGroups(events, mentions);
const last = min(stamps[stamps.length - 1]);
const cuts = [0, 6, 12, 18].map((h) => last - h * 60);
const cand = existsSync(join(DATA, "story-candidates.json")) ? JSON.parse(readFileSync(join(DATA, "story-candidates.json"), "utf8")) : { cands: [] };
const candSlots = [...new Set(cand.cands.map((c) => c.repSlot))];
const haveSlot = (ts) => existsSync(join(DATA, "raw")) && true;
const TM = titleMap(candSlots); // echte Titel aus bereits geladenen gkg-Dateien
const titleOfRep = (r) => TM.get(norm(r.rep.url))?.title ?? null;

function rowsAt(cut) {
  const rows = [];
  for (const g of groups.values()) {
    if (!g.ms.length || g.ms[0].tm > cut) continue;
    let latest = -1; const srcs = new Set();
    for (const m of g.ms) { if (m.tm > cut) break; srcs.add(m.src); latest = m.tm; }
    if (cut - latest > 1440) continue;
    rows.push({ key: g.key, srcs, latest, countries: g.countries, rep: g.rep, nEvents: g.evIds.length });
  }
  return rows;
}
const score = (r, cut, scale, fac) => (scale === "roh" ? r.srcs.size : Math.log(1 + r.srcs.size)) * gOf(r.countries, FAC[fac]) * Math.pow(0.5, (cut - r.latest) / 720);
const topBy = (rows, cut, scale, fac, n) => [...rows].sort((a, b) => score(b, cut, scale, fac) - score(a, cut, scale, fac)).slice(0, n);
const regionOfRow = (r) => region(primary(r.countries));
function regionWinners(rows) { const w = {}; for (const r of rows) { const reg = regionOfRow(r); if (!REGIONEN.includes(reg)) continue; if (!w[reg] || r.srcs.size > w[reg].srcs.size) w[reg] = r; } return w; }
function list20(rows, cut, scale, fac, regional) {
  const ranked = [...rows].sort((a, b) => score(b, cut, scale, fac) - score(a, cut, scale, fac));
  if (!regional) return ranked.slice(0, 20);
  const win = Object.values(regionWinners(rows)); const keys = new Set(win.map((r) => r.key));
  return [...win, ...ranked.filter((r) => !keys.has(r.key))].slice(0, 20);
}
const countClasses = (list) => { const c = { hoch: 0, erhoeht: 0, basis: 0, ohne_land: 0 }; for (const r of list) c[classOf(primary(r.countries))]++; return c; };

// alte Rangliste auf Ereignis-Ebene für "vorher"
const prep = []; for (const e of events.values()) { const ms = (mentions.get(e.id) ?? []).filter((m) => m.type === "1").map((m) => ({ tm: min(m.t), src: m.src })).sort((a, b) => a.tm - b.tm); if (ms.length) prep.push({ e, ms }); }
function oldTop(cut, scale) {
  const rows = []; for (const { e, ms } of prep) { if (ms[0].tm > cut) continue; let latest = -1; const seen = new Set(); for (const m of ms) { if (m.tm > cut) break; seen.add(m.src); latest = m.tm; } if (cut - latest > 1440) continue; const g = FAC.weit[classOf(e.country)] ?? 1, M = seen.size, A = Math.pow(0.5, (cut - latest) / 720); rows.push({ url: e.url, s: (scale === "roh" ? M : Math.log(1 + M)) * g * A }); }
  return rows.sort((a, b) => b.s - a.s).slice(0, 20);
}
const out = { zeitpunkte: [], regionen: REGIONEN, hinweis: "Geschichte = Ereignisse mit gleicher Quell-Adresse, danach Zusammenfassung ähnlicher Titel (Schwelle 0,8 Wortüberlappung) unter den Kandidaten; am letzten Zeitpunkt mit echten gkg-Titeln, sonst mit dem Adress-Stichwort." };
let finalRows;
for (const cut of cuts) {
  const rows = rowsAt(cut);
  const pool = new Map(); for (const scale of ["roh", "log"]) for (const fac of ["weit", "eng"]) for (const r of topBy(rows, cut, scale, fac, 60)) pool.set(r.key, r);
  const isFinal = cut === last;
  const textOf = (r) => (isFinal ? cleanTitle(titleOfRep(r) ?? "") || slugText(r.rep.url) : slugText(r.rep.url));
  const merged = mergeSimilar([...pool.values()], textOf, 0.8, 4);
  const rest = rows.filter((r) => !pool.has(r.key));
  const all = [...rest, ...merged];
  if (isFinal) finalRows = all;
  const entry = { ende: new Date(cut * 60000).toISOString(), geschichtenNachAdresse: rows.length, kandidatenImPool: pool.size, nachZusammenfassungImPool: merged.length, varianten: {} };
  // vorher: alte Ereignis-Top-20 -> wie viele verschiedene Geschichten
  for (const scale of ["roh", "log"]) {
    const old = oldTop(cut, scale); const asRows = old.map((o, i) => ({ key: norm(o.url), srcs: new Set(), countries: {}, latest: 0, nEvents: 1, rep: { url: o.url } }));
    const byUrl = new Set(asRows.map((r) => r.key)).size;
    const bySlug = mergeSimilar(asRows.filter((r, i, a) => a.findIndex((x) => x.key === r.key) === i), (r) => (isFinal ? cleanTitle(TM.get(norm(r.rep.url))?.title ?? "") || slugText(r.rep.url) : slugText(r.rep.url)), 0.8, 4).length;
    (entry.vorher ??= {})[scale] = { eventsInTop20: 20, verschiedeneNachAdresse: byUrl, verschiedeneNachAdresseUndTitel: bySlug };
  }
  for (const scale of ["roh", "log"]) for (const fac of ["weit", "eng"]) for (const reg of [false, true]) {
    const L = list20(all, cut, scale, fac, reg);
    entry.varianten[`${scale}/${fac}/${reg ? "mit" : "ohne"}`] = { ...countClasses(L), verschiedeneGeschichten: new Set(L.map((r) => r.key)).size, regionaleSpitzeImTop20: reg ? Object.values(regionWinners(all)).filter((w) => L.some((r) => r.key === w.key)).length : null };
  }
  out.zeitpunkte.push(entry);
}
// Regionale Spitzenmeldungen am letzten Zeitpunkt
const win = regionWinners(finalRows);
out.regionBeste = Object.fromEntries(REGIONEN.map((reg) => { const r = win[reg]; return [reg, r ? { titel: cleanTitle(titleOfRep(r) ?? "") ? titleOfRep(r) : null, urlStichwort: slugText(r.rep.url).trim().slice(0, 90), quellen: r.srcs.size, laender: fmtLand(r.countries), anzahlZusammengefassteAdressen: r.members?.length ?? 1 } : null]; }));
// Verdecktes Blatt 2
const rawL = list20(finalRows, last, "roh", "weit", false).slice(0, 15), logL = list20(finalRows, last, "log", "weit", false).slice(0, 15);
const line = (r, i) => `${i + 1}. ${decodeURIComponent((titleOfRep(r) ?? "(Titel nicht verfügbar, Adresse: " + slugText(r.rep.url).trim().slice(0, 70) + ")").replace(/%/g, "%25"))} · Land: ${fmtLand(r.countries)} · ${r.srcs.size} Quellen`;
const swap = rng(20261101)() < 0.5, A = swap ? logL : rawL, B = swap ? rawL : logL;
const md = `# Verdecktes Rang-Blatt 2 (Test)\n\nZwei Listen mit je 15 **verschiedenen Geschichten** (gleiche Adresse und ähnlicher Titel sind vorher zusammengefasst, ein Land-Eintrag nennt bis zu drei beteiligte Länder). Zeitpunkt: ${new Date(last * 60000).toISOString()}. Die Titel sind die **echten Titel aus gkg** (HTML-Zeichen umgewandelt). Beurteile, welche Reihenfolge sinnvoller wirkt, bevor du den Schlüssel öffnest (\`data/gdelt-test/ranking-key-2.json\`).\n\n## Liste A\n${A.map(line).join("\n")}\n\n## Liste B\n${B.map(line).join("\n")}\n`;
writeFileSync(new URL("../../docs/gdelt-test-ranking-blind-2.md", import.meta.url), md);
writeFileSync(join(DATA, "ranking-key-2.json"), JSON.stringify({ A: swap ? "log(1+M)" : "roh", B: swap ? "roh" : "log(1+M)", gemeinsameGeschichten: rawL.filter((r) => logL.some((l) => l.key === r.key)).length }));
out.blattUeberlappung = rawL.filter((r) => logL.some((l) => l.key === r.key)).length;
writeFileSync(join(DATA, "rank2-summary.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1).slice(0, 6000));

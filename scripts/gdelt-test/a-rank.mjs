// Rang-Vergleich: M roh gegen log(1+M). "Geschichte" = GDELT-Ereignis, M = verschiedene Web-Quellen (Mentions) bis zum Zeitpunkt.
// Annahmen: G_Thema = 1,0 (Ereignisdateien kennen unsere sechs Themen nicht), Länder ohne Ereignisland = Basis, Halbwertszeit 12 h.
import { loadEvents, min, sample, stamps, rng } from "./load.mjs";
import { DATA, readText } from "./lib.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CW = JSON.parse(readFileSync(new URL("../../config/weights.json", import.meta.url), "utf8")).laender;
const F = CW.stufen, hoch = new Set(CW.zuordnung.hoch.map((x) => x.fips)), erh = new Set(CW.zuordnung.erhoeht.map((x) => x.fips));
const G = (cc) => (hoch.has(cc) ? F.hoch : erh.has(cc) ? F.erhoeht : F.basis);
const names = Object.fromEntries(readText("http://data.gdeltproject.org/api/v2/guides/LOOKUP-COUNTRIES.TXT").split("\n").map((l) => l.trim().split("\t")).filter((x) => x.length === 2));
const { events, mentions } = loadEvents();
const last = min(stamps[stamps.length - 1]), first = min(stamps[0]);

// vorbereiten: je Ereignis sortierte Web-Mentions
const prep = [];
for (const e of events.values()) {
  const ms = (mentions.get(e.id) ?? []).filter((m) => m.type === "1").map((m) => ({ tm: min(m.t), src: m.src })).sort((a, b) => a.tm - b.tm);
  if (ms.length) prep.push({ e, ms });
}
function ranking(cut) {
  const rows = [];
  for (const { e, ms } of prep) {
    if (ms[0].tm > cut) continue;
    let latest = -1, seen = new Set();
    for (const m of ms) { if (m.tm > cut) break; seen.add(m.src); latest = m.tm; }
    if (cut - latest > 24 * 60) continue; // nur Geschichten mit Meldung in den letzten 24 h
    const M = seen.size, age = (cut - latest) / 60, A = Math.pow(0.5, age / 12), g = G(e.country);
    rows.push({ id: e.id, country: e.country, url: e.url, M, g, A, raw: M * g * A, log: Math.log(1 + M) * g * A });
  }
  return rows;
}
const top = (rows, key, n) => [...rows].sort((a, b) => b[key] - a[key]).slice(0, n);
const overlap = (a, b) => a.filter((x) => b.some((y) => y.id === x.id)).length;
const classOf = (r) => (hoch.has(r.country) ? "hoch" : erh.has(r.country) ? "erhoeht" : "basis");
const out = { annahmen: ["G_Thema = 1,0", "Länder ohne Ereignisland = Basis", "Halbwertszeit 12 h", "M = verschiedene Web-Quellen bis zum Zeitpunkt"], zeitpunkte: [] };

// vier Zeitpunkte, je 6 h Abstand
const cuts = [0, 6, 12, 18].map((h) => last - h * 60);
for (const cut of cuts) {
  const rows = ranking(cut); if (rows.length < 20) continue;
  const tr = top(rows, "raw", 20), tl = top(rows, "log", 20);
  const dom = (t) => { const c = {}; for (const r of t.slice(0, 10)) c[r.country || "?"] = (c[r.country || "?"] ?? 0) + 1; return Math.max(...Object.values(c)); };
  const cnt = (t) => { const c = { hoch: 0, erhoeht: 0, basis: 0 }; for (const r of t) c[classOf(r)]++; return c; };
  out.zeitpunkte.push({ ende: new Date(cut * 60000).toISOString(), geschichten: rows.length, ueberlappungTop10: overlap(tr.slice(0, 10), tl.slice(0, 10)), ueberlappungTop20: overlap(tr, tl),
    maxGleichesLandInTop10: { roh: dom(tr), log: dom(tl) }, mittleresM_Top10: { roh: +(tr.slice(0, 10).reduce((s, r) => s + r.M, 0) / 10).toFixed(1), log: +(tl.slice(0, 10).reduce((s, r) => s + r.M, 0) / 10).toFixed(1) },
    gewichtungInTop20: { roh: cnt(tr), log: cnt(tl) } });
}
// Stabilität: 24 stündliche Zeitpunkte, Überlappung aufeinanderfolgender Top-20
const hourly = Array.from({ length: 24 }, (_, i) => last - (23 - i) * 60);
const lists = hourly.map((c) => { const r = ranking(c); return { raw: top(r, "raw", 20), log: top(r, "log", 20) }; });
const stab = (k) => { let s = 0; for (let i = 1; i < lists.length; i++) s += overlap(lists[i - 1][k], lists[i][k]); return +(s / (lists.length - 1)).toFixed(1); };
out.stabilitaetMittlereUeberlappungTop20ZwischenStuendlichenZeitpunkten = { roh: stab("raw"), log: stab("log") };

// verdecktes Blatt: neuester Zeitpunkt, Top 15, Zuordnung zufällig
const rows = ranking(last), r15 = top(rows, "raw", 15), l15 = top(rows, "log", 15);
const slug = (u) => { try { const p = new URL(u).pathname.split("/").filter(Boolean).pop() ?? new URL(u).hostname; return decodeURIComponent(p).replace(/\.(html?|php|aspx?)$/i, "").replace(/[-_+]+/g, " ").trim().slice(0, 90) || u.slice(0, 80); } catch { return u.slice(0, 80); } };
const line = (r, i) => `${i + 1}. ${slug(r.url)} · ${names[r.country] ?? "ohne Ereignisland"} · ${r.M} Quellen`;
const swap = rng(77)() < 0.5;
const A = swap ? l15 : r15, B = swap ? r15 : l15;
const md = `# Verdecktes Rang-Blatt (Test)\n\nZwei Listen mit je 15 Geschichten für denselben Zeitpunkt (${new Date(last * 60000).toISOString()}). Die Titel sind **aus der Adresse abgeleitet** (Näherung, keine echten Titel). Beurteile, welche Reihenfolge sinnvoller wirkt. Welche Liste welche ist, steht absichtlich nicht hier (Schlüssel: \`data/gdelt-test/ranking-key.json\`, bitte erst nach dem Urteil öffnen).\n\n## Liste A\n${A.map(line).join("\n")}\n\n## Liste B\n${B.map(line).join("\n")}\n`;
writeFileSync(new URL("../../docs/gdelt-test-ranking-blind.md", import.meta.url), md);
writeFileSync(join(DATA, "ranking-key.json"), JSON.stringify({ A: swap ? "log(1+M)" : "roh", B: swap ? "roh" : "log(1+M)" }));
writeFileSync(join(DATA, "rank-summary.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));

// Auswertung der 15-Minuten-Dateien: Eilmeldungs-Auslöser, Fehlalarm-Material, Zeitabstände.
// Liest nur Textdaten aus dem Cache (kein Netzwerk, keine Ausführung heruntergeladener Inhalte).
import { cachePath, cached, DATA } from "./lib.mjs";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const { lastExport } = JSON.parse(readFileSync(join(DATA, "anchor.json"), "utf8"));
const CW = JSON.parse(readFileSync(new URL("../../config/weights.json", import.meta.url), "utf8")).laender.zuordnung;
const W = { hoch: CW.hoch.map((x) => x.fips), erhoeht: CW.erhoeht.map((x) => x.fips) }; // echte Gewichtung des Nutzers (FIPS-Codes)
const toDate = (t) => new Date(Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8), +t.slice(8, 10), +t.slice(10, 12), +t.slice(12, 14)));
const fmt = (d) => d.toISOString().replace(/[-:T]/g, "").slice(0, 14);
const STEPS = 288;
const end = toDate(lastExport);
const stamps = Array.from({ length: STEPS }, (_, i) => fmt(new Date(end.getTime() - (STEPS - 1 - i) * 15 * 60000)));
const min = (ts) => toDate(ts).getTime() / 60000; // Minuten seit 1970

const readZip = (url) => (cached(url) ? execFileSync("unzip", ["-p", cachePath(url)], { maxBuffer: 1 << 30 }).toString("utf8") : null);
const events = new Map();   // id -> Ereignis (aus export, erste Slot)
const mentions = new Map(); // id -> [{t, src, url, type}]
let slotsOk = 0, slotsMissing = 0;
for (const ts of stamps) {
  const ex = readZip(`http://data.gdeltproject.org/gdeltv2/${ts}.export.CSV.zip`);
  const me = readZip(`http://data.gdeltproject.org/gdeltv2/${ts}.mentions.CSV.zip`);
  if (!ex || !me) { slotsMissing++; if (!ex && !me) continue; }
  slotsOk++;
  if (ex) for (const l of ex.split("\n")) {
    const c = l.split("\t"); if (c.length < 61) continue;
    if (!events.has(c[0])) events.set(c[0], { id: c[0], sqldate: c[1], code: c[26], root: c[28], quad: c[29], goldstein: +c[30], nm: +c[31], country: c[53], place: c[52], lat: c[56], lon: c[57], added: c[59], url: c[60], slot: ts });
  }
  if (me) for (const l of me.split("\n")) {
    const c = l.split("\t"); if (c.length < 16) continue;
    if (!mentions.has(c[0])) mentions.set(c[0], []);
    mentions.get(c[0]).push({ t: c[2], src: c[4], url: c[5], type: c[3] });
  }
}
const tStart = min(stamps[0]), tEnd = min(stamps[stamps.length - 1]);
const cls = (cc) => (W.hoch.includes(cc) ? "hoch" : W.erhoeht.includes(cc) ? "erhoeht" : "basis");

const SEVERE_ROOTS = new Set(["18", "19", "20"]);
const out = { slotsOk, slotsMissing, eventsTotal: events.size, rootCounts: {}, variants: {} };
for (const e of events.values()) out.rootCounts[e.root] = (out.rootCounts[e.root] ?? 0) + 1;

// Auslöser: >= 2 verschiedene Quellen (Web-Mentions) innerhalb von 60 Min nach der ersten Erwähnung.
function triggers({ roots, maxGoldstein = Infinity, freshDays = null }) {
  const res = [];
  let censored = 0, noCountry = 0;
  for (const e of events.values()) {
    if (!roots.has(e.root) || !(e.goldstein <= maxGoldstein)) continue;
    const addedMin = min(e.added);
    if (addedMin < tStart || addedMin > tEnd - 60) { censored++; continue; } // links/rechts abgeschnitten
    if (freshDays !== null) {
      const sq = toDate(e.sqldate + "000000").getTime() / 60000;
      if (addedMin - sq > freshDays * 1440) continue; // Ereignisdatum zu alt
    }
    const ms = (mentions.get(e.id) ?? []).filter((m) => m.type === "1").map((m) => ({ ...m, tm: min(m.t) })).sort((a, b) => a.tm - b.tm);
    if (!ms.length) continue;
    const t1 = ms[0].tm;
    const seen = new Set(); let t2 = null;
    for (const m of ms) { if (m.tm - t1 > 60) break; seen.add(m.src); if (seen.size === 2) { t2 = m.tm; break; } }
    if (t2 === null) continue;
    if (!e.country) { noCountry++; }
    const srcs = []; const s2 = new Set();
    for (const m of ms) { if (m.tm - t1 > 60) break; if (!s2.has(m.src)) { s2.add(m.src); srcs.push({ src: m.src, t: m.t, url: m.url }); } }
    res.push({ id: e.id, root: e.root, code: e.code, goldstein: e.goldstein, country: e.country, place: e.place, sqldate: e.sqldate, added: e.added, t1: ms[0].t, t2min: t2 - t1, srcs, srcUrl: e.url, class: e.country ? cls(e.country) : "ohne_land" });
  }
  return { res, censored, noCountry };
}
const variants = {
  "V1 Wurzelcodes 18-20": { roots: SEVERE_ROOTS },
  "V2 Wurzelcodes 18-20, Goldstein<=-8": { roots: SEVERE_ROOTS, maxGoldstein: -8 },
  "V3 V1 + Ereignisdatum max. 1 Tag alt": { roots: SEVERE_ROOTS, freshDays: 1 },
};
const days = (tEnd - tStart) / 1440;
for (const [name, v] of Object.entries(variants)) {
  const { res, censored, noCountry } = triggers(v);
  const by = {}; for (const r of res) by[r.class] = (by[r.class] ?? 0) + 1;
  const gaps = res.map((r) => r.t2min).sort((a, b) => a - b);
  const q = (p) => (gaps.length ? gaps[Math.min(gaps.length - 1, Math.floor(p * gaps.length))] : null);
  out.variants[name] = { triggers: res.length, perDay: +(res.length / days).toFixed(1), byClass: by, censoredEvents: censored, noCountry, gapMinMedian: q(0.5), gapMinP90: q(0.9) };
  if (name.startsWith("V1")) writeFileSync(join(DATA, "triggers-v1.json"), JSON.stringify(res));
}
out.windowDays = +days.toFixed(2);

// Modellrechnung Anzeigeverzögerung: Zeit bis zur Auslösung (t2 - t1, gemessen) + Wartezeit bis zum nächsten Holer-Lauf (Modell)
const v1 = JSON.parse(readFileSync(join(DATA, "triggers-v1.json"), "utf8"));
out.model = {};
for (const T of [15, 30, 60]) {
  const d = [];
  for (const r of v1) for (let ph = 0; ph < T; ph += 5) {
    // Auslösezeit relativ zum Holer-Takt: Wartezeit bis zum nächsten Lauf bei Phase ph (Minuten), + 5 Min Annahme für Lauf/Anzeige
    const t = min(r.t1) + r.t2min; const wait = (((ph - (t % T)) % T) + T) % T;
    d.push(r.t2min + wait + 5);
  }
  d.sort((a, b) => a - b);
  out.model[`Takt ${T} Min`] = { median: d[Math.floor(d.length / 2)], p90: d[Math.floor(d.length * 0.9)] };
}
writeFileSync(join(DATA, "events-analysis.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));

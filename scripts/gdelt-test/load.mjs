// Gemeinsamer Lader für die Auswertung (liest nur den Cache, kein Netzwerk).
import { cachePath, cached, DATA } from "./lib.mjs";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const { lastExport } = JSON.parse(readFileSync(join(DATA, "anchor.json"), "utf8"));
export const toDate = (t) => new Date(Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8), +t.slice(8, 10), +t.slice(10, 12), +(t.slice(12, 14) || 0)));
export const fmt = (d) => d.toISOString().replace(/[-:T]/g, "").slice(0, 14);
export const min = (ts) => toDate(ts).getTime() / 60000;
export const STEPS = 288;
const end = toDate(lastExport);
export const stamps = Array.from({ length: STEPS }, (_, i) => fmt(new Date(end.getTime() - (STEPS - 1 - i) * 15 * 60000)));
export const gdeltUrl = (ts, kind, ext = "CSV") => `http://data.gdeltproject.org/gdeltv2/${ts}.${kind}.${ext}.zip`;
export const readZip = (url) => (cached(url) ? execFileSync("unzip", ["-p", cachePath(url)], { maxBuffer: 1 << 30 }).toString("utf8") : null);

// Zufall mit fester Zahl (reproduzierbar)
export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function sample(arr, n, seed) { const r = rng(seed), a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); }

export const decode = (s) => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
export const norm = (u) => u.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/#.*$/, "").replace(/\/+$/, "").toLowerCase();

export function loadEvents() {
  const events = new Map(), mentions = new Map(), perSlot = {};
  let missing = 0;
  for (const ts of stamps) {
    const ex = readZip(gdeltUrl(ts, "export")), me = readZip(gdeltUrl(ts, "mentions"));
    if (!ex && !me) { missing++; continue; }
    let ne = 0;
    if (ex) for (const l of ex.split("\n")) {
      const c = l.split("\t"); if (c.length < 61) continue; ne++;
      if (!events.has(c[0])) events.set(c[0], { id: c[0], sqldate: c[1], code: c[26], root: c[28], goldstein: +c[30], nm: +c[31], country: c[53], place: c[52], added: c[59], url: c[60], slot: ts, a1type: c[12], a2type: c[22], a1geo: c[37], a2geo: c[45], a1name: c[6], a2name: c[16] });
    }
    perSlot[ts] = ne;
    if (me) for (const l of me.split("\n")) {
      const c = l.split("\t"); if (c.length < 16) continue;
      let a = mentions.get(c[0]); if (!a) mentions.set(c[0], (a = []));
      a.push({ t: c[2], src: c[4], url: c[5], type: c[3] });
    }
  }
  return { events, mentions, perSlot, missing };
}

export function loadGkg(ts) {
  const rows = [];
  for (const [kind, tr] of [["gkg", false], ["translation.gkg", true]]) {
    const txt = readZip(gdeltUrl(ts, kind, "csv")); if (!txt) continue;
    for (const l of txt.split("\n")) {
      const c = l.split("\t"); if (c.length < 27) continue;
      const t = c[26].match(/<PAGE_TITLE>([\s\S]*?)<\/PAGE_TITLE>/)?.[1];
      const lang = tr ? (c[25].match(/srclc:([a-z]+)/)?.[1] ?? "?") : "unübersetzt";
      rows.push({ slot: ts, domain: c[3], url: c[4], title: t ? decode(t).trim() : null, themes: new Set((c[8] ?? "").split(";").map((x) => x.split(",")[0]).filter(Boolean)), themeCounts: (() => { const m = new Map(); for (const x of (c[8] ?? "").split(";")) { const t = x.split(",")[0]; if (t) m.set(t, (m.get(t) ?? 0) + 1); } return m; })(), locs: (c[10] ?? "").split(";").map((x) => x.split("#")).filter((x) => x.length > 3).map((x) => ({ name: x[1], fips: x[2] })), lang, tr });
    }
  }
  return rows;
}
export const GKG_SLOTS = ["20261030080000", "20261030140000", "20261030200000", "20261031120000", "20261101030000"];

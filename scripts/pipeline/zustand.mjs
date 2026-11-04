// Rollender Zustand der Pipeline: je 15-Minuten-Zeitpunkt eine kleine Zusammenfassung (kein Rohdatei-Speicher).
//   <zustand>/slot-<ZEIT>.json.gz = { ts, d: [Domains], e: [[Ereignis-ID, Adresse, FIPS-Land, Wurzelcode, NumMentions]],
//                                     m: [[Ereignis-ID, Minuten seit Zeitpunkt, Domain-Nr.]], t: [[normierte Adresse, Titel]] }
// Nur Web-Erwähnungen (Typ 1) von Ereignissen, die im Zustand bekannt sind; Titel nur für Adressen bekannter Ereignisse.
import { readFileSync, writeFileSync, readdirSync, unlinkSync, mkdirSync, existsSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";
import { norm, min, fmt, decode } from "../lib/pipeline.mjs";

export const SLOT_MIN = 15;
export const slotMin = (ts) => min(ts);
export const slotName = (ts) => `slot-${ts}.json.gz`;
export const tsVon = (minutes) => fmt(new Date(minutes * 60000));

// Zusammenfassung eines Zeitpunkts aus den Texten der Dateien (export, mentions, gkg; jeweils null erlaubt)
export function fasseSlot(ts, exportText, mentionsText, gkgText, kennt, kenntUrl) {
  const sm = slotMin(ts);
  const e = [], own = new Set();
  if (exportText) for (const l of exportText.split("\n")) {
    const c = l.split("\t"); if (c.length < 61) continue;
    if (own.has(c[0])) continue; own.add(c[0]);
    e.push([+c[0], c[60], c[53], c[28], +c[31]]);
    kenntUrl.add(norm(c[60]));
  }
  const dIdx = new Map(), d = [], m = [];
  if (mentionsText) for (const l of mentionsText.split("\n")) {
    const c = l.split("\t"); if (c.length < 16 || c[3] !== "1") continue;
    if (!own.has(c[0]) && !kennt.has(c[0])) continue;
    let i = dIdx.get(c[4]); if (i === undefined) { i = d.length; d.push(c[4]); dIdx.set(c[4], i); }
    m.push([+c[0], Math.round(min(c[2]) - sm), i]);
  }
  const t = [];
  if (gkgText) for (const l of gkgText.split("\n")) {
    const c = l.split("\t"); if (c.length < 27) continue;
    const k = norm(c[4]); if (!kenntUrl.has(k)) continue;
    const mt = c[26].match(/<PAGE_TITLE>([\s\S]*?)<\/PAGE_TITLE>/)?.[1];
    if (mt) t.push([k, decode(mt).trim()]);
  }
  for (const id of own) kennt.add(id);
  return { ts, d, e, m, t };
}

export function schreibeSlot(dir, s) {
  mkdirSync(dir, { recursive: true });
  const buf = gzipSync(JSON.stringify(s), { level: 6 });
  writeFileSync(`${dir}/${slotName(s.ts)}`, buf);
  return buf.length;
}
export const leseSlot = (dir, ts) => JSON.parse(gunzipSync(readFileSync(`${dir}/${slotName(ts)}`)).toString("utf8"));
export const vorhandeneSlots = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => /^slot-\d{14}\.json\.gz$/.test(f)).map((f) => f.slice(5, 19)).sort() : []);

// Zeitpunkte, die älter als die Aufbewahrung sind, löschen (Ereignisse 72 h, damit Erwähnungen älterer Ereignisse noch zugeordnet werden)
export function raeumeAuf(dir, endMin, aufbewahrungH = 72) {
  let n = 0;
  for (const ts of vorhandeneSlots(dir)) if (slotMin(ts) < endMin - aufbewahrungH * 60) { unlinkSync(`${dir}/${slotName(ts)}`); n++; }
  return n;
}

// Kontext (wie loadContext aus dem Cache) aus dem Zustand: alle Ereignisse der Aufbewahrung, Erwähnungen und Titel der letzten Stunden
export function ladeKontext(dir, endMin, fensterH = 48) {
  const events = new Map(), mentions = new Map(), TM = new Map(), memo = new Map();
  const tStr = (abs) => memo.get(abs) ?? memo.set(abs, fmt(new Date(abs * 60000))).get(abs);
  const slots = vorhandeneSlots(dir).filter((ts) => slotMin(ts) <= endMin);
  const von = endMin - fensterH * 60 - SLOT_MIN;
  let zeilen = 0;
  for (const ts of slots) {
    const s = leseSlot(dir, ts), sm = slotMin(ts), inFenster = sm >= von;
    for (const [id, url, country, root, nm] of s.e) { const k = String(id); if (!events.has(k)) events.set(k, { id: k, url, country, root, nm, slot: ts }); }
    if (!inFenster) continue;
    for (const [id, off, di] of s.m) { const k = String(id); let a = mentions.get(k); if (!a) mentions.set(k, (a = [])); a.push({ t: tStr(sm + off), src: s.d[di], type: "1" }); zeilen++; }
    for (const [k, title] of s.t) if (!TM.has(k)) TM.set(k, { title, themes: null });
  }
  return { events, mentions, TM, missing: 0, slots, mentionZeilen: zeilen };
}

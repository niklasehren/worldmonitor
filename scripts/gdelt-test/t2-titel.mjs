// Runde 3, Aufgabe 2: Titelbereinigung auf allen vorhandenen gkg-Zeitpunkten (nur Cache).
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { DATA } from "./lib.mjs";
import { loadGkg, sample } from "./load.mjs";
import { gkgSlots } from "./r3common.mjs";

const rows = []; const seen = new Set();
for (const ts of gkgSlots()) for (const r of loadGkg(ts)) { if (seen.has(r.url)) continue; seen.add(r.url); rows.push(r); }
const withT = rows.filter((r) => r.title);
// Regeln -----------------------------------------------------------------
const decode2 = (s) => s.replace(/&amp;/gi, "&").replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&quot;|&#39;|&apos;/gi, "'").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const SEP = / (?:[-–—|•·»:]|::) /;
const domBase = (d) => (d || "").toLowerCase().replace(/^www\./, "").split(".")[0].replace(/[^a-z0-9]/g, "");
function suffixed(t, domain) { // Seitenname am Ende oder Anfang?
  const parts = t.split(SEP); if (parts.length < 2) return null;
  const last = parts[parts.length - 1].trim(), first = parts[0].trim();
  const dn = domBase(domain), flat = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const isName = (s) => s.split(/\s+/).length <= 5 && (flat(s).includes(dn.slice(0, 5)) || dn.includes(flat(s).slice(0, 5)) || s.split(/\s+/).length <= 3);
  if (parts.length >= 2 && isName(last) && parts.slice(0, -1).join(" ").length >= 15) return "ende";
  if (parts.length >= 2 && isName(first) && first.length < 30 && parts.slice(1).join(" ").length >= 25 && flat(first).includes(dn.slice(0, 5))) return "anfang";
  return null;
}
export function bereinige(t, domain) {
  let s = decode2(t).replace(/\s+/g, " ").trim();
  s = s.replace(/([A-Z][\w' ]{6,}?)\1$/, "$1"); // Seitenname ohne Trenner doppelt am Ende
  for (let i = 0; i < 3; i++) { const where = suffixed(s, domain);
    if (where === "ende") s = s.split(SEP).slice(0, -1).join(" - ").trim();
    else if (where === "anfang") s = s.split(SEP).slice(1).join(" - ").trim(); else break; }
  return s;
}
const GENERIC = /^(home|homepage|untitled|index|news|breaking news|latest news|weather|error|404|page not found|not found|access denied|just a moment|attention required|redirecting|loading|sign in|log in|subscribe|search|tag:.*|category:.*|archives?.*)$/i;
const flat0 = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const words = (s) => s.split(/\s+/).filter(Boolean);
// Titel, die auf mehreren verschiedenen Adressen derselben Domain gleich sind -> Seiten-Slogan
const dupCount = new Map(); for (const r of withT) { const k = r.domain + "|" + r.title; dupCount.set(k, (dupCount.get(k) ?? 0) + 1); }
function verwerfen(clean, r) {
  if (!/\p{L}/u.test(clean)) return "keine Buchstaben";
  if (GENERIC.test(clean)) return "allgemeine Seite";
  const cjk = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0e00-\u0e7f]/.test(clean);
  if (cjk ? clean.length < 8 : (words(clean).length < 3 || clean.length < 15)) return "zu kurz (<3 Wörter oder <15 Zeichen)";
  if (dupCount.get(r.domain + "|" + r.title) >= 3 && (words(clean).length <= 6 || flat0(clean).includes(domBase(r.domain).slice(0, 5)))) return "gleicher Titel auf >=3 Adressen der Domain (Seiten-Slogan)";
  if ((clean.match(/\p{Lu}/gu) ?? []).length > 0.9 * (clean.match(/\p{L}/gu) ?? []).length && (clean.match(/\p{L}/gu) ?? []).length > 12 && !cjk) return "nur Großbuchstaben";
  return null;
}
const stat = { alle: rows.length, mitTitel: withT.length, ohneTitel: rows.length - withT.length, roheEntitaeten: 0, mojibake: 0, seitenname_ende: 0, seitenname_anfang: 0, verworfen: {}, kurzOhneBereinigung: 0 };
const bsp = { entitaet: [], seite: [], verwerfen: {} };
const out = [];
for (const r of withT) {
  const raw = r.title; // load.mjs hat einmal dekodiert; Reste = doppelt kodiert
  const ent = /&(?:amp|quot|lt|gt|nbsp|#\d+|#x[0-9a-f]+);/i.test(raw); if (ent) stat.roheEntitaeten++;
  if (/Ã.|â€|Â /.test(raw)) stat.mojibake++;
  const w = suffixed(decode2(raw), r.domain); if (w === "ende") stat.seitenname_ende++; if (w === "anfang") stat.seitenname_anfang++;
  const clean = bereinige(raw, r.domain); const v = verwerfen(clean, r);
  if (v) { stat.verworfen[v] = (stat.verworfen[v] ?? 0) + 1; (bsp.verwerfen[v] ??= []).push({ v: raw.slice(0, 90), d: r.domain }); }
  out.push({ raw, clean, w, ent, v, d: r.domain });
}
const changed = out.filter((x) => x.raw !== x.clean);
stat.geaendert = changed.length;
stat.verworfenGesamt = out.filter((x) => x.v).length;
const S = (arr, n, seed) => sample(arr, n, seed).map((x) => `${x.d}: «${x.raw.slice(0, 95)}» → «${x.clean.slice(0, 80)}»`);
const res = { stat, anteile: { seitenname: +((stat.seitenname_ende + stat.seitenname_anfang) / withT.length * 100).toFixed(1), entitaeten: +(stat.roheEntitaeten / withT.length * 100).toFixed(2), verworfen: +(stat.verworfenGesamt / withT.length * 100).toFixed(1) },
  beispieleSeitenname: S(out.filter((x) => x.w), 15, 31), beispieleEntitaet: S(out.filter((x) => x.ent), 15, 32),
  beispieleVerworfen: Object.fromEntries(Object.entries(bsp.verwerfen).map(([k, a]) => [k, sample(a, 8, 33).map((x) => `${x.d}: «${x.v}»`)])) };
writeFileSync(join(DATA, "t2-titel.json"), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1).slice(0, 9000));

// Gemeinsame Funktionen für Runde 2 (nur lesen, kein Netzwerk).
import { norm, decode, loadGkg, min } from "./load.mjs";
import { readText, DATA } from "./lib.mjs";
import { readFileSync } from "node:fs";

const CW = JSON.parse(readFileSync(new URL("../../config/weights.json", import.meta.url), "utf8")).laender.zuordnung;
export const hochSet = new Set(CW.hoch.map((x) => x.fips)), erhSet = new Set(CW.erhoeht.map((x) => x.fips));
export const classOf = (cc) => (!cc ? "ohne_land" : hochSet.has(cc) ? "hoch" : erhSet.has(cc) ? "erhoeht" : "basis");
export const countryNames = Object.fromEntries(readText("http://data.gdeltproject.org/api/v2/guides/LOOKUP-COUNTRIES.TXT").split("\n").map((l) => l.trim().split("\t")).filter((x) => x.length === 2));
export const cname = (cc) => countryNames[cc] ?? (cc || "ohne Ereignisland");

// Titelähnlichkeit: Wortmengen-Überlappung (Jaccard)
const STOP = new Set(["the", "and", "for", "with", "der", "die", "das", "und", "von", "mit", "des", "den", "dem", "ein", "eine", "html", "article", "news"]);
export function tokens(s) { return new Set((s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9äöüß ]+/g, " ").split(/\s+/)).filter((w) => w.length >= 3 && !STOP.has(w))); }
export function cleanTitle(t) { if (!t) return ""; const parts = t.split(/ [-–|] /); return parts.length > 1 && parts[0].length >= 20 ? parts[0] : t; }
export function jaccard(a, b) { if (!a.size || !b.size) return 0; let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i); }
export function slugText(url) { try { const u = new URL(url); const segs = u.pathname.split("/").filter(Boolean); const last = decodeURIComponent(segs[segs.length - 1] ?? "").replace(/\.(html?|php|aspx?|ece|cms)$/i, ""); return last.replace(/[-_+]+/g, " ").replace(/\b[0-9a-f]{8,}\b/gi, " ").replace(/\d+/g, " "); } catch { return ""; } }

// Zusammenfassen: Zeilen mit ähnlichem Titel (>= thr, mindestens minTok Wörter) werden eine Geschichte
export function mergeSimilar(rows, textOf, thr = 0.8, minTok = 4) {
  const tk = rows.map((r) => tokens(textOf(r) ?? ""));
  const par = rows.map((_, i) => i); const find = (i) => (par[i] === i ? i : (par[i] = find(par[i])));
  for (let i = 0; i < rows.length; i++) { if (tk[i].size < minTok) continue; for (let j = i + 1; j < rows.length; j++) { if (tk[j].size < minTok) continue; if (jaccard(tk[i], tk[j]) >= thr) par[find(j)] = find(i); } }
  const groups = new Map(); rows.forEach((r, i) => { const k = find(i); (groups.get(k) ?? groups.set(k, []).get(k)).push(r); });
  return [...groups.values()].map((g) => {
    if (g.length === 1) return { ...g[0], members: [g[0].key] };
    const best = g.reduce((a, b) => (b.srcs.size > a.srcs.size ? b : a));
    const srcs = new Set(), countries = {}; let latest = -1, nEvents = 0;
    for (const r of g) { for (const s of r.srcs) srcs.add(s); for (const [c, n] of Object.entries(r.countries)) countries[c] = (countries[c] ?? 0) + n; latest = Math.max(latest, r.latest); nEvents += r.nEvents; }
    return { ...best, srcs, countries, latest, nEvents, members: g.map((r) => r.key) };
  });
}
export const primary = (countries) => Object.entries(countries).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
export function titleMap(slots) { const m = new Map(); for (const ts of slots) { for (const r of loadGkg(ts)) if (r.title && !m.has(norm(r.url))) m.set(norm(r.url), r); } return m; }
export const fmtLand = (countries) => { const e = Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => cname(c)); return e.length ? e.join(", ") : "ohne Ereignisland"; };

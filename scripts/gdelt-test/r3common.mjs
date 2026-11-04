// Runde 3: gemeinsame Hilfen (nur Cache, kein Netzwerk).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DATA, cached, readMeta } from "./lib.mjs";
import { gdeltUrl, GKG_SLOTS, norm } from "./load.mjs";
import { titleMap, slugText, cleanTitle } from "./common2.mjs";

export function gkgSlots() {
  const s = new Set(GKG_SLOTS);
  for (const l of readFileSync(join(DATA, "messages.log"), "utf8").split("\n")) { const m = l.match(/ (\d{14}) gkg:/); if (m) s.add(m[1]); }
  // WM_VOR=<ISO-Zeit>: nur Zeitpunkte, die vor dieser Zeit geladen wurden ("vorher"-Zustand, Runde 4 Nachtlauf)
  const vor = process.env.WM_VOR ? Date.parse(process.env.WM_VOR) : null;
  return [...s].filter((ts) => cached(gdeltUrl(ts, "gkg", "csv")) && (!vor || Date.parse(readMeta(gdeltUrl(ts, "gkg", "csv")).fetchedAt) < vor));
}
export const loadTitles = () => titleMap(gkgSlots());
export { norm, slugText, cleanTitle };
// Anzeigetext: echter Titel, sonst Text der Adresse
export const textOf = (TM, url) => { const t = TM.get(norm(url)); return t?.title ? { text: t.title, quelle: "titel" } : { text: slugText(url), quelle: "adresse" }; };
// fester Zufall: Hash eines Schlüssels
export function hash(s, seed = 1) { let h = 2166136261 ^ seed; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
export function wilson(k, n, z = 1.96) { if (!n) return [NaN, NaN]; const p = k / n, d = 1 + z * z / n, c = p + z * z / (2 * n), a = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return [Math.max(0, (c - a) / d), Math.min(1, (c + a) / d)]; }
export const pct = (x) => (isNaN(x) ? "n/a" : Math.round(x * 100) + " %");

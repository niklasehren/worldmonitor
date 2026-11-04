// Ausreißer-Verlauf: was die 3 Tage an Verlaufsdaten hergeben. Zählgröße: Ereignisse je Ereignisland (Export), rollierend 24 h.
import { loadEvents, min, stamps } from "./load.mjs";
import { DATA } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const { events, perSlot } = loadEvents();
const slotsWith = stamps.filter((s) => perSlot[s] !== undefined);
const perSlotCounts = slotsWith.map((s) => perSlot[s]);
const srt = [...perSlotCounts].sort((a, b) => a - b);
const q = (a, p) => a[Math.min(a.length - 1, Math.floor(p * a.length))];
const out = { zeitpunkteMitDaten: slotsWith.length, ereignisseProZeitpunkt: { min: srt[0], median: q(srt, 0.5), max: srt[srt.length - 1] } };
// Zählwerte je Land und Stunde
const byCountry = {};
for (const e of events.values()) {
  if (!e.country) continue;
  const h = Math.floor(min(e.slot) / 60);
  (byCountry[e.country] ??= {})[h] = ((byCountry[e.country] ?? {})[h] ?? 0) + 1;
}
const h0 = Math.floor(min(stamps[0]) / 60) + 1, h1 = Math.floor(min(stamps[stamps.length - 1]) / 60) - 1;
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const mad = (a, m) => med(a.map((x) => Math.abs(x - m)));
const total24 = {}; // rollierende 24-h-Summe je Land
const hours = []; for (let h = h0; h <= h1; h++) hours.push(h);
const roll = (cc, h) => { let s = 0; for (let k = h - 23; k <= h; k++) s += byCountry[cc]?.[k] ?? 0; return s; };
const tot = (h) => { let s = 0; for (const cc in byCountry) s += roll(cc, h); return s; };
const lastH = h1, base = hours.filter((h) => h <= lastH - 24 && h - 23 >= h0); // Basis nur wo volles 24-h-Fenster existiert
out.verlauf = { stundenMitVollemFenster: base.length, tageVerlaufGesamt: +((h1 - h0 + 1) / 24).toFixed(2), laenderMitEreignissen: Object.keys(byCountry).length };
const flagsAbs = [], flagsShare = [];
for (const cc of Object.keys(byCountry)) {
  const series = base.map((h) => roll(cc, h)); if (series.length < 12) continue;
  const m = med(series), sd = 1.4826 * mad(series, m), cur = roll(cc, lastH);
  const z = sd > 0 ? (cur - m) / sd : (cur > m ? Infinity : 0);
  if (cur >= 10 && (z >= 3.5 || (sd === 0 && cur >= 5 * Math.max(m, 1)))) flagsAbs.push({ land: cc, jetzt: cur, median: m, z: +z.toFixed(1) });
  const shareSeries = base.map((h) => roll(cc, h) / tot(h)); const sm = med(shareSeries), ssd = 1.4826 * mad(shareSeries, sm), scur = cur / tot(lastH);
  const sz = ssd > 0 ? (scur - sm) / ssd : 0;
  if (cur >= 10 && sz >= 3.5) flagsShare.push({ land: cc, anteilJetzt: +(100 * scur).toFixed(2), medianAnteil: +(100 * sm).toFixed(2), z: +sz.toFixed(1) });
}
out.probelauf = { hinweis: "Nur ein Probelauf: Normalwert aus höchstens ~2 Tagen, nicht aus 28 Tagen. Nicht belastbar.", ausreisserAbsolut: flagsAbs.sort((a, b) => b.z - a.z).slice(0, 10), anzahlAbsolut: flagsAbs.length, ausreisserAnteil: flagsShare.sort((a, b) => b.z - a.z).slice(0, 10), anzahlAnteil: flagsShare.length };
const act = Object.keys(byCountry).filter((cc) => { let d = 0; for (let day = 0; day < 3; day++) { let s = 0; for (let k = h1 - 24 * (day + 1) + 1; k <= h1 - 24 * day; k++) s += byCountry[cc]?.[k] ?? 0; if (s > 0) d++; } return d === 3; }).length;
out.laenderMitEreignissenAnAllenDreiTagen = act;
writeFileSync(join(DATA, "outlier-summary.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));

// Verbindung Ereignis <-> Artikel über die Adresse, für alle Zeitpunkte mit gkg-Dateien.
import { loadEvents, loadGkg, GKG_SLOTS, norm, readZip, gdeltUrl } from "./load.mjs";
const out = [];
for (const ts of GKG_SLOTS) {
  const ex = readZip(gdeltUrl(ts, "export")); if (!ex) { out.push({ slot: ts, fehler: "export fehlt" }); continue; }
  const art = new Map(); for (const r of loadGkg(ts)) art.set(norm(r.url), r);
  let n = 0, hit = 0, title = 0; const byLang = {};
  for (const l of ex.split("\n")) { const c = l.split("\t"); if (c.length < 61) continue; n++; const a = art.get(norm(c[60])); if (a) { hit++; if (a.title) title++; byLang[a.lang] = (byLang[a.lang] ?? 0) + 1; } }
  out.push({ slot: ts, ereignisse: n, gkgArtikel: art.size, verbunden: hit, mitTitel: title, anteilMitTitelProzent: +(100 * title / n).toFixed(1), sprachenDerVerbundenen: Object.fromEntries(Object.entries(byLang).sort((a, b) => b[1] - a[1]).slice(0, 5)) });
}
const tot = out.filter((o) => o.ereignisse); const N = tot.reduce((s, o) => s + o.ereignisse, 0), T = tot.reduce((s, o) => s + o.mitTitel, 0);
console.log(JSON.stringify({ proZeitpunkt: out, gesamt: { ereignisse: N, mitTitel: T, anteilProzent: +(100 * T / N).toFixed(1) } }, null, 2));

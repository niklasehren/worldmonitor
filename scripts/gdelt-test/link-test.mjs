// Verbindet Ereignisse (export, SOURCEURL) mit Artikeln (gkg + translation.gkg, DocumentIdentifier) über die Adresse.
import { cachePath, cached } from "./lib.mjs";
import { execFileSync } from "node:child_process";
const ts = process.argv[2] ?? "20261101030000";
const rd = (kind, ext) => { const u = `http://data.gdeltproject.org/gdeltv2/${ts}.${kind}.${ext}.zip`; return cached(u) ? execFileSync("unzip", ["-p", cachePath(u)], { maxBuffer: 1 << 30 }).toString("utf8") : null; };
const norm = (u) => u.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/#.*$/, "").replace(/\/+$/, "").toLowerCase();
const decode = (s) => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, "&").replace(/&quot;/g, '"');
const ex = rd("export", "CSV"), me = rd("mentions", "CSV"), g1 = rd("gkg", "csv"), g2 = rd("translation.gkg", "csv");
if (!ex || !g1) { console.log("Dateien fehlen für", ts); process.exit(1); }
const art = new Map(); let gRows = 0;
for (const [txt, tr] of [[g1, false], [g2, true]]) if (txt) for (const l of txt.split("\n")) {
  const c = l.split("\t"); if (c.length < 27) continue; gRows++;
  const t = c[26].match(/<PAGE_TITLE>([\s\S]*?)<\/PAGE_TITLE>/)?.[1];
  art.set(norm(c[4]), { title: t ? decode(t) : null, tr });
}
const mentionUrls = new Map();
if (me) for (const l of me.split("\n")) { const c = l.split("\t"); if (c.length < 16) continue; (mentionUrls.get(c[0]) ?? mentionUrls.set(c[0], []).get(c[0])).push(c[5]); }
let n = 0, exact = 0, viaSource = 0, viaMention = 0, withTitle = 0;
for (const l of ex.split("\n")) {
  const c = l.split("\t"); if (c.length < 61) continue; n++;
  const a = art.get(norm(c[60]));
  if (a) { viaSource++; if (a.title) withTitle++; }
  else if ((mentionUrls.get(c[0]) ?? []).some((u) => art.get(norm(u))?.title)) viaMention++;
}
console.log(JSON.stringify({ slot: ts, ereignisse: n, gkgZeilen: gRows, eindeutigeArtikelAdressen: art.size,
  ereignisMitTitelUeberQuellAdresse: withTitle, anteilQuellAdresse: +(100 * viaSource / n).toFixed(1),
  zusaetzlichUeberAndereErwaehnungMitTitel: viaMention, anteilGesamtMitTitel: +(100 * (withTitle + viaMention) / n).toFixed(1) }, null, 2));

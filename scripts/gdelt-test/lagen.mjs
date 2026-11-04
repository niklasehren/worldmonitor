// Aufgabe 9: Lagen (Länderpaare) auf den vorhandenen 3 Tagen. Nur Cache, kein Netzwerk.
import { writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { DATA } from "./lib.mjs";
import { loadEvents, norm, toDate, sample } from "./load.mjs";
import { titleMap, slugText, cleanTitle } from "./common2.mjs";
import { loadGkg } from "./load.mjs";

const LAGEN = {
  "USA-Iran": { paar: [["US", "IR"]], kw: /\b(iran|iranian|tehran|hormuz|vance|revolutionary guard|irgc)\b/i },
  "Russland-Ukraine": { paar: [["RS", "UP"]], kw: /\b(russia|russian|ukrain|kyiv|kiev|moscow|zelensk|putin|donbas|oleshky|kharkiv|odesa)\w*/i },
  "China-Taiwan": { paar: [["CH", "TW"]], kw: /\b(taiwan|taipei|china|chinese|beijing|strait)\b/i },
  "Israel-Gaza/Libanon": { paar: [["IS", "GZ"], ["IS", "WE"], ["IS", "LE"]], kw: /\b(israel|israeli|gaza|hamas|hezbollah|lebanon|beirut|west bank|palestin\w*|idf)\b/i },
  "USA-China": { paar: [["US", "CH"]], kw: /\b(china|chinese|beijing|xi|tariff|nvidia|trade)\b/i },
};
const { events } = loadEvents();
// Titel aus allen vorhandenen gkg-Zeitpunkten
const gk = new Set(); for (const f of readdirSync(join(DATA, "raw"))) { /* Zeitpunkte aus messages.log */ }
import { readFileSync } from "node:fs";
for (const l of readFileSync(join(DATA, "messages.log"), "utf8").split("\n")) { const m = l.match(/ (\d{14}) gkg:/); if (m) gk.add(m[1]); }
const titles = titleMap([...gk]);
const days = new Set([...events.values()].map((e) => e.sqldate)); 
// Feldprüfung: wie oft sind beide Akteursländer gesetzt
let n = 0, both = 0, a1 = 0, a2 = 0, bothDiff = 0; for (const e of events.values()) { n++; if (e.a1geo) a1++; if (e.a2geo) a2++; if (e.a1geo && e.a2geo) { both++; if (e.a1geo !== e.a2geo) bothDiff++; } }
const felder = { ereignisse: n, a1geo: a1, a2geo: a2, beide: both, beideVerschieden: bothDiff };
const tage = 3;
const out = { felder, lagen: {} };
const hourKey = (e) => e.added.slice(0, 10);
for (const [name, L] of Object.entries(LAGEN)) {
  const hits = [...events.values()].filter((e) => L.paar.some(([x, y]) => (e.a1geo === x && e.a2geo === y) || (e.a1geo === y && e.a2geo === x)));
  const st = new Map(); for (const e of hits) { const k = norm(e.url); let s = st.get(k); if (!s) st.set(k, (s = { url: e.url, ev: [], h: e.added.slice(0, 10) })); s.ev.push(e); if (e.added < s.first) s.first = e.added; s.first = s.first && s.first < e.added ? s.first : e.added; }
  const arr = [...st.values()].map((s) => { const t = titles.get(norm(s.url)); return { ...s, titel: t ? cleanTitle(t.title) : "", slug: slugText(s.url) }; });
  const text = (s) => s.titel || s.slug;
  const kwHits = arr.filter((s) => L.kw.test(text(s)));
  const withTitle = arr.filter((s) => s.titel).length;
  // Verlauf: Geschichten pro Stunde (erste Nennung), Goldstein-Mittel je Stunde
  const perHour = {}; for (const s of arr) { const h = s.first.slice(0, 10); (perHour[h] ||= { st: 0, g: [] }).st++; for (const e of s.ev) perHour[h].g.push(e.goldstein); }
  const hours = Object.keys(perHour).sort();
  const vals = hours.map((h) => perHour[h].st); const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
  const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / (vals.length || 1));
  const gm = hours.map((h) => perHour[h].g.reduce((a, b) => a + b, 0) / perHour[h].g.length);
  const gall = hits.map((e) => e.goldstein); const gmean = gall.reduce((a, b) => a + b, 0) / (gall.length || 1);
  const gsd = Math.sqrt(gall.reduce((a, b) => a + (b - gmean) ** 2, 0) / (gall.length || 1));
  const roots = {}; for (const e of hits) roots[e.root] = (roots[e.root] || 0) + 1;
  out.lagen[name] = { ereignisse: hits.length, ereignisseProTag: +(hits.length / tage).toFixed(1), geschichten: arr.length, geschichtenProTag: +(arr.length / tage).toFixed(1), mitTitel: withTitle, stichwortTreffer: kwHits.length, stundenMitGeschichten: hours.length, stundenGesamt: 72, geschichtenProStundeMittel: +mean.toFixed(2), sd: +sd.toFixed(2), goldsteinMittel: +gmean.toFixed(2), goldsteinSd: +gsd.toFixed(2), goldsteinStundenMin: +Math.min(...gm).toFixed(2), goldsteinStundenMax: +Math.max(...gm).toFixed(2), wurzeln: Object.entries(roots).sort((a, b) => b[1] - a[1]).slice(0, 6),
    verlaufStunden: hours.map((h, i) => [h, vals[i], +gm[i].toFixed(1)]),
    probeNurPaar: sample(arr, 20, 77).map((s) => ({ t: text(s), quelle: s.titel ? "titel" : "adresse", kw: L.kw.test(text(s)), land: `${s.ev[0].a1geo}-${s.ev[0].a2geo}`, a: `${s.ev[0].a1name}/${s.ev[0].a2name}`, nm: s.ev.reduce((a, e) => a + e.nm, 0), url: s.url.slice(0, 100) })),
    probePaarUndStichwort: sample(kwHits, 20, 78).map((s) => ({ t: text(s), quelle: s.titel ? "titel" : "adresse", nm: s.ev.reduce((a, e) => a + e.nm, 0), url: s.url.slice(0, 100) })),
    beispieleNachM: [...arr].sort((a, b) => b.ev.reduce((x, e) => x + e.nm, 0) - a.ev.reduce((x, e) => x + e.nm, 0)).slice(0, 8).map((s) => ({ t: text(s), nm: s.ev.reduce((x, e) => x + e.nm, 0), quelle: s.titel ? "titel" : "adresse" })) };
}
writeFileSync(join(DATA, "lagen-summary.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.felder));
for (const [k, v] of Object.entries(out.lagen)) console.log(k, v.ereignisse, v.ereignisseProTag, v.geschichten, v.geschichtenProTag, "mitTitel", v.mitTitel, "kw", v.stichwortTreffer, "std", v.stundenMitGeschichten, "gm", v.goldsteinMittel, v.goldsteinSd);

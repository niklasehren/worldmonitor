// Aufgabe 6: Auswertung der geladenen Übersetzungsdateien (nur Cache, kein Netzwerk).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { RAW, DATA } from "./lib.mjs";
import { readZip, gdeltUrl, norm, toDate, fmt } from "./load.mjs";
import { classOf, cname } from "./common2.mjs";

const slots = new Set();
for (const f of readdirSync(RAW).filter((x) => x.endsWith(".json"))) {
  const m = readFileSync(join(RAW, f), "utf8").match(/gdeltv2\/(\d{14})\.translation\.export/);
  if (m) slots.add(m[1]);
}
const list = [...slots].sort();
const events = new Map(), per = new Map(); const langs = {}; let nEv = 0, nMe = 0;
const urlOf = new Map();
for (const ts of list) {
  const ex = readZip(gdeltUrl(ts, "translation.export")), me = readZip(gdeltUrl(ts, "translation.mentions"));
  if (ex) for (const l of ex.split("\n")) { const c = l.split("\t"); if (c.length < 58) continue; nEv++;
    events.set(c[0], { id: c[0], root: c[28], code: c[26], cc: c[53], url: norm(c[60] ?? ""), nm: +c[31], date: c[59], sources: new Map() }); }
  if (me) for (const l of me.split("\n")) { const c = l.split("\t"); if (c.length < 15) continue; nMe++;
    const lang = (c[14].match(/srclc:(\w+)/) || [, "?"])[1]; langs[lang] = (langs[lang] || 0) + 1;
    const e = events.get(c[0]); if (e && c[3] === "1") { const t = toDate(c[2] + "").getTime(); const cur = e.sources.get(c[4]); if (cur === undefined || t < cur) e.sources.set(c[4], t); } }
}
const byCountry = {}; let severe = 0; const sevCountry = {};
for (const e of events.values()) { const k = e.cc || "ohne"; byCountry[k] = (byCountry[k] || 0) + 1; if (["18", "19", "20"].includes(e.root)) { severe++; sevCountry[k] = (sevCountry[k] || 0) + 1; } }
// Stories nach Adresse, Auslöser: schwere Codes, >=2 Medien binnen 60 min nach erster Nennung
const stories = new Map();
for (const e of events.values()) { if (!e.url) continue; let s = stories.get(e.url); if (!s) stories.set(e.url, (s = { url: e.url, ccs: {}, severe: false, srcs: new Map(), nm: 0 })); s.ccs[e.cc || ""] = (s.ccs[e.cc || ""] || 0) + 1; s.nm += e.nm; if (["18", "19", "20"].includes(e.root)) s.severe = true; for (const [k, t] of e.sources) { const c = s.srcs.get(k); if (c === undefined || t < c) s.srcs.set(k, t); } }
const trig = []; for (const s of stories.values()) { if (!s.severe) continue; const ts = [...s.srcs.values()].sort((a, b) => a - b); if (!ts.length) continue; const n60 = ts.filter((t) => t - ts[0] <= 3600000).length; if (n60 >= 2) trig.push({ url: s.url, cc: Object.entries(s.ccs).sort((a, b) => b[1] - a[1])[0][0], n60 }); }
const trigCountry = {}; for (const t of trig) { const k = classOf(t.cc) + ":" + cname(t.cc); trigCountry[k] = (trigCountry[k] || 0) + 1; }
const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);
const topStories = [...stories.values()].sort((a, b) => b.nm - a.nm).slice(0, 20).map((s) => ({ url: s.url.slice(0, 90), land: cname(Object.entries(s.ccs).sort((a, b) => b[1] - a[1])[0][0]), nm: s.nm }));
const out = { slots: list.length, von: list[0], bis: list.at(-1), ereignisse: nEv, erwaehnungen: nMe, sprachenTop: top(langs, 12), landTop: top(byCountry, 15).map(([k, v]) => [cname(k), v]), schwereEreignisse: severe, schwereLandTop: top(sevCountry, 10).map(([k, v]) => [cname(k), v]),
  brasilEreignisse: byCountry["BR"] || 0, portugalEreignisse: byCountry["PO"] || 0, spanienEreignisse: byCountry["SP"] || 0, mexikoEreignisse: byCountry["MX"] || 0, geschichten: stories.size, ausloeserV0: trig.length, ausloeserLand: top(trigCountry, 12), topGeschichtenNachM: topStories };
writeFileSync(join(DATA, "t6-summary.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));

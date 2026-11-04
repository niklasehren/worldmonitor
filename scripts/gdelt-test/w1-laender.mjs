// Runde 4, Teil 2, Aufgabe 5: Länder-/Regionen-Seiten, Machbarkeit. Nur Cache.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DATA, cached } from "./lib.mjs";
import { loadEvents, norm, sample, readZip, gdeltUrl, GKG_SLOTS } from "./load.mjs";
import { cname, cleanTitle, slugText } from "./common2.mjs";
import { loadTitles } from "./r3common.mjs";
const { events } = loadEvents(); const TM = loadTitles();
const L = { Iran: "IR", Israel: "IS", USA: "US", Russland: "RS", Ukraine: "UP", China: "CH", Taiwan: "TW", Nordkorea: "KN", Südkorea: "KS", Brasilien: "BR" };
const tage = 2.99;
const st = new Map();
for (const e of events.values()) { const k = norm(e.url); if (!k) continue; let s = st.get(k); if (!s) st.set(k, (s = { k, url: e.url, act: new Set(), ak: new Set() })); if (e.country) s.act.add(e.country); if (e.a1geo) s.ak.add(e.a1geo); if (e.a2geo) s.ak.add(e.a2geo); }
const readable = (t) => { if (!t) return false; const w = t.split(/\s+/).filter(Boolean); return /\p{L}/u.test(t) && w.length >= 3 && t.length >= 15 && !/^(article|p)$/i.test(t); };
const out = { a: {}, b: {} };
for (const [n, c] of Object.entries(L)) {
  const fa = [...st.values()].filter((s) => s.act.has(c)), fk = [...st.values()].filter((s) => s.ak.has(c));
  const lt = (arr) => arr.filter((s) => { const t = TM.get(s.k)?.title; return t && readable(cleanTitle(t)); }).length;
  out.a[n] = { ereignislandGesch: fa.length, proTag: +(fa.length / tage).toFixed(0), lesbarTitel: lt(fa), lesbarProTag: +(lt(fa) / tage).toFixed(1), akteurslandGesch: fk.length, akteurProTag: +(fk.length / tage).toFixed(0), akteurLesbar: lt(fk), akteurLesbarProTag: +(lt(fk) / tage).toFixed(1) };
  const cnt = {}; for (const e of events.values()) { const partner = e.a1geo === c && e.a2geo && e.a2geo !== c ? e.a2geo : e.a2geo === c && e.a1geo && e.a1geo !== c ? e.a1geo : null; if (partner) cnt[partner] = (cnt[partner] ?? 0) + 1; }
  out.b[n] = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${cname(k)} ${v}`);
}
console.log("a) pro Tag (Geschichten nach Adresse; 'lesbar' = gkg-Titel vorhanden und lesbar)"); for (const [n, v] of Object.entries(out.a)) console.log(n.padEnd(10), JSON.stringify(v)); console.log("\nb) Top-5-Partnerländer (Ereignisse, Akteur 1/2 mit Land)"); for (const [n, v] of Object.entries(out.b)) console.log(n.padEnd(10), v.join(" | "));
// c) Lagen-Paare
const LAG = { "Nordkorea–Südkorea": { paar: [["KN", "KS"]], kw: /\b(north korea\w*|south korea\w*|pyongyang|seoul|kim jong|dmz|korean peninsula|korean)\b/i }, "Iran–Israel–USA": { paar: [["IR", "IS"], ["IR", "US"]], kw: /\b(iran\w*|tehran|hormuz|khamenei|irgc|israel\w* (strike|attack|forces)|us[- ]israel)\b/i } };
const pairSet = new Map(); for (const e of events.values()) { const k = norm(e.url); if (!k || !e.a1geo || !e.a2geo) continue; (pairSet.get(k) ?? pairSet.set(k, new Set()).get(k)).add(e.a1geo + ">" + e.a2geo).add(e.a2geo + ">" + e.a1geo); }
out.c = {};
for (const [n, cfg] of Object.entries(LAG)) {
  const hit = []; for (const [k, ps] of pairSet) { if (!cfg.paar.some(([a, b]) => ps.has(a + ">" + b))) continue; const s = st.get(k); const t = TM.get(k)?.title; const text = t ? cleanTitle(t) : slugText(s.url); if (cfg.kw.test(text)) hit.push({ text, lesbar: !!t && readable(text), url: s.url }); }
  const lesbar = hit.filter((h) => h.lesbar); const pool = lesbar.length >= 20 ? lesbar : hit; const pick = sample(pool.sort((a, b) => (a.url < b.url ? -1 : 1)), 20, 41);
  out.c[n] = { treffer: hit.length, proTag: +(hit.length / tage).toFixed(1), lesbar: lesbar.length, poolFuerStichprobe: lesbar.length >= 20 ? "nur lesbarer Titel" : "alle (zu wenige Titel)", stichprobe: pick.map((h) => h.text.replace(/\s+/g, " ").slice(0, 100)) };
  console.log(`\n### ${n}: Paar+Stichwort ${hit.length} Geschichten (${out.c[n].proTag}/Tag), mit lesbarem Titel ${lesbar.length}; Stichprobe aus: ${out.c[n].poolFuerStichprobe}`); out.c[n].stichprobe.forEach((x, i) => console.log(i + 1, x));
}
// d) Städte in gkg V2Locations (Typ 3 = US-Stadt, 4 = Welt-Stadt)
const slots = GKG_SLOTS.filter((ts) => cached(gdeltUrl(ts, "gkg", "csv"))); let arts = 0, withCity = 0, locsAll = 0, locsCity = 0, cityMatchCountry = 0, cityN = 0; const ex = []; const types = {};
for (const ts of slots) { const txt = readZip(gdeltUrl(ts, "gkg", "csv")); if (!txt) continue; for (const l of txt.split("\n")) { const c = l.split("\t"); if (c.length < 27) continue; arts++; const locs = (c[10] ?? "").split(";").map((x) => x.split("#")).filter((x) => x.length > 5); if (!locs.length) continue; let has = false; const cc = {}; for (const x of locs) cc[x[2]] = (cc[x[2]] ?? 0) + 1; const top = Object.entries(cc).sort((a, b) => b[1] - a[1])[0]?.[0];
    for (const x of locs) { locsAll++; types[x[0]] = (types[x[0]] ?? 0) + 1; if (x[0] === "3" || x[0] === "4") { locsCity++; has = true; cityN++; if (x[2] === top) cityMatchCountry++; } }
    if (has) { withCity++; if (ex.length < 400) ex.push({ title: (c[26].match(/<PAGE_TITLE>([\s\S]*?)<\/PAGE_TITLE>/)?.[1] ?? "").slice(0, 70), cities: locs.filter((x) => x[0] === "3" || x[0] === "4").slice(0, 3).map((x) => x[1]) }); } } }
const exs = sample(ex.filter((e) => e.title), 5, 51);
out.d = { slots: slots.length, artikel: arts, mitStadt: withCity, anteilMitStadt: +(withCity / arts * 100).toFixed(1), ortsangabenGesamt: locsAll, davonStadt: locsCity, anteilStadtOrte: +(locsCity / locsAll * 100).toFixed(1), typen: types, stadtLandGleichHaeufigstesLand: +(cityMatchCountry / cityN * 100).toFixed(1), beispiele: exs };
console.log("\nd)", JSON.stringify(out.d, null, 1));
writeFileSync(join(DATA, "w1-laender.json"), JSON.stringify(out, null, 1));

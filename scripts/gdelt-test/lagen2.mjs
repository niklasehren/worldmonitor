// Runde 3, Aufgabe 6: Lagen schärfen. Entwicklungsmenge (hash<0,5) für Wortlisten, Prüfmenge (hash>=0,5) nur zum Beurteilen.
import { loadEvents, norm, sample } from "./load.mjs";
import { slugText, cleanTitle } from "./common2.mjs";
import { loadTitles, hash } from "./r3common.mjs";
import { DATA } from "./lib.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const LAGEN = {
  "USA-Iran": { paar: [["US", "IR"]], kw: /\b(iran\w*|tehran|hormuz|khamenei|irgc|revolutionary guards?)\b/i },
  "Russland-Ukraine": { paar: [["RS", "UP"]], kw: /\b(ukrain\w*|kyiv|kiev|zelensk\w*|donbas|oleshky|kharkiv|odesa|dnipro|crimea|pokrovsk|zaporizhzhia|kherson)\b/i },
  "China-Taiwan": { paar: [["CH", "TW"]], kw: /\b(taiwan\w*|taipei|kinmen|matsu|one-china|huangyan|south china sea)\b/i },
  "Israel-Gaza/Libanon": { paar: [["IS", "GZ"], ["IS", "WE"], ["IS", "LE"]], kw: /\b(gaza|hamas|hezbollah|lebanon|lebanese|beirut|west bank|palestin\w*|idf|israeli (forces|military|army|strike|settler)\w*)\b/i },
  "USA-China": { paar: [["US", "CH"]], kw: /\b((china|chinese|beijing)\b.*\b(u\.?s\.?|american|washington|trump|tariffs?|nvidia|export controls?|rare earths?|chips?)|(u\.?s\.?|american|washington|trump|tariffs?|nvidia|export controls?|rare earths?|chips?)\b.*\b(china|chinese|beijing))\b/i },
};
const { events } = loadEvents(); const TM = loadTitles();
const st = new Map();
for (const e of events.values()) { const k = norm(e.url); if (!k) continue; let s = st.get(k); if (!s) st.set(k, (s = { url: e.url, k, pairs: new Set(), first: e.added, nm: 0 })); s.nm += e.nm; if (e.added < s.first) s.first = e.added; if (e.a1geo && e.a2geo) { s.pairs.add(e.a1geo + ">" + e.a2geo); s.pairs.add(e.a2geo + ">" + e.a1geo); } }
for (const s of st.values()) { const t = TM.get(s.k)?.title; s.text = t ? cleanTitle(t) : slugText(s.url); s.hasT = !!t; s.menge = hash(s.k, 31337) < 0.5 ? "entw" : "pruef"; }
const rows = [...st.values()];
const out = { geschichtenGesamt: rows.length, lagen: {} }; const show = (s) => `${s.hasT ? "T" : "A"} ${s.text.replace(/\s+/g, " ").slice(0, 90)}`;
for (const [name, L] of Object.entries(LAGEN)) {
  const isPair = (s) => L.paar.some(([a, b]) => s.pairs.has(a + ">" + b));
  const kw = rows.filter((s) => L.kw.test(s.text)); const pr = rows.filter(isPair); const both = rows.filter((s) => isPair(s) && L.kw.test(s.text)); const kwOnly = kw.filter((s) => !isPair(s));
  const days = (arr) => { const d = {}; for (const s of arr) { const k = s.first.slice(0, 8); d[k] = (d[k] ?? 0) + 1; } return d; };
  const kwT = kw.filter((s) => s.hasT).length;
  out.lagen[name] = { paar: pr.length, stichwort: kw.length, beide: both.length, nurStichwort: kwOnly.length, nurPaar: pr.length - both.length, anteilStichwortAuchPaar: +(both.length / kw.length * 100).toFixed(1), anteilPaarAuchStichwort: +(both.length / pr.length * 100).toFixed(1), stichwortMitTitel: kwT,
    tageBeide: days(both), tageStichwort: days(kw),
    probeBeide: sample(both.filter((s) => s.menge === "pruef"), 20, 71).map(show), probeNurStichwort: sample(kwOnly.filter((s) => s.menge === "pruef"), 20, 72).map(show), pruefBeideAnzahl: both.filter((s) => s.menge === "pruef").length, pruefNurStichwortAnzahl: kwOnly.filter((s) => s.menge === "pruef").length };
  // Tagesverlauf (Ereignis-Eingangstag, UTC)
}
writeFileSync(join(DATA, "lagen2.json"), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out.lagen)) { console.log(`\n### ${k}: Paar ${v.paar}, Stichwort ${v.stichwort}, beide ${v.beide}, nurStichwort ${v.nurStichwort}, nurPaar ${v.nurPaar}; %Stichwort∩Paar ${v.anteilStichwortAuchPaar}; %Paar∩Stichwort ${v.anteilPaarAuchStichwort}; Prüfmenge beide ${v.pruefBeideAnzahl}, nurStichwort ${v.pruefNurStichwortAnzahl}`); console.log("Tage beide", JSON.stringify(v.tageBeide), "Stichwort", JSON.stringify(v.tageStichwort)); console.log("-- beide"); v.probeBeide.forEach((x, i) => console.log(i + 1, x)); console.log("-- nur Stichwort"); v.probeNurStichwort.forEach((x, i) => console.log(i + 1, x)); }

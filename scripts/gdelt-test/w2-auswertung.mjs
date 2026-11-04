// Runde 4, Nachtlauf, offline: Titelabdeckung des letzten vollen Tages, Zählungen D1/W1-W3/Top 20/Lagen mit Titel, vorher/nachher.
// Aufruf: node w2-auswertung.mjs   (vorher = gkg-Zeitpunkte, die vor Beginn des Nachtlaufs geladen waren; nachher = alle)
import { loadEvents, min, stamps, norm, sample, gdeltUrl } from "./load.mjs";
import { buildGroups } from "./stories.mjs";
import { tokens, jaccard, slugText, cleanTitle, classOf, cname, primary, titleMap } from "./common2.mjs";
import { gkgSlots } from "./r3common.mjs";
import { DATA, cached, readMeta } from "./lib.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const START = "2026-11-02T04:30:00Z"; // Beginn des Nachtlaufs (Downloads danach = "nachher")
const { events, mentions } = loadEvents(); const groups = buildGroups(events, mentions);
const tEnd = min(stamps.at(-1)), dayStart = min(stamps.at(-96)), tStartAll = min(stamps[0]);
const logSlots = gkgSlots(); // wie in den früheren Auswertungen: nur Zeitpunkte, die im Protokoll als "gkg" stehen
const slotsAll = stamps.filter((ts) => cached(gdeltUrl(ts, "gkg", "csv"))); // alle vorhandenen gkg-Zeitpunkte im Datenfenster
const vorSlots = slotsAll.filter((ts) => Date.parse(readMeta(gdeltUrl(ts, "gkg", "csv")).fetchedAt) < Date.parse(START));
const dayStamps = stamps.slice(-96); const dayVor = dayStamps.filter((ts) => vorSlots.includes(ts)).length, dayAll = dayStamps.filter((ts) => slotsAll.includes(ts)).length, dayLog = dayStamps.filter((ts) => logSlots.includes(ts)).length;
console.log("gkg-Zeitpunkte im Datenfenster: Protokoll-Liste", logSlots.length, "| vorhanden vor Nachtlauf", vorSlots.length, "| nachher", slotsAll.length, "| im letzten Tag:", dayLog, "/", dayVor, "/", dayAll, "von 96");
// Titelbereinigung (Kurzfassung der Regeln aus t2-titel.mjs)
const dec = (s) => s.replace(/&amp;/gi, "&").replace(/&quot;|&#39;|&apos;/gi, "'").replace(/\s+/g, " ").trim(); const SEP = / (?:[-–—|•·»:]|::) /;
const domBase = (d) => (d || "").toLowerCase().replace(/^www\./, "").split(".")[0].replace(/[^a-z0-9]/g, ""); const flat = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
function clean(t, domain) { let s = dec(t); s = s.replace(/([A-Z][\w' ]{6,}?)\1$/, "$1"); for (let i = 0; i < 3; i++) { const p = s.split(SEP); if (p.length < 2) break; const last = p.at(-1).trim(); const dn = domBase(domain); const isName = last.split(/\s+/).length <= 5 && (flat(last).includes(dn.slice(0, 5)) || dn.includes(flat(last).slice(0, 5)) || last.split(/\s+/).length <= 3); if (isName && p.slice(0, -1).join(" ").length >= 15) s = p.slice(0, -1).join(" - ").trim(); else break; } return s; }
const GENERIC = /^(home|homepage|untitled|index|news|breaking news|latest news|weather|error|404|page not found|not found|article|p|tag:.*|category:.*)$/i;
const readable = (t) => { if (!t || !/\p{L}/u.test(t) || GENERIC.test(t)) return false; const cjk = /[぀-ヿ㐀-鿿가-힯]/.test(t); return cjk ? t.length >= 8 : (t.split(/\s+/).length >= 3 && t.length >= 15); };
const D = [30, 60, 120];
const LAGEN = { "USA-Iran": { paar: [["US", "IR"]], kw: /\b(iran\w*|tehran|hormuz|khamenei|irgc|revolutionary guards?)\b/i }, "Russland-Ukraine": { paar: [["RS", "UP"]], kw: /\b(ukrain\w*|kyiv|kiev|zelensk\w*|donbas|oleshky|kharkiv|odesa|dnipro|crimea|pokrovsk|zaporizhzhia|kherson)\b/i }, "China-Taiwan": { paar: [["CH", "TW"]], kw: /\b(taiwan\w*|taipei|kinmen|matsu|one-china|huangyan|south china sea)\b/i }, "Israel-Gaza/Libanon": { paar: [["IS", "GZ"], ["IS", "WE"], ["IS", "LE"]], kw: /\b(gaza|hamas|hezbollah|lebanon|lebanese|beirut|west bank|palestin\w*|idf|israeli (forces|military|army|strike|settler)\w*)\b/i }, "USA-China": { paar: [["US", "CH"]], kw: /\b((china|chinese|beijing)\b.*\b(u\.?s\.?|american|washington|trump|tariffs?|nvidia|export controls?|rare earths?|chips?)|(u\.?s\.?|american|washington|trump|tariffs?|nvidia|export controls?|rare earths?|chips?)\b.*\b(china|chinese|beijing))\b/i }, "Nordkorea-Südkorea": { paar: [["KN", "KS"]], kw: /\b(north korea\w*|south korea\w*|pyongyang|seoul|kim jong|dmz|korean peninsula|korean)\b/i }, "Iran-Israel-USA": { paar: [["IR", "IS"], ["IR", "US"]], kw: /\b(iran\w*|tehran|hormuz|khamenei|irgc|israel\w* (strike|attack|forces)|us[- ]israel)\b/i } };
const pairs = new Map(); for (const e of events.values()) { const k = norm(e.url); if (!k || !e.a1geo || !e.a2geo) continue; (pairs.get(k) ?? pairs.set(k, new Set()).get(k)).add(e.a1geo + ">" + e.a2geo).add(e.a2geo + ">" + e.a1geo); }
const e1 = JSON.parse(readFileSync(join(DATA, "e1-stories.json"), "utf8")).list; const d1all = e1.filter((r) => r.vars.includes("D1"));
function zustand(slots) {
  const TM = titleMap(slots); const titleOk = (url) => { const r = TM.get(norm(url)); if (!r) return null; const c = clean(r.title, r.domain); return readable(c) ? c : null; };
  // A) Abdeckung: Geschichten (nach Adresse) mit erster Nennung im letzten Tag
  const inDay = []; for (const g of groups.values()) { if (!g.ms.length) continue; const t1 = g.ms[0].tm; if (t1 >= dayStart && t1 <= tEnd) inDay.push(g); }
  const covAll = inDay.filter((g) => titleOk(g.rep.url)).length;
  const m3 = inDay.filter((g) => new Set(g.ms.map((m) => m.src)).size >= 3); const cov3 = m3.filter((g) => titleOk(g.rep.url)).length;
  // B) W-Varianten (Pipeline wie w1-wachstum.mjs; Kandidaten mit >= 2 Medien nach 120 min; Titel-Merge >= 0,8)
  const st = []; for (const g of groups.values()) { if (!g.ms.length) continue; const t1 = g.ms[0].tm; if (t1 < dayStart || t1 > tEnd - 120) continue; const m = D.map((d) => { const s = new Set(); for (const x of g.ms) { if (x.tm - t1 > d) break; s.add(x.src); } return s; }); if (m[2].size < 2) continue; const c = titleOk(g.rep.url); st.push({ g, t1, m, c, text: c || slugText(g.rep.url), tk: tokens(c || slugText(g.rep.url)), cc: g.countries }); }
  const par = st.map((_, i) => i); const find = (i) => (par[i] === i ? i : (par[i] = find(par[i]))); for (let i = 0; i < st.length; i++) { if (st[i].tk.size < 4) continue; for (let j = i + 1; j < st.length; j++) { if (st[j].tk.size < 4 || Math.abs(st[i].t1 - st[j].t1) > 1440) continue; if (jaccard(st[i].tk, st[j].tk) >= 0.8) par[find(j)] = find(i); } }
  const gm = new Map(); st.forEach((s, i) => { const k = find(i); (gm.get(k) ?? gm.set(k, []).get(k)).push(s); });
  const merged = [...gm.values()].map((arr) => { const t1 = Math.min(...arr.map((s) => s.t1)); const ms = arr.flatMap((s) => s.g.ms).sort((a, b) => a.tm - b.tm); const m = D.map((d) => { const s = new Set(); for (const x of ms) { if (x.tm - t1 > d) break; s.add(x.src); } return s.size; }); const best = arr.find((s) => s.c); return { keys: arr.map((s) => s.g.key), m30: m[0], m120: m[2], lesbar: !!best }; });
  const tageW = (tEnd - 120 - dayStart) / 1440; const W = { W1: (s) => s.m120 >= 5, W2: (s) => s.m120 >= 10, W3: (s) => s.m30 >= 3 && s.m120 >= 8 }; const wout = {};
  for (const [n, f] of Object.entries(W)) { const a = merged.filter(f); const l = a.filter((s) => s.lesbar); wout[n] = { gesamt: a.length, proTag: +(a.length / tageW).toFixed(1), mitTitel: l.length, mitTitelProTag: +(l.length / tageW).toFixed(1), anteil: +(l.length / a.length * 100).toFixed(1) }; }
  // C) D1 (aus Runde 3: Auslöser-Liste) im letzten Tag, mit Titel
  const d1 = d1all.filter((r) => r.first >= dayStart && r.first <= tEnd - 60); const d1t = d1.filter((r) => titleOk(r.key.startsWith("http") ? r.key : "http://" + r.key));
  // D) Top 20 der rohen Medienzahl (Alterungsabschlag), 8 Zeitpunkte im Abstand von 3 h im letzten Tag
  let tot = 0, tit = 0; for (let c = 0; c < 8; c++) { const cut = tEnd - c * 180; const rows = []; for (const g of groups.values()) { if (!g.ms.length || g.ms[0].tm > cut) continue; let latest = -1; const srcs = new Set(); for (const m of g.ms) { if (m.tm > cut) break; srcs.add(m.src); latest = m.tm; } if (cut - latest > 1440) continue; rows.push([g, srcs.size * Math.pow(0.5, (cut - latest) / 720)]); } rows.sort((a, b) => b[1] - a[1]); for (const [g] of rows.slice(0, 20)) { tot++; if (titleOk(g.rep.url)) tit++; } }
  // E) Lagen: Geschichten pro Tag im letzten Tag (Paar und Stichwort), davon mit lesbarem Titel
  const lg = {}; const tageL = (tEnd - dayStart) / 1440;
  for (const [n, cfg] of Object.entries(LAGEN)) { let all = 0, lt = 0; for (const g of inDay) { const ps = pairs.get(g.key); if (!ps || !cfg.paar.some(([a, b]) => ps.has(a + ">" + b))) continue; const c = titleOk(g.rep.url); const text = c || slugText(g.rep.url); if (!cfg.kw.test(text)) continue; all++; if (c) lt++; } lg[n] = { gesamt: all, proTag: +(all / tageL).toFixed(1), mitTitel: lt, mitTitelProTag: +(lt / tageL).toFixed(1), anteil: all ? +(lt / all * 100).toFixed(1) : 0 }; }
  return { gkgZeitpunkte: slots.length, abdeckung: { geschichtenImTag: inDay.length, mitTitel: covAll, anteil: +(covAll / inDay.length * 100).toFixed(1), mind3Medien: m3.length, mind3MitTitel: cov3, anteil3: +(cov3 / m3.length * 100).toFixed(1) }, W: wout, D1: { gesamt: d1.length, mitTitel: d1t.length, proTag: +(d1.length / ((tEnd - 60 - dayStart) / 1440)).toFixed(1), mitTitelProTag: +(d1t.length / ((tEnd - 60 - dayStart) / 1440)).toFixed(1) }, top20: { eintraege: tot, mitTitel: tit, anteil: +(tit / tot * 100).toFixed(1) }, lagen: lg };
}
const out = { tagVon: stamps.at(-96), tagBis: stamps.at(-1), gkgImTag: { protokollListe: dayLog, vorNachtlauf: dayVor, nachNachtlauf: dayAll }, frueherAuswertung: zustand(logSlots), vorNachtlauf: zustand(vorSlots), nachNachtlauf: zustand(slotsAll) };
writeFileSync(join(DATA, "w2-auswertung.json"), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));

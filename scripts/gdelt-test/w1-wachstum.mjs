// Runde 4: schnell wachsende Geschichten (Medien nach 30/60/120 Minuten ab erster Nennung). Nur Cache, kein Netzwerk.
import { loadEvents, min, stamps, norm, sample } from "./load.mjs";
import { buildGroups } from "./stories.mjs";
import { tokens, jaccard, slugText, cleanTitle, classOf, cname, primary } from "./common2.mjs";
import { loadTitles } from "./r3common.mjs";
import { DATA } from "./lib.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const t0 = Date.now(); const el = () => `${((Date.now() - t0) / 1000).toFixed(0)} s`;
const { events, mentions } = loadEvents(); const groups = buildGroups(events, mentions); const TM = loadTitles();
const tStart = min(stamps[0]), tEnd = min(stamps.at(-1)); console.log("geladen", el());
// Titelbereinigung (Kurzfassung der Regeln aus t2-titel.mjs)
const dec = (s) => s.replace(/&amp;/gi, "&").replace(/&quot;|&#39;|&apos;/gi, "'").replace(/\s+/g, " ").trim();
const SEP = / (?:[-–—|•·»:]|::) /;
const domBase = (d) => (d || "").toLowerCase().replace(/^www\./, "").split(".")[0].replace(/[^a-z0-9]/g, "");
const flat = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
function clean(t, domain) { let s = dec(t); s = s.replace(/([A-Z][\w' ]{6,}?)\1$/, "$1");
  for (let i = 0; i < 3; i++) { const p = s.split(SEP); if (p.length < 2) break; const last = p.at(-1).trim(); const dn = domBase(domain); const isName = last.split(/\s+/).length <= 5 && (flat(last).includes(dn.slice(0, 5)) || dn.includes(flat(last).slice(0, 5)) || last.split(/\s+/).length <= 3); if (isName && p.slice(0, -1).join(" ").length >= 15) s = p.slice(0, -1).join(" - ").trim(); else break; } return s; }
const GENERIC = /^(home|homepage|untitled|index|news|breaking news|latest news|weather|error|404|page not found|not found|article|p|tag:.*|category:.*)$/i;
function readable(t) { if (!t) return false; if (!/\p{L}/u.test(t) || GENERIC.test(t)) return false; const cjk = /[぀-ヿ㐀-鿿가-힯]/.test(t); return cjk ? t.length >= 8 : (t.split(/\s+/).length >= 3 && t.length >= 15); }
// Kandidaten: URL-Geschichten mit erster Nennung im Fenster und >= 120 min Beobachtungszeit
const D = [30, 60, 120];
const stories = [];
for (const g of groups.values()) { if (!g.ms.length) continue; const t1 = g.ms[0].tm; if (t1 < tStart || t1 > tEnd - 120) continue;
  const m = D.map((d) => { const s = new Set(); for (const x of g.ms) { if (x.tm - t1 > d) break; s.add(x.src); } return s; });
  stories.push({ keys: [g.key], url: g.rep.url, t1, srcs: m, countries: { ...g.countries }, ms: g.ms }); }
console.log("Geschichten im Fenster mit >=120 min Beobachtung:", stories.length, el());
// Zusammenfassen: Titelähnlichkeit >= 0,8 (mind. 4 Wörter) nur unter Kandidaten mit >= 2 Medien nach 120 min (Annahme: Rest bleibt unverändert)
const cand = stories.filter((s) => s.srcs[2].size >= 2).map((s) => { const r = TM.get(norm(s.url)); const raw = r?.title ? clean(r.title, r.domain) : ""; const text = raw || slugText(s.url); return { ...s, text, hasT: !!raw, tk: tokens(text), row: r }; });
const par = cand.map((_, i) => i); const find = (i) => (par[i] === i ? i : (par[i] = find(par[i])));
for (let i = 0; i < cand.length; i++) { if (cand[i].tk.size < 4) continue; for (let j = i + 1; j < cand.length; j++) { if (cand[j].tk.size < 4) continue; if (Math.abs(cand[i].t1 - cand[j].t1) > 1440) continue; if (jaccard(cand[i].tk, cand[j].tk) >= 0.8) par[find(j)] = find(i); } }
const gm = new Map(); cand.forEach((s, i) => { const k = find(i); (gm.get(k) ?? gm.set(k, []).get(k)).push(s); });
const merged = [...gm.values()].map((arr) => { const t1 = Math.min(...arr.map((s) => s.t1)); const ms = arr.flatMap((s) => s.ms).sort((a, b) => a.tm - b.tm); const m = D.map((d) => { const s = new Set(); for (const x of ms) { if (x.tm - t1 > d) break; s.add(x.src); } return s; });
  const cc = {}; arr.forEach((s) => { for (const [c, n] of Object.entries(s.countries)) cc[c] = (cc[c] ?? 0) + n; }); const best = arr.reduce((a, b) => (b.srcs[2].size > a.srcs[2].size ? b : a)); const rowT = arr.find((s) => s.hasT);
  const dom = new Set(ms.map((x) => x.src)); const tld = new Set([...dom].map((d) => d.split(".").pop().toLowerCase()));
  return { nDomains: dom.size, tlds: [...tld], keys: arr.flatMap((s) => s.keys), n: arr.length, url: best.url, t1, m30: m[0].size, m60: m[1].size, m120: m[2].size, cc, text: rowT ? rowT.text : best.text, hasT: !!rowT, row: (rowT ?? best).row }; });
console.log("Kandidaten", cand.length, "nach Zusammenfassen", merged.length, el());
// Land: häufigstes gkg-Land, sonst Aktionsland
const mostFreq = (locs) => { const c = {}; for (const l of locs ?? []) if (l.fips) c[l.fips] = (c[l.fips] ?? 0) + 1; return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""; };
for (const s of merged) { const g = mostFreq(s.row?.locs); s.gkgLand = g; s.aktLand = primary(s.cc); s.land = g || s.aktLand; s.landQuelle = g ? "gkg" : (s.aktLand ? "Aktionsland" : "keins"); s.klasse = classOf(s.land); }
// D1-Menge und Top 20 der rohen Medienzahl (24 Zeitpunkte im Abstand von 3 h)
const e1 = JSON.parse(readFileSync(join(DATA, "e1-stories.json"), "utf8")).list; const d1 = new Set(e1.filter((r) => r.vars.includes("D1")).map((r) => r.key));
const top20 = new Set(); const last = tEnd;
for (let c = 0; c < 24; c++) { const cut = last - c * 180; const rows = [];
  for (const g of groups.values()) { if (!g.ms.length || g.ms[0].tm > cut) continue; let latest = -1; const srcs = new Set(); for (const m of g.ms) { if (m.tm > cut) break; srcs.add(m.src); latest = m.tm; } if (cut - latest > 1440) continue; rows.push([g.key, srcs.size * Math.pow(0.5, (cut - latest) / 720)]); }
  rows.sort((a, b) => b[1] - a[1]); rows.slice(0, 20).forEach(([k]) => top20.add(k)); }
console.log("Top 20 Zeitpunkte fertig", el());
const V = { W1: (s) => s.m120 >= 5, W2: (s) => s.m120 >= 10, W3: (s) => s.m30 >= 3 && s.m120 >= 8 };
const tage = (tEnd - 120 - tStart) / 1440; const out = { tageFenster: +tage.toFixed(2), geschichtenImFenster: stories.length, kandidaten: cand.length, nachZusammenfassen: merged.length, varianten: {} }; const sel = {};
for (const [name, f] of Object.entries(V)) { const arr = merged.filter(f); const cls = {}; for (const s of arr) cls[s.klasse] = (cls[s.klasse] ?? 0) + 1; const lesbar = arr.filter((s) => s.hasT && readable(s.text));
  const inD1 = arr.filter((s) => s.keys.some((k) => d1.has(k))).length, inTop = arr.filter((s) => s.keys.some((k) => top20.has(k))).length; const br = arr.filter((s) => s.gkgLand === "BR" || s.aktLand === "BR");
  const lc = {}; for (const s of lesbar) lc[s.klasse] = (lc[s.klasse] ?? 0) + 1; const src = {}; for (const s of arr) src[s.landQuelle] = (src[s.landQuelle] ?? 0) + 1;
  out.varianten[name] = { geschichten: arr.length, proTag: +(arr.length / tage).toFixed(1), nachKlasse: cls, landQuelle: src, ueberschneidungD1: inD1, ueberschneidungTop20Roh: inTop, lesbarerTitel: lesbar.length, lesbarProTag: +(lesbar.length / tage).toFixed(1), lesbarNachKlasse: lc, brasilien: br.length, brasilienBeispiele: br.slice(0, 8).map((s) => `${s.text.slice(0, 80)} | m30 ${s.m30} m120 ${s.m120} | ${s.hasT ? "Titel" : "Adresse"} | gkg ${s.gkgLand || "-"} akt ${s.aktLand || "-"}`) };
  sel[name] = arr; }
writeFileSync(join(DATA, "w1-summary.json"), JSON.stringify(out, null, 1));
// Stichprobe für Aufgabe 5: W1 mit lesbarem Titel, Seed 7, Reihenfolge nach erster Nennung/URL festgelegt
const pool = sel.W1.filter((s) => s.hasT && readable(s.text)).sort((a, b) => (a.keys[0] < b.keys[0] ? -1 : 1));
const pick = sample(pool, 20, 7).map((s, i) => ({ nr: i + 1, key: s.keys[0], titel: s.text, land: cname(s.land), landQuelle: s.landQuelle, m30: s.m30, m120: s.m120, url: s.url.slice(0, 120) }));
writeFileSync(join(DATA, "w1-sample20.json"), JSON.stringify({ seed: 7, poolGroesse: pool.length, pick }, null, 1));
// Gesamtpool für die Folgeauswertung (Runde 4, Teil 2)
writeFileSync(join(DATA, "w1-pool.json"), JSON.stringify(merged.map((s) => ({ key: s.keys[0], keys: s.keys, text: s.text, hasT: s.hasT, lesbar: s.hasT && readable(s.text), m30: s.m30, m60: s.m60, m120: s.m120, nDomains: s.nDomains, tlds: s.tlds, themes: s.row?.themes ? [...s.row.themes] : [], land: s.land, landQuelle: s.landQuelle, klasse: s.klasse, aktLand: s.aktLand, gkgLand: s.gkgLand, t1: s.t1, url: s.url.slice(0, 150) }))));
console.log(JSON.stringify(out, null, 1)); console.log("Pool W1 mit lesbarem Titel:", pool.length, "Laufzeit", el());

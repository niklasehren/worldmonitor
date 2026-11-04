// Gemeinsame Pipeline für build-data.mjs und die E1-Auswertung (nur Cache, kein Netzwerk):
// Geschichten bilden, zusammenfassen, Ernst-Filter, Länderzuordnung, Gewichte.
import { readFileSync } from "node:fs";

// ---- Hilfen (aus den Testskripten übernommen, damit die Pipeline ohne data/gdelt-test läuft) ----
export const toDate = (t) => new Date(Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8), +t.slice(8, 10), +t.slice(10, 12), +(t.slice(12, 14) || 0)));
export const fmt = (d) => d.toISOString().replace(/[-:T]/g, "").slice(0, 14);
export const min = (ts) => toDate(ts).getTime() / 60000;
export const decode = (s) => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
export const norm = (u) => u.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/#.*$/, "").replace(/\/+$/, "").toLowerCase();
export function cleanTitle(t) { if (!t) return ""; const parts = t.split(/ [-–|] /); return parts.length > 1 && parts[0].length >= 20 ? parts[0] : t; }
export function jaccard(a, b) { if (!a.size || !b.size) return 0; let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i); }
export function slugText(url) { try { const u = new URL(url); const segs = u.pathname.split("/").filter(Boolean); const last = decodeURIComponent(segs[segs.length - 1] ?? "").replace(/\.(html?|php|aspx?|ece|cms)$/i, ""); return last.replace(/[-_+]+/g, " ").replace(/\b[0-9a-f]{8,}\b/gi, " ").replace(/\d+/g, " "); } catch { return ""; } }

export const ROOT = new URL("../../", import.meta.url).pathname;
// Weltregionen je FIPS-Code (Annahme des Modells, siehe regions.json), Kurzformen für die Anzeige
const REGION_KURZ = { "Lateinamerika und Karibik": "Lateinamerika", "Naher Osten und Nordafrika": "Nahost und Nordafrika", "Afrika (inkl. Sudan)": "Afrika", "Asien (inkl. Kaukasus, Zentralasien)": "Asien" };
const regionOf = {};
for (const [r, codes] of Object.entries(JSON.parse(readFileSync(new URL("../gdelt-test/regions.json", import.meta.url), "utf8")))) if (!r.startsWith("_")) for (const c of codes) regionOf[c] = REGION_KURZ[r] ?? r;

// ---------- Länderzuordnung GDELT (FIPS) -> ISO 3166-1 alpha-2 ----------
// Zuerst über den englischen Ländernamen (Intl.DisplayNames des Systems), dann Handliste für abweichende Namen.
const gd = Object.fromEntries(readFileSync(ROOT + "config/gdelt-laender.txt", "utf8").split("\n").map((l) => l.trim().split("\t")).filter((x) => x.length === 2));
const dnEn = new Intl.DisplayNames(["en"], { type: "region" }), dnDe = new Intl.DisplayNames(["de"], { type: "region" });
const nz = (s) => s.toLowerCase().replace(/[^a-z]/g, "");
const AUSNAHME = new Set(["AC", "CP", "DG", "EA", "EU", "FX", "IC", "SU", "TA", "UK", "UN", "DD", "BU", "CS", "YD", "YU", "ZR", "NT", "TP", "AN", "SF", "VD"]); // von ISO nur reserviert oder veraltet, keine heutigen Länder
const byName = {};
for (let i = 65; i < 91; i++) for (let j = 65; j < 91; j++) { const c = String.fromCharCode(i, j); try { const n = dnEn.of(c); if (n && n !== c && !AUSNAHME.has(c) && !byName[nz(n)]) byName[nz(n)] = c; } catch { /* kein Land */ } }
// VM: GDELTs Liste nennt VM "Vietnam, Democratic Republic of", gemeint ist (FIPS 10-4) Vietnam (Annahme aus Fachwissen).
// GV: GDELTs Liste beschriftet GV (Guinea) doppelt als "Equatorial Guinea" (gemessen); nach FIPS 10-4 ist GV Guinea (Annahme aus Fachwissen)
const FIPS_MANUELL = { GV: "GN", VM: "VN", AC: "AG", BF: "BS", FQ: "UM", CF: "CG", IV: "CI", EZ: "CZ", LO: "SK", CG: "CD", TT: "TL", FK: "FK", FS: "TF", GZ: "PS", WE: "PS", HM: "HM", HK: "HK", HQ: "UM", JN: "SJ", SV: "SJ", DQ: "UM", JQ: "UM", KQ: "UM", MQ: "UM", LQ: "UM", WQ: "UM", MC: "MO", MK: "MK", BM: "MM", RE: "RE", SH: "SH", SC: "KN", ST: "LC", RN: "MF", SB: "PM", VC: "VC", TB: "BL", TP: "ST", SX: "GS", WZ: "SZ", TD: "TT", TU: "TR", TK: "TC", VQ: "VI", WF: "WF" };
const fipsToIso = {}, ohneIso = [];
for (const [f, n] of Object.entries(gd)) { const iso = FIPS_MANUELL[f] ?? byName[nz(n)]; if (iso) fipsToIso[f] = iso; else ohneIso.push(`${f} ${n}`); }
const isoName = (iso) => ({ de: dnDe.of(iso), en: dnEn.of(iso) });

// (D1: aus der 50m-Karte, die auch die Oberfläche benutzt; mit 110m fehlten kleine Länder wie St. Kitts und Nevis)
// Atlas-Nummer (world-atlas, ISO-Nummer) -> ISO2, über den Namen; Handliste für abweichende Atlas-Namen
const topo = JSON.parse(readFileSync(ROOT + "node_modules/world-atlas/countries-50m.json", "utf8"));
const ATLAS_MANUELL = { "W. Sahara": "EH", "United States of America": "US", "Dem. Rep. Congo": "CD", "Dominican Rep.": "DO", "Falkland Is.": "FK", "Fr. S. Antarctic Lands": "TF", "Central African Rep.": "CF", Congo: "CG", "Eq. Guinea": "GQ", Palestine: "PS", Myanmar: "MM", Turkey: "TR", "Solomon Is.": "SB", "Bosnia and Herz.": "BA", Macedonia: "MK", "Trinidad and Tobago": "TT", "S. Sudan": "SS", Vatican: "VA", "Marshall Is.": "MH", "N. Mariana Is.": "MP", "U.S. Virgin Is.": "VI", "S. Geo. and the Is.": "GS", "Br. Indian Ocean Ter.": "IO", "Saint Helena": "SH", "Pitcairn Is.": "PN", "Cayman Is.": "KY", "British Virgin Is.": "VG", "Turks and Caicos Is.": "TC", "São Tomé and Principe": "ST", "St. Vin. and Gren.": "VC", "Saint Lucia": "LC", "St. Kitts and Nevis": "KN", "Cook Is.": "CK", "St. Pierre and Miquelon": "PM", "Wallis and Futuna Is.": "WF", "Fr. Polynesia": "PF", Åland: "AX", "Faeroe Is.": "FO", Macao: "MO", "Hong Kong": "HK", "Cabo Verde": "CV", "Heard I. and McDonald Is.": "HM", "Antigua and Barb.": "AG" };
const atlasToIso = {}, atlasOhne = [];
for (const g of topo.objects.countries.geometries) { const nm = g.properties.name; const iso = ATLAS_MANUELL[nm] ?? byName[nz(nm)]; if (g.id && iso) atlasToIso[g.id] = iso; else atlasOhne.push(`${g.id ?? "ohne Nummer"} ${nm}`); }

export { fipsToIso, atlasToIso, atlasOhne, ohneIso, isoName, regionOf, byName, nz, AUSNAHME, dnEn, dnDe };

// ======================= Daten (Kontext) =======================
// ctx = { events: Map(id -> {id,url,country,root,nm,slot}), mentions: Map(id -> [{t,src,url?,type}]), TM: Map(normUrl -> {title,themes}) };
// Quellen: Cache (scripts/lib/pipeline-cache.mjs) oder rollender Zustand (scripts/pipeline/zustand.mjs).
export const iso8601 = (m) => new Date(m * 60000).toISOString();

// Geschichten: Ereignisse mit gleicher Quell-Adresse; Medien = verschiedene Domains der Web-Erwähnungen im Fenster (startMin, endMin]
export function buildStories(ctx, startMin, endMin_) {
  const map = new Map();
  for (const e of ctx.events.values()) {
    const k = norm(e.url);
    const ms = k && ctx.mentions.get(e.id);
    if (!ms) continue;
    let r = null;
    for (const m of ms) {
      if (m.type !== "1") continue;
      const t = min(m.t);
      if (t <= startMin || t > endMin_) continue;
      if (!r) r = map.get(k) ?? map.set(k, { key: k, url: e.url, srcs: new Set(), first: Infinity, latest: -1, fips: {}, ev: [], nm: -1 }).get(k);
      r.srcs.add(m.src);
      if (t < r.first) r.first = t;
      if (t > r.latest) r.latest = t;
    }
    if (r) {
      r.ev.push(e.id);
      if (e.country) r.fips[e.country] = (r.fips[e.country] ?? 0) + 1;
      if (e.nm > r.nm) { r.nm = e.nm; r.url = e.url; }
    }
  }
  return [...map.values()];
}

// ======================= Texte =======================
export const capital = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
// Text aus der Adresse nur, wenn er nach Wörtern aussieht (mind. 3 Wörter mit 3+ Buchstaben, mindestens 60 % der Teile)
export function adressText(url) {
  const t = slugText(url).trim().replace(/\s+/g, " ");
  const w = t.split(" ").filter((x) => /^[a-zäöüß]{3,}$/i.test(x) && x !== "article");
  return w.length >= 3 && w.length >= 0.6 * t.split(" ").length ? t : null;
}
// Anzeigetext einer Geschichte: gkg-Titel im Original, sonst Text der Adresse mit großem Anfangszeichen, sonst null (dann nie anzeigen)
export function textInfo(ctx, s) {
  const memo = (ctx.ti ??= new Map());
  const hit = memo.get(s.url);
  if (hit) return hit;
  const g = ctx.TM.get(norm(s.url));
  const title = g?.title ?? null;
  const a = title ? null : adressText(s.url);
  const out = { titel: title, adresse: a ? capital(a) : null, lesbar: title ?? (a ? capital(a) : null), slug: slugText(s.url).trim(), themes: g?.themes ?? null, host: hostOf(s.url) };
  memo.set(s.url, out);
  return out;
}
export function hostOf(url) { try { return new URL(url).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; } }

// ======================= Wörter, Ähnlichkeit, Zusammenfassen =======================
const STOPW = new Set(("the and for with from that this have has had are was were will would could should about after before over into out not but its their they them his her she him you your our who what when where why how all can may more most than then there these those been being also just says said say new news live today video photo photos watch read latest update updates report reports amid while during against between under again still back off up down one two first last year years day days week weekend via per https http html www com org net der die das und von mit des den dem ein eine für auf nach bei als wie zum zur ist sind war wird wurde sich auch nur noch über ein les des une que par pour sur dans el los las del por con una para").split(" "));
export function tok(text) {
  const out = new Set();
  for (const w of (text ?? "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9]+/)) if (w.length >= 3 && !STOPW.has(w) && !/^\d+$/.test(w)) out.add(w);
  return out;
}
export function matchText(ctx, s) { const t = textInfo(ctx, s); return t.titel ? cleanTitle(t.titel) : t.slug; }
export function idfMap(stories, textOf) {
  const df = new Map();
  for (const s of stories) for (const w of tok(textOf(s))) df.set(w, (df.get(w) ?? 0) + 1);
  const N = stories.length, idf = new Map();
  for (const [w, c] of df) idf.set(w, Math.log(N / c));
  return idf;
}
// Zusammenfassen. Verfahren "jaccard": Wortüberlappung (Jaccard) ab thr bei mind. 4 Wörtern (wie in den Tests Runde 2/3).
// Verfahren "idf": gewichtete Überlappung (Summe der IDF der gemeinsamen Wörter geteilt durch die kleinere Gesamtsumme) ab thr,
// mindestens 2 gemeinsame Wörter, davon mindestens eins selten (IDF >= rare).
export function clusterStories(items, textOf, { method = "idf", thr = 0.5, rare = 4.5, single = 0, idf = null } = {}) {
  const tk = items.map((s) => tok(textOf(s)));
  const sum = tk.map((t) => { let x = 0; for (const w of t) x += idf?.get(w) ?? 1; return x; });
  const par = items.map((_, i) => i);
  const find = (i) => (par[i] === i ? i : (par[i] = find(par[i])));
  const links = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    let ok = false, score = 0;
    if (method === "jaccard") { if (tk[i].size >= 4 && tk[j].size >= 4) { score = jaccard(tk[i], tk[j]); ok = score >= thr; } }
    else {
      let shared = 0, ssum = 0, maxIdf = 0;
      const [a, b] = tk[i].size <= tk[j].size ? [tk[i], tk[j]] : [tk[j], tk[i]];
      for (const w of a) if (b.has(w)) { shared++; const x = idf.get(w) ?? 1; ssum += x; if (x > maxIdf) maxIdf = x; }
      const den = Math.min(sum[i], sum[j]);
      if (shared >= 2 && maxIdf >= rare && den > 0) { score = ssum / den; ok = score >= thr; }
      else if (single && shared === 1 && maxIdf >= single && a.size <= 4) { score = 1; ok = true; } // kurzer Titel mit einem seltenen Namen (z. B. "Binance security incident")
    }
    if (ok) { if (find(i) !== find(j)) links.push([i, j, +score.toFixed(2)]); par[find(j)] = find(i); }
  }
  const groups = new Map();
  items.forEach((s, i) => { const k = find(i); (groups.get(k) ?? groups.set(k, []).get(k)).push(s); });
  return { groups: [...groups.values()], links };
}
// Eine Gruppe wird zu einer Geschichte: Medien = verschiedene Domains aller Mitglieder
export function mergeGroup(ctx, g) {
  const srcs = new Set(), fips = {}, ev = [];
  let first = Infinity, latest = -1;
  for (const s of g) { for (const d of s.srcs) srcs.add(d); for (const [c, n] of Object.entries(s.fips)) fips[c] = (fips[c] ?? 0) + n; ev.push(...s.ev); first = Math.min(first, s.first); latest = Math.max(latest, s.latest); }
  // Anzeige: größtes Mitglied mit gkg-Titel, sonst größtes mit lesbarem Adresstext
  const infos = g.map((s) => ({ s, t: textInfo(ctx, s) })).sort((a, b) => b.s.srcs.size - a.s.srcs.size);
  const best = infos.find((x) => x.t.titel) ?? infos.find((x) => x.t.adresse) ?? infos[0];
  return { members: g, srcs, fips, ev, first, latest, rep: best.s, info: best.t, lesbar: best.t.lesbar, medien: srcs.size, texte: infos.map((x) => x.t), infos };
}

// ======================= Ernst-Filter =======================
const cfgPath = ROOT + "config/ausschluss.json";
export function ladeAusschluss() {
  const c = JSON.parse(readFileSync(cfgPath, "utf8"));
  const re = (list) => (list?.length ? new RegExp("(^|[^\\p{L}\\p{N}])(" + list.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "[ -]")).join("|") + ")($|[^\\p{L}\\p{N}])", "iu") : null);
  const kat = {};
  for (const [k, v] of Object.entries(c.kategorien)) kat[k] = { woerter: re(v.woerter), rettung: re(v.rettung), themen: new Set(v.themen ?? []), pfade: new Set(v.pfade ?? []), domains: new Set(v.domains ?? []) };
  return kat;
}
// Welche Kategorie schließt diese Geschichte aus (oder null)? Je Mitglied: Titel/Adresstext, Pfadabschnitte, bekannte Domains, GKG-Themen.
// Die Geschichte wird ausgeschlossen, wenn das Hauptmitglied (größte Medienzahl) trifft oder Mitglieder mit mindestens der Hälfte der Medien treffen.
function mitgliedTrifft(k, { s, t }) {
  const text = t.titel ? cleanTitle(t.titel) : t.slug;
  const m = k.woerter?.exec(text);
  if (m) return "Wort:" + m[2].toLowerCase();
  if (t.themes) for (const th of k.themen) if (t.themes.has(th)) return "Thema:" + th;
  if (k.domains.has(hostOf(s.url))) return "Domain:" + hostOf(s.url);
  try { const seg = new URL(s.url).pathname.toLowerCase().split("/").filter(Boolean).slice(0, 3).find((x) => k.pfade.has(x)); if (seg) return "Pfad:" + seg; } catch { /* ungültige Adresse */ }
  return null;
}
export function ausschlussGrund(kat, ctx, cluster) {
  const total = cluster.infos.reduce((a, x) => a + x.s.srcs.size, 0) || 1;
  const hauptText = cluster.infos[0] && (cluster.infos[0].t.titel ?? cluster.infos[0].t.slug);
  const best = cluster.infos.find((x) => x.t.titel) ?? cluster.infos[0];
  for (const [name, k] of Object.entries(kat)) {
    const hits = cluster.infos.map((x) => [x, mitgliedTrifft(k, x)]).filter(([, d]) => d);
    if (!hits.length) continue;
    const w = hits.reduce((a, [x]) => a + x.s.srcs.size, 0);
    if (!(hits.some(([x]) => x === best) || w / total >= 0.5)) continue;
    const txt = (best.t.titel ?? best.t.slug) + " | " + hauptText;
    if (k.rettung?.test(txt)) continue;
    cluster.detail = hits[0][1];
    return name;
  }
  return null;
}

// ======================= Länderzuordnung =======================
const ALIAS = { US: ["USA", "U.S.", "US", "America", "United States of America"], GB: ["UK", "U.K.", "Britain", "Great Britain", "England", "Scotland", "Wales"], RU: ["Russia"], CZ: ["Czech Republic", "Czechia"], KP: ["North Korea", "Nordkorea"], KR: ["South Korea", "Südkorea"], CD: ["DR Congo", "D.R. Congo", "DRC", "Congo", "Kongo"], PS: ["Gaza", "Gaza Strip", "West Bank", "Palestine", "Palestinian Territories", "Westjordanland", "Gazastreifen"], CI: ["Ivory Coast", "Elfenbeinküste"], MM: ["Burma", "Myanmar"], TR: ["Türkiye", "Turkiye"], VA: ["Vatican"], NL: ["Netherlands", "Holland"], SZ: ["Eswatini", "Swaziland"], MK: ["North Macedonia"], TL: ["East Timor", "Timor-Leste"], IR: ["Iran"], SY: ["Syria"], AE: ["UAE", "Emirates"], TW: ["Taiwan"], VN: ["Vietnam"], LA: ["Laos"], SA: ["Saudi Arabia", "Saudi-Arabien"] };
// Namen, die im Text auch etwas anderes bedeuten: nur in Titeln mit Großschreibung, nie in Adresstexten
const MEHRDEUTIG = new Set(["Jordan", "Chad", "Turkey", "Guinea", "Mali", "Niger", "Cuba", "Oman", "Peru", "Togo", "Georgia", "Panama", "Lebanon", "Mexico", "Chile", "Kenya", "Israel", "Iran"]);
const ECHT_MEHRDEUTIG = new Set(["Jordan", "Chad", "Turkey", "Guinea", "Georgia"]);
let namenListe = null;
function namen() {
  if (namenListe) return namenListe;
  const valid = new Set([...Object.values(fipsToIso), ...Object.values(atlasToIso)]);
  const out = new Map();
  const add = (n, iso) => { if (n && n.length >= 2 && !out.has(n)) out.set(n, iso); };
  for (const iso of valid) { for (const dn of [dnEn, dnDe]) { try { let n = dn.of(iso); if (n && n !== iso) { add(n, iso); const stripped = n.replace(/\s*\(.*\)$/, ""); add(stripped, iso); } } catch { /* */ } } }
  for (const [iso, list] of Object.entries(ALIAS)) for (const n of list) add(n, iso);
  out.delete("Georgia");
  // Kurzformen, die Intl als lange Namen liefert
  for (const n of ["Vereinigte Staaten", "Vereinigtes Königreich", "United States", "United Kingdom"]) { /* kommen aus Intl */ }
  namenListe = [...out.entries()].map(([n, iso]) => ({ n, iso, re: new RegExp("(^|[^\\p{L}\\p{N}])" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "[ -]") + "($|[^\\p{L}\\p{N}])", n === "US" || n === "UK" || n.length <= 3 ? "u" : "iu"), amb: ECHT_MEHRDEUTIG.has(n) }));
  return namenListe;
}
// Länder im Text, nach Position im Titel; Titel zählt zuerst (mit Schreibweise), dann Adresstext (klein geschrieben, ohne mehrdeutige Namen)
export function laenderImText(text, { slug = false } = {}) {
  const found = [];
  const low = text.toLowerCase();
  for (const { n, iso, re, amb } of namen()) {
    if (!low.includes(n.toLowerCase())) continue;
    if (slug && amb) continue;
    if (!slug && amb && !new RegExp("(^|[^\\p{L}])" + n + "($|[^\\p{L}])", "u").test(text)) continue;
    const m = re.exec(text);
    if (m) found.push({ iso, pos: m.index + m[1].length, len: n.length });
  }
  found.sort((a, b) => a.pos - b.pos || b.len - a.len);
  const out = [];
  for (const f of found) if (!out.includes(f.iso)) out.push(f.iso);
  return out;
}
// Land einer Geschichte: Titel, sonst Adresse, sonst GDELT-Ereignisort; höchstens zwei Länder (nur wenn beide im Titel/Text stehen)
export function landVon(cluster) {
  const t = cluster.info;
  let im = t.titel ? laenderImText(cleanTitle(t.titel)) : [];
  let quelle = "Titel";
  if (!im.length) { im = laenderImText(t.slug.toLowerCase(), { slug: true }); quelle = "Adresse"; }
  if (!im.length && cluster.info.adresse) { /* Adresstext ist schon im Slug enthalten */ }
  if (im.length) return { laender: im.slice(0, 2), quelle };
  const top = Object.entries(cluster.fips).sort((a, b) => b[1] - a[1])[0]?.[0];
  const iso = top && fipsToIso[top];
  return { laender: iso ? [iso] : [], quelle: iso ? "Ereignisort" : "keine" };
}
export const landVorher = (s) => { const top = Object.entries(s.fips).sort((a, b) => b[1] - a[1])[0]?.[0]; return top ? fipsToIso[top] ?? null : null; };

// ======================= Gewichte =======================
const TLD_LAND = { uk: "GB" };
const GENERISCH = new Set(["com", "org", "net", "info", "biz", "news", "tv", "io", "co", "me", "fm", "ai", "cc", "ws", "xyz", "online", "site", "media", "app", "live", "world", "press", "today", "page", "blog", "digital", "network"]);
const US_TLD = new Set(["gov", "edu", "mil"]);
export function herkunft(domain) {
  const tld = domain.split(".").pop();
  if (US_TLD.has(tld)) return "US";
  if (GENERISCH.has(tld) || tld.length !== 2) return "(generisch)";
  return TLD_LAND[tld] ?? tld.toUpperCase();
}
export function urlSignatur(url) {
  try {
    const u = new URL(url);
    return u.pathname.split("/").filter(Boolean).slice(0, 5).map((s) => {
      s = s.toLowerCase().replace(/\.(html?|php|aspx?|ece|cms|shtml)$/, "");
      if (/^\d+$/.test(s)) return "#";
      s = s.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, "uuid").replace(/[0-9a-f]{16,}/g, "hex").replace(/\d+/g, "#");
      if (s.includes("-") && s.length > 24) return "slug";
      return s;
    }).join("/");
  } catch { return ""; }
}
// Gewichtskandidaten einer Geschichte (Cluster); Familien brauchen die Adressen der Erwähnungen (Signatur der Adressvorlage je Domain)
export function gewichte(ctx, cluster, startMin, endMin_) {
  const dom = [...cluster.srcs];
  const hk = new Set(dom.map(herkunft));
  const sig = new Map();
  for (const id of cluster.ev) for (const m of ctx.mentions.get(id) ?? []) {
    if (m.type !== "1") continue;
    const t = min(m.t); if (t <= startMin || t > endMin_) continue;
    if (!sig.has(m.src)) sig.set(m.src, urlSignatur(m.url));
  }
  const fam = new Set(); for (const d of dom) fam.add(sig.get(d) ?? "?" + d);
  const d = dom.length;
  return { domains: d, log: +Math.log(1 + d).toFixed(3), herkunftslaender: hk.size, familien: fam.size, kombi: +(Math.sqrt(d * hk.size)).toFixed(2) };
}

// ======================= Gesamte Pipeline für ein Zeitfenster =======================
// Ergebnis: global (Cluster nach Medien, mit Ausschluss- und Textkennzeichen) und je Land die Cluster aus dem Länder-Pool.
const einzel = (ctx, s) => ({ members: [s], infos: [{ s, t: textInfo(ctx, s) }], texte: [textInfo(ctx, s)], info: textInfo(ctx, s), fips: s.fips });
export function bauePipeline(ctx, startMin, endMin_, o = {}) {
  const POOL = o.pool ?? 1200, CPOOL = o.countryPool ?? 60, thr = o.thr ?? 0.5;
  const stories = buildStories(ctx, startMin, endMin_);
  const memoText = new Map();
  const textOf = (s) => memoText.get(s.key) ?? memoText.set(s.key, matchText(ctx, s)).get(s.key);
  const idf = idfMap(stories, textOf);
  const kat = ladeAusschluss();
  const opts = { method: o.method ?? "idf", thr, rare: 4.5, idf };
  const klar = (c) => { c.grund = ausschlussGrund(kat, ctx, c); c.landInfo = landVon(c); return c; };
  const topN = (arr, n) => [...arr].sort((a, b) => b.srcs.size - a.srcs.size).slice(0, n);
  const mk = (items) => { const { groups, links } = clusterStories(items, textOf, opts); return { clusters: groups.map((g) => mergeGroup(ctx, g)).sort((a, b) => b.medien - a.medien), links }; };
  const g = mk(topN(stories, POOL));
  g.clusters.forEach(klar);
  const out = { stories, idf, global: g.clusters, links: g.links, textOf };
  if (o.laender !== false) {
    const byIso = new Map();
    for (const s of stories) {
      const c1 = einzel(ctx, s);
      const lv = landVon(c1);
      const grund = ausschlussGrund(kat, ctx, c1);
      for (const iso of lv.laender) {
        const e = byIso.get(iso) ?? byIso.set(iso, { alle: 0, ernst: [], quelleTitel: 0 }).get(iso);
        e.alle++;
        if (!grund) e.ernst.push(s);
      }
    }
    out.laender = new Map();
    // Dieselbe Zählweise wie in der Weltliste: Gehört ein Länder-Cluster zu einer anzeigbaren weltweit zusammengefassten Geschichte,
    // wird diese (mit ihrer Medienzahl) angezeigt. Sonst würde dieselbe Meldung je Land mit weniger oder anderen Domains gezählt (927 gegen 345).
    const weltVon = new Map();
    for (const gc of g.clusters) if (!gc.grund && gc.lesbar) for (const s of gc.members) weltVon.set(s.key, gc);
    for (const [iso, e] of byIso) {
      const m = mk(topN(e.ernst, CPOOL));
      m.clusters.forEach(klar);
      const gesehen = new Set();
      m.clusters = m.clusters.map((c) => {
        const w = c.members.map((s) => weltVon.get(s.key)).filter(Boolean).sort((a, b) => b.medien - a.medien)[0];
        return w ?? c;
      }).filter((c) => !gesehen.has(c) && gesehen.add(c)).sort((a, b) => b.medien - a.medien);
      out.laender.set(iso, { alle: e.alle, ernst: e.ernst.length, clusters: m.clusters });
    }
  }
  return out;
}
// Anzeigbare Cluster: nicht ausgeschlossen und mit lesbarem Text (Reihenfolge nach Medien)
export const anzeigbar = (clusters) => clusters.filter((c) => !c.grund && c.lesbar);

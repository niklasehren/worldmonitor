// E1 Stufe 2: Messung mit eingefrorenen Regeln. Tag 3 (die letzten 24 h) wurde zum Einstellen nicht benutzt.
// Gibt aus: Stichproben zum Beurteilen (Filter an Tag 3, 40 Paare, 40 Länderzuordnungen), Top-10 vorher/nachher je Tag,
// Gewichtskandidaten je Tag, Beispiele Frankreich/Ägypten/Nordkorea (48 h).
import { loadContext, bauePipeline, anzeigbar, endMin, buildStories, matchText, idfMap, clusterStories, mergeGroup, textInfo, gewichte, landVorher, landVon, isoName, iso8601, fipsToIso } from "../lib/pipeline-cache.mjs";
import { sample } from "./load.mjs";
import { writeFileSync } from "node:fs";
const ctx = loadContext();
const DAYS = [["T1", endMin - 72 * 60, endMin - 48 * 60], ["T2", endMin - 48 * 60, endMin - 24 * 60], ["T3", endMin - 24 * 60, endMin]];
const out = { tage: {}, proben: {} };
const show = (c) => (c.lesbar ?? `(kein lesbarer Text: ${c.info.host})`).replace(/\s+/g, " ").slice(0, 105);
// "vorher" = Stand C1: Geschichten je Adresse, Zusammenfassen mit Jaccard 0,8 unter den 40 größten, keine Filter, Anzeige auch ohne Titel
function vorher(P, ctx) {
  const pool = [...P.stories].sort((a, b) => b.srcs.size - a.srcs.size).slice(0, 40);
  const { groups } = clusterStories(pool, P.textOf, { method: "jaccard", thr: 0.8 });
  return groups.map((g) => mergeGroup(ctx, g)).sort((a, b) => b.medien - a.medien);
}
for (const [name, a, b] of DAYS) {
  const P = bauePipeline(ctx, a, b, { laender: false, pool: 1000 });
  const v = vorher(P, ctx).slice(0, 10);
  const alle = P.global;
  const nachher = anzeigbar(alle).slice(0, 10);
  // Ausfall durch fehlenden Text: erste 10 nach Filter, wie viele hätten keinen Text
  const ersteZehn = alle.filter((c) => !c.grund).slice(0, 10);
  const ohneText = ersteZehn.filter((c) => !c.lesbar).length;
  const inTop10Vorher = v.filter((c) => !c.lesbar).length;
  out.tage[name] = { von: iso8601(a), bis: iso8601(b), geschichten: P.stories.length, pool: alle.length, ausgeschlossen: alle.filter((c) => c.grund).length, ohneTextNachFilter: alle.filter((c) => !c.grund && !c.lesbar).length, zusammengefuehrt: 1000 - alle.length,
    ausfallTop10: { ersteZehnNachFilterOhneText: ohneText, top10VorherOhneText: inTop10Vorher },
    vorher: v.map((c) => ({ m: c.medien, land: landVorher(c.rep), t: show(c) })),
    nachher: nachher.map((c) => ({ m: c.medien, n: c.members.length, land: c.landInfo.laender.join("+"), q: c.landInfo.quelle, t: show(c) })) };
  // Gewichtskandidaten
  const kand = anzeigbar(alle).slice(0, 120).map((c) => ({ c, w: gewichte(ctx, c, a, b) }));
  const defs = { roh: (x) => x.w.domains, log: (x) => x.w.log, herkunft: (x) => x.w.herkunftslaender * 1000 + x.w.domains, familien: (x) => x.w.familien * 1000 + x.w.domains, kombi: (x) => x.w.kombi };
  out.tage[name].kandidaten = {};
  for (const [k, f] of Object.entries(defs)) out.tage[name].kandidaten[k] = [...kand].sort((p, q) => f(q) - f(p)).slice(0, 10).map((x) => ({ id: x.c.rep.key.slice(0, 60), t: show(x.c), d: x.w.domains, h: x.w.herkunftslaender, f: x.w.familien }));
  if (name === "T3") {
    const aus = alle.filter((c) => c.grund && c.lesbar), keep = anzeigbar(alle).slice(0, 60);
    out.proben.filterT3 = { ausgeschlossen: sample(aus, 40, 21).map((c) => ({ g: c.grund + " " + (c.detail ?? ""), m: c.medien, t: show(c) })), behalten: sample(keep, 40, 22).map((c) => ({ m: c.medien, t: show(c) })), pool: alle.length, ausgeschlossenGesamt: alle.filter((c) => c.grund).length };
    // 40 Paare: zusammengeführte Paare (Verbindungen), Zufall
    const L = P.links.map(([i, j, sc]) => ({ sc })); // Indizes beziehen sich auf den Pool; Texte neu bilden
    const pool = [...P.stories].sort((x, y) => y.srcs.size - x.srcs.size).slice(0, 1000);
    const pairs = P.links.map(([i, j, sc]) => ({ sc, a: P.textOf(pool[i]).slice(0, 100), b: P.textOf(pool[j]).slice(0, 100), ma: pool[i].srcs.size, mb: pool[j].srcs.size }));
    out.proben.paareT3 = { gesamt: pairs.length, stichprobe: sample(pairs, 40, 23) };
    // 40 Länderzuordnungen: Geschichten aus den Top 100 (ohne Ausschluss, mit Text)
    const lz = sample(anzeigbar(alle).slice(0, 100), 40, 24).map((c) => ({ t: show(c), vorher: landVorher(c.rep) ?? "-", nachher: c.landInfo.laender.join("+") || "-", q: c.landInfo.quelle }));
    out.proben.landT3 = lz;
  }
  console.log("=====", name, JSON.stringify({ ...out.tage[name], vorher: undefined, nachher: undefined, kandidaten: undefined }));
}
// Länderbeispiele 48 h (vorher/nachher)
{
  const P = bauePipeline(ctx, endMin - 48 * 60, endMin, { pool: 1000 });
  const ex = {};
  for (const iso of ["FR", "EG", "KP", "DE", "IT", "US"]) {
    const L = P.laender.get(iso);
    ex[iso] = { geschichten: L?.alle ?? 0, ernst: L?.ernst ?? 0, nachher: anzeigbar(L?.clusters ?? []).slice(0, 5).map((c) => ({ m: c.medien, t: show(c), land: c.landInfo.laender.join("+") })) };
  }
  // vorher: alte Zuordnung (dominantes Ereignisland je Adresse), Top 5 je Land aus allen Geschichten
  for (const iso of ["FR", "EG", "KP", "DE", "IT", "US"]) {
    const st = P.stories.filter((s) => landVorher(s) === iso).sort((x, y) => y.srcs.size - x.srcs.size).slice(0, 40);
    const { groups } = clusterStories(st, P.textOf, { method: "jaccard", thr: 0.8 });
    ex[iso].vorher = groups.map((g) => mergeGroup(ctx, g)).sort((x, y) => y.medien - x.medien).slice(0, 5).map((c) => ({ m: c.medien, t: show(c) }));
  }
  out.laenderBeispiele = ex;
  out.top8_48h = anzeigbar(P.global).slice(0, 8).map((c) => ({ m: c.medien, land: c.landInfo.laender.join("+"), t: show(c) }));
  out.global48 = { pool: P.global.length, laenderMitGeschichten: P.laender.size };
}
writeFileSync(new URL("../../data/e1-stufe2.json", import.meta.url).pathname, JSON.stringify(out, null, 1));
console.log("fertig");

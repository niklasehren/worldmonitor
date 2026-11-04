// Gemeinsame Ausgabe für build-data.mjs (Cache) und scripts/pipeline/lauf.mjs (GitHub Actions):
// aus einem Kontext (ctx) und einem Fensterende die Dateien für die Oberfläche erzeugen.
//   <out>/world.json, <out>/countries/index.json, <out>/countries/<ISO2>.json  (+ <out>/world.sample.json im Cache-Modus)
// Rang = Zahl verschiedener Domains (rohe Medienzahl). Top 8: höchstens maxProLandTop8 je Land, die nächste rückt nach.
import { bauePipeline, anzeigbar, gewichte, iso8601, fipsToIso, atlasToIso, atlasOhne, isoName, regionOf, min, ROOT } from "./pipeline.mjs";
import { writeFileSync, mkdirSync, readdirSync, unlinkSync, readFileSync } from "node:fs";

export const ANZEIGE = JSON.parse(readFileSync(ROOT + "config/anzeige.json", "utf8"));
const MAX_QUELLEN = 5;

const story = (c) => ({
  titel: c.info.titel,
  titelQuelle: c.info.titel ? "gkg" : "adresse",
  adresstext: c.info.titel ? null : c.info.adresse,
  medien: c.medien,
  quellen: [...c.srcs].slice(0, MAX_QUELLEN),
  erste: iso8601(c.first),
  zuletzt: iso8601(c.latest),
  link: c.rep.url,
  zusammengefasst: c.members.length,
});

const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// Top 8 mit Obergrenze je Land (erstes Land der Geschichte), Geschichten ohne Land unbegrenzt
export function top8MitGrenze(cluster, maxProLand) {
  const out = [], zaehler = {}, uebersprungen = [];
  for (const c of cluster) {
    const iso = c.landInfo.laender[0];
    if (iso && (zaehler[iso] ?? 0) >= maxProLand) { uebersprungen.push(c); continue; }
    if (iso) zaehler[iso] = (zaehler[iso] ?? 0) + 1;
    out.push(c);
    if (out.length === 8) break;
  }
  return { top: out, uebersprungen };
}

// o: { endMin, cacheStartMin, out (Ordner), dataDir (optional, für data/world.json), sample (bool), verlauf (Array früherer Schnappschüsse), lauf (Text) }
export function schreibeAusgabe(ctx, o) {
  const FENSTER_H = ANZEIGE.fensterStunden, WENIG = ANZEIGE.wenigGrenze, MIN_EVENTS = ANZEIGE.konflikt.mindestEreignisse;
  const endMin = o.endMin, startMin = endMin - FENSTER_H * 60;
  const cacheStunden = (endMin - o.cacheStartMin) / 60;
  const t0 = Date.now();
  const P = bauePipeline(ctx, startMin, endMin, { pool: 1200, countryPool: 60 });
  const tPipeline = Date.now() - t0;

  // Konfliktanzeiger: Anteil Ereignisse mit Wurzelcode 18/19/20 je Land
  const KONFLIKT = new Set(["18", "19", "20"]);
  const ev = new Map();
  for (const e of ctx.events.values()) {
    const sm = min(e.slot); if (sm <= startMin || sm > endMin || !e.country) continue;
    const iso = fipsToIso[e.country]; if (!iso) continue;
    const x = ev.get(iso) ?? ev.set(iso, { n: 0, k: 0 }).get(iso);
    x.n++; if (KONFLIKT.has(String(+e.root))) x.k++;
  }
  const med = median([...ev.values()].filter((x) => x.n >= MIN_EVENTS).map((x) => x.k / x.n));
  const konflikt = (iso) => { const x = ev.get(iso); return x && x.n >= MIN_EVENTS && med > 0 ? { anteil: +(x.k / x.n).toFixed(4), verhaeltnisZumMedian: +((x.k / x.n) / med).toFixed(2), ereignisse: x.n } : null; };

  // Vorperiode: Schnappschuss des Laufs von vor 48 Stunden (Toleranz 2 Stunden), sonst null
  const ziel = endMin - FENSTER_H * 60;
  const alt = (o.verlauf ?? []).map((s) => ({ s, d: Math.abs(s.endMin - ziel) })).filter((x) => x.d <= 120).sort((a, b) => a.d - b.d)[0]?.s ?? null;
  const vorfenster = (iso, jetzt) => {
    const a = alt?.laender?.[iso];
    if (!a) return null;
    return { stand: iso8601(alt.endMin), geschichten: a.g, veraenderung: a.g >= 10 ? +((jetzt - a.g) / a.g).toFixed(3) : null, konfliktAnteil: a.k ?? null };
  };

  const dir = o.out + "/countries/";
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(dir)) if (f.endsWith(".json")) unlinkSync(dir + f);
  const fenster = { von: iso8601(startMin), bis: iso8601(endMin), stunden: FENSTER_H };
  const index = {}, liste = [], sizes = [], schnapp = {};
  for (const [iso, L] of [...P.laender.entries()].sort()) {
    const nm = isoName(iso);
    const top = anzeigbar(L.clusters).slice(0, 10).map(story);
    const k = konflikt(iso);
    const file = { iso, name: nm.de, nameEn: nm.en, fenster, geschichtenImFenster: L.ernst, wenig: L.ernst < WENIG, vorfenster: vorfenster(iso, L.ernst), konflikt: k, top };
    const json = JSON.stringify(file);
    writeFileSync(dir + iso + ".json", json); sizes.push([iso, Buffer.byteLength(json)]);
    index[iso] = { name: nm.de };
    liste.push({ iso, name: nm.de, geschichten: L.ernst, wenig: L.ernst < WENIG, topMedien: top[0]?.medien ?? 0 });
    schnapp[iso] = { g: L.ernst, k: k?.anteil ?? null };
  }
  writeFileSync(dir + "index.json", JSON.stringify({ stand: iso8601(endMin), laender: index, atlas: atlasToIso }));

  const { top, uebersprungen } = top8MitGrenze(anzeigbar(P.global), ANZEIGE.maxProLandTop8);
  const top8 = top.map((c) => {
    const laender = c.landInfo.laender, iso = laender[0];
    const prim = iso && Object.keys(fipsToIso).find((f) => fipsToIso[f] === iso && regionOf[f]);
    return { ...story(c), laender, laenderQuelle: c.landInfo.quelle, ort: iso ? { iso, name: isoName(iso).de, region: prim ? regionOf[prim] : null } : null, gewicht: gewichte(ctx, c, startMin, endMin) };
  });
  const LAGEN = [
    { id: "iran", name: "Iran · USA · Israel", region: "Nahost", laender: ["IR", "US", "IL"] },
    { id: "ru-ua", name: "Russland · Ukraine", region: "Osteuropa", laender: ["RU", "UA"] },
    { id: "cn-tw", name: "China · Taiwan", region: "Ostasien", laender: ["CN", "TW"] },
    { id: "kp-kr", name: "Nord · Südkorea", region: "Koreanische Halbinsel", laender: ["KP", "KR"] },
  ];
  const world = { stand: iso8601(endMin), erzeugt: new Date().toISOString(), lauf: o.lauf ?? null, fenster, cacheStunden, vorfenster: alt ? "vorhanden" : null, laender: liste.sort((a, b) => b.geschichten - a.geschichten), top8, lagen: LAGEN, hinweis: "Medienzahl = verschiedene Domains der zusammengefassten Geschichten; Top 8 mit höchstens " + ANZEIGE.maxProLandTop8 + " Meldungen je Land; Ernst-Filter und Länderzuordnung siehe docs/bericht-e1.md." };
  const wj = JSON.stringify({ ...world, beispiel: false });
  writeFileSync(o.out + "/world.json", wj);
  if (o.sample) writeFileSync(o.out + "/world.sample.json", JSON.stringify({ ...world, beispiel: true }));
  if (o.dataDir) writeFileSync(o.dataDir + "/world.json", JSON.stringify(world));

  const ohneText = P.global.filter((c) => !c.grund && !c.lesbar).length;
  return {
    snapshot: { endMin, laender: schnapp },
    bericht: {
      stand: world.stand, laufzeitPipelineMs: tPipeline, geschichtenImFenster: P.stories.length, pool: P.global.length, ausgeschlossen: P.global.filter((c) => c.grund).length, ohneLesbarenTextNachFilter: ohneText,
      top8UebersprungenWegenLandgrenze: uebersprungen.slice(0, 5).map((c) => ({ land: c.landInfo.laender[0], medien: c.medien, text: (c.lesbar ?? "").slice(0, 70) })),
      laenderMitDatei: liste.length, laenderWenig: liste.filter((l) => l.wenig).length,
      dateigroessen: { anzahl: sizes.length, summe: sizes.reduce((a, b) => a + b[1], 0), max: [...sizes].sort((a, b) => b[1] - a[1])[0], world: Buffer.byteLength(wj), index: Buffer.byteLength(JSON.stringify({ stand: 1, laender: index, atlas: atlasToIso })) },
      vorfensterVorhanden: !!alt, atlasOhneIso: atlasOhne,
    },
    top8, P,
  };
}

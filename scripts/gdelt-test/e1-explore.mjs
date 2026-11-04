import { loadContext, buildStories, endMin, cacheStartMin, matchText, idfMap, clusterStories, mergeGroup, ladeAusschluss, ausschlussGrund, landVon, landVorher, textInfo, isoName } from "../lib/pipeline-cache.mjs";
const ctx = loadContext();
const t0 = Date.now();
const stories = buildStories(ctx, endMin - 48 * 60, endMin);
console.log("Geschichten:", stories.length, "in", Date.now() - t0, "ms");
const idf = idfMap(stories, (s) => matchText(ctx, s));
const pool = [...stories].sort((a, b) => b.srcs.size - a.srcs.size).slice(0, +(process.env.POOL ?? 1000));
const method = process.env.METHOD ?? "idf", thr = +(process.env.THR ?? 0.5);
const { groups, links } = clusterStories(pool, (s) => matchText(ctx, s), { method, thr, idf, rare: +(process.env.RARE ?? 4.5), single: +(process.env.SINGLE ?? 0) });
const kat = ladeAusschluss();
const cl = groups.map((g) => mergeGroup(ctx, g)).sort((a, b) => b.medien - a.medien);
console.log("Pool", pool.length, "Gruppen", cl.length, "Zusammenführungen", pool.length - cl.length);
let n = 0;
for (const c of cl) {
  const grund = ausschlussGrund(kat, ctx, c);
  const land = landVon(c);
  if (n++ >= +(process.env.TOP ?? 60)) break;
  console.log(String(c.medien).padStart(4), `x${c.members.length}`, grund ? `[AUS ${grund}]` : "", `[${land.laender.join("+") || "-"}|${land.quelle}|vorher ${landVorher(c.rep) ?? "-"}]`, (c.lesbar ?? "(kein Text) " + c.info.host).slice(0, 110));
}

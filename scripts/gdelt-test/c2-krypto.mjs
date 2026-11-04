// C2: Krypto-Regel an Beispielen prüfen (Hacks/Diebstähle bleiben, reine Kursmeldungen raus). Nur Cache.
import { loadContext, buildStories, endMin, textInfo, ladeAusschluss, ausschlussGrund } from "../lib/pipeline-cache.mjs";
import { sample } from "./load.mjs";
const ctx = loadContext();
const st = buildStories(ctx, endMin - 48 * 60, endMin);
const kat = ladeAusschluss();
const KR = /\b(bitcoin|btc|ethereum|ether|crypto\w*|binance|coinbase|tether|stablecoin\w*|nfts?|altcoins?|dogecoin|solana|xrp|memecoin\w*|token)\b/i;
const rows = [];
for (const s of st) {
  const t = textInfo(ctx, s); const text = t.lesbar; if (!text || !KR.test(t.titel ?? t.slug)) continue;
  const c = { members: [s], infos: [{ s, t }], texte: [t], info: t, fips: s.fips };
  rows.push({ g: ausschlussGrund(kat, ctx, c), m: s.srcs.size, t: text.slice(0, 110) });
}
rows.sort((a, b) => b.m - a.m);
const aus = rows.filter((r) => r.g === "krypto_kurs"), bleibt = rows.filter((r) => r.g === null), andere = rows.filter((r) => r.g && r.g !== "krypto_kurs");
console.log(JSON.stringify({ geschichtenMitKryptoWort: rows.length, ausKrypto: aus.length, behalten: bleibt.length, ausAndererKategorie: andere.length }));
const pick = (a, n, seed) => { const top = a.slice(0, 15); const rest = a.slice(15); return [...top, ...(sample ? sample(rest, n - top.length, seed) : rest.slice(0, n - top.length))]; };
console.log("-- AUSGESCHLOSSEN (krypto_kurs), 15 größte + Zufall bis 30"); pick(aus, 30, 31).forEach((r, i) => console.log(i, r.m, r.t));
console.log("-- BEHALTEN, 15 größte + Zufall bis 30"); pick(bleibt, 30, 32).forEach((r, i) => console.log(i, r.m, r.t));

// DOC-API-Wiederholung aus einem ANDEREN Netz. NICHT automatisch gestartet. Vorsichtig: höchstens 12 Anfragen, 15 s Pause,
// Abbruch bei der ersten Ablehnung (HTTP 429) oder bei einer Antwort, die kein JSON ist.
// Start (im Projektordner):  node scripts/gdelt-test/doc-retest.mjs
// Ergebnis: Ausgabe im Terminal und Datei data/gdelt-test/doc-retest-result.json (liegt in data/, wird nicht committet).
import { writeFileSync, mkdirSync } from "node:fs";
import { TOPICS, docUrl } from "./queries.mjs";

const PAUSE_MS = 15_000, MAX_REQUESTS = 12;
const OUT = new URL("../../data/gdelt-test/doc-retest-result.json", import.meta.url).pathname;
mkdirSync(new URL("../../data/gdelt-test/", import.meta.url).pathname, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const plan = [
  { name: "Test: einfache Abfrage", url: docUrl("ukraine", "english", { mode: "ArtList", maxrecords: "5", timespan: "6h", sort: "DateDesc" }) },
  ...TOPICS.map((t) => ({ name: `Thema ${t.name} (Kürzel, englisch)`, url: docUrl(t.A, "english", { mode: "ArtList", maxrecords: "25", timespan: "24h", sort: "DateDesc" }) })),
  ...["konflikte", "diplomatie", "maerkte"].map((k) => { const t = TOPICS.find((x) => x.key === k); return { name: `Thema ${t.name} (Suchbegriffe, deutsch)`, url: docUrl(t.B.german, "german", { mode: "ArtList", maxrecords: "25", timespan: "24h", sort: "DateDesc" }) }; }),
].slice(0, MAX_REQUESTS);

const results = []; let stopped = null;
for (let i = 0; i < plan.length; i++) {
  const p = plan[i];
  if (i > 0) await sleep(PAUSE_MS);
  try {
    const res = await fetch(p.url, { headers: { "User-Agent": "worldmonitor-privatetest/0.1" }, signal: AbortSignal.timeout(60_000) });
    const txt = await res.text();
    let n = null; try { n = (JSON.parse(txt).articles ?? []).length; } catch { /* keine JSON-Antwort */ }
    results.push({ name: p.name, status: res.status, treffer: n, anfang: n === null ? txt.slice(0, 120).replace(/\s+/g, " ") : undefined });
    console.log(`${i + 1}/${plan.length} ${p.name}: HTTP ${res.status}, Treffer: ${n ?? "keine JSON-Antwort"}`);
    if (res.status === 429 || n === null) { stopped = `Abbruch nach Anfrage ${i + 1}: ${res.status === 429 ? "HTTP 429 (zu viele Anfragen / gesperrt)" : "Antwort ist kein JSON"}`; break; }
  } catch (e) { results.push({ name: p.name, fehler: String(e.cause?.code ?? e.message) }); stopped = `Abbruch nach Anfrage ${i + 1}: Netzwerkfehler ${e.cause?.code ?? e.message}`; console.log(stopped); break; }
}
writeFileSync(OUT, JSON.stringify({ zeit: new Date().toISOString(), abbruch: stopped, ergebnisse: results }, null, 2));
console.log(stopped ?? "Alle Anfragen beantwortet.");
console.log("Ergebnis gespeichert in data/gdelt-test/doc-retest-result.json");

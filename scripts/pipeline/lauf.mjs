// Pipeline-Lauf: neue 15-Minuten-Dateien holen, Zustand fortschreiben, Ausgabe erzeugen.
//   node scripts/pipeline/lauf.mjs --modus netz   [--zustand ordner] [--out ordner]   (GitHub Actions: lädt von data.gdeltproject.org)
//   node scripts/pipeline/lauf.mjs --modus cache  [--zustand ordner] [--out ordner]   (Trockenlauf: liest den lokalen Test-Cache, kein Netzwerk)
// Regeln für das Netz: nur https://data.gdeltproject.org/gdeltv2/, nacheinander, mindestens 5 s Pause, keine Rohdatei bleibt liegen.
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { ROOT, fmt } from "../lib/pipeline.mjs";
import { schreibeAusgabe } from "../lib/ausgabe.mjs";
import { fasseSlot, schreibeSlot, vorhandeneSlots, raeumeAuf, ladeKontext, slotMin, tsVon, leseSlot, SLOT_MIN } from "./zustand.mjs";

const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const MODUS = arg("modus", "netz");
const ZUSTAND = arg("zustand", ROOT + (MODUS === "cache" ? "data/pipeline-state-trocken" : "zustand"));
const OUT = arg("out", ROOT + (MODUS === "cache" ? "data/trockenlauf/out" : "ausgabe"));
const FENSTER_H = 48, VORLAUF_H = 24, PAUSE_MS = Math.max(5000, +(process.env.GDELT_PAUSE_MS ?? 5000));
const BASIS = "https://data.gdeltproject.org/gdeltv2/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const zeit = {};
const stop = (k, t0) => { zeit[k] = (zeit[k] ?? 0) + (Date.now() - t0); };

// ---- Netzwerk ----
let letzteAnfrage = 0;
async function ladeZip(url) {
  for (let versuch = 1; versuch <= 3; versuch++) {
    const warte = letzteAnfrage + PAUSE_MS - Date.now(); if (warte > 0) await sleep(warte);
    letzteAnfrage = Date.now();
    try {
      const r = await fetch(url, { headers: { "User-Agent": "worldmonitor-pipeline/0.1 (open source, github.com/niklasehren/worldmonitor)" } });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("HTTP " + r.status);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) {
      console.log(`  Fehler ${url} (Versuch ${versuch}/3): ${e.message}`);
      await sleep(PAUSE_MS * versuch);
    }
  }
  return null;
}
function entzippe(buf) {
  const d = mkdtempSync(tmpdir() + "/wm-"); const f = d + "/x.zip";
  try { writeFileSync(f, buf); return execFileSync("unzip", ["-p", f], { maxBuffer: 1 << 30 }).toString("utf8"); } finally { rmSync(d, { recursive: true, force: true }); }
}
async function holeSlotNetz(ts, nurEreignisse) {
  const art = async (suffix) => { const b = await ladeZip(`${BASIS}${ts}.${suffix}.zip`); return b ? entzippe(b) : null; };
  const exp = await art("export.CSV");
  if (nurEreignisse) return { exp, men: null, gkg: null };
  return { exp, men: await art("mentions.CSV"), gkg: await art("gkg.csv") };
}
async function letzterZeitpunktNetz() {
  const r = await fetch(BASIS + "lastupdate.txt", { headers: { "User-Agent": "worldmonitor-pipeline/0.1" } });
  const t = await r.text(); const m = t.match(/gdeltv2\/(\d{14})\.export\.CSV\.zip/);
  if (!m) throw new Error("lastupdate.txt ohne Zeitpunkt: " + t.slice(0, 120));
  letzteAnfrage = Date.now();
  return m[1];
}

// ---- Cache (Trockenlauf) ----
let cacheLib = null;
async function holeSlotCache(ts) {
  cacheLib ??= { load: await import("../gdelt-test/load.mjs") };
  const { readZip, gdeltUrl } = cacheLib.load;
  return { exp: readZip(gdeltUrl(ts, "export")), men: readZip(gdeltUrl(ts, "mentions")), gkg: readZip(gdeltUrl(ts, "gkg", "csv")) };
}

// ---- Hauptablauf ----
const t00 = Date.now();
mkdirSync(ZUSTAND, { recursive: true });
let ende; // Zeitpunkt des letzten Slots
let alle; // Liste der zu verarbeitenden Zeitpunkte (mit Kennzeichen nurEreignisse)
const vorhanden = vorhandeneSlots(ZUSTAND);
if (MODUS === "cache") {
  cacheLib ??= { load: await import("../gdelt-test/load.mjs") };
  const stamps = cacheLib.load.stamps;
  ende = stamps.at(-1);
  alle = stamps.filter((ts) => !vorhanden.includes(ts)).map((ts) => ({ ts, nurEreignisse: false }));
} else {
  ende = await letzterZeitpunktNetz();
  const endM = slotMin(ende);
  const letzter = vorhanden.at(-1);
  const startM = letzter ? slotMin(letzter) + SLOT_MIN : endM - (FENSTER_H * 60 - SLOT_MIN);
  alle = [];
  if (!letzter) for (let m = startM - VORLAUF_H * 60; m < startM; m += SLOT_MIN) alle.push({ ts: tsVon(m), nurEreignisse: true });
  for (let m = startM; m <= endM; m += SLOT_MIN) alle.push({ ts: tsVon(m), nurEreignisse: false });
}
console.log(`Modus ${MODUS}: ${vorhanden.length} Zeitpunkte im Zustand, ${alle.length} neue, letzter ${ende}`);

// bekannte Ereignisse und Adressen aus dem Zustand
const kennt = new Set(), kenntUrl = new Set();
{ const t0 = Date.now(); for (const ts of vorhanden) { const s = leseSlot(ZUSTAND, ts); for (const e of s.e) { kennt.add(String(e[0])); kenntUrl.add(e[1].toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/#.*$/, "").replace(/\/+$/, "")); } } stop("zustandLesen", t0); }
const bytes = { slots: 0, zip: 0 };
const fehlend = [];
for (const { ts, nurEreignisse } of alle) {
  let t0 = Date.now();
  const x = MODUS === "cache" ? await holeSlotCache(ts) : await holeSlotNetz(ts, nurEreignisse);
  stop("laden", t0);
  if (!x.exp && !x.men) { fehlend.push(ts); continue; }
  t0 = Date.now();
  const s = fasseSlot(ts, x.exp, x.men, x.gkg, kennt, kenntUrl);
  bytes.slots += schreibeSlot(ZUSTAND, s);
  stop("zusammenfassen", t0);
}
// Zeitpunkte, die nicht geholt werden konnten, merken wir uns nicht als Datei; die Ausgabe nennt sie (luecken)
let t1 = Date.now();
const geloescht = raeumeAuf(ZUSTAND, slotMin(ende));
const slotsJetzt = vorhandeneSlots(ZUSTAND);
const ctx = ladeKontext(ZUSTAND, slotMin(ende), FENSTER_H);
stop("kontext", t1);
const startZustandMin = slotMin(slotsJetzt[0]);
// Verlauf (Schnappschüsse je Lauf für die Vorperiode), 8 Tage
const verlaufPfad = ZUSTAND + "/verlauf.json";
let verlauf = existsSync(verlaufPfad) ? JSON.parse(readFileSync(verlaufPfad, "utf8")) : [];
verlauf = verlauf.filter((s) => s.endMin > slotMin(ende) - 8 * 24 * 60 && s.endMin < slotMin(ende));
mkdirSync(OUT, { recursive: true });
t1 = Date.now();
const r = schreibeAusgabe(ctx, { endMin: slotMin(ende), cacheStartMin: startZustandMin, out: OUT, sample: false, verlauf, lauf: process.env.GITHUB_RUN_ID ?? MODUS });
stop("ausgabe", t1);
verlauf.push(r.snapshot);
writeFileSync(verlaufPfad, JSON.stringify(verlauf));
const fensterVon = slotMin(ende) - FENSTER_H * 60;
const luecken = []; for (let m = fensterVon + SLOT_MIN; m <= slotMin(ende); m += SLOT_MIN) if (!slotsJetzt.includes(tsVon(m))) luecken.push(tsVon(m));
const status = { stand: r.bericht.stand, erzeugt: new Date().toISOString(), neueZeitpunkte: alle.length, luecken, zeitpunkteImZustand: slotsJetzt.length, verlaufEintraege: verlauf.length };
writeFileSync(OUT + "/status.json", JSON.stringify(status));
zeit.gesamt = Date.now() - t00;
console.log(JSON.stringify({ zeitMs: zeit, zustandBytesNeu: bytes.slots, geloeschteZeitpunkte: geloescht, status, bericht: r.bericht }, null, 1));
console.log("TOP 8:"); r.top8.forEach((t, i) => console.log(i + 1, t.medien, t.laender.join("+") || "-", t.titel ?? t.adresstext));

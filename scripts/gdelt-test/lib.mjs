// Gemeinsame Helfer für den GDELT-Test (nur lesende Abfragen öffentlicher GDELT-Adressen).
// Regeln: mind. 5 s Pause zwischen Anfragen, keine Schlüssel, Antworten werden nur gespeichert
// und als Text gelesen, nie ausgeführt. Bereits geladene Antworten kommen aus dem Cache (Fortsetzen nach Abbruch).
import { createHash } from "node:crypto";
import { mkdirSync, existsSync, readFileSync, writeFileSync, appendFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const ROOT = new URL("../../", import.meta.url).pathname;
export const DATA = join(ROOT, "data/gdelt-test");
export const RAW = join(DATA, "raw");
mkdirSync(RAW, { recursive: true });

const PAUSE_MS = Number(process.env.WM_PAUSE_MS ?? 5000); // nie unter 5000 einstellen
const MAX_REQUESTS = Number(process.env.WM_MAX_REQUESTS ?? 800); // harte Obergrenze für echte Netzwerk-Anfragen insgesamt
const MAX_BYTES = Number(process.env.WM_MAX_BYTES ?? 1_000_000_000); // ca. 1 GB Gesamtmenge (Standard)
const STATE = join(DATA, "state.json");
const LOG = join(DATA, "messages.log");
const UA = "worldmonitor-privatetest/0.1";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastEnd = 0;

export function log(msg) {
  const line = `${new Date().toISOString()} ${msg}`;
  console.log(line);
  appendFileSync(LOG, line + "\n");
}
function readState() {
  return existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : { requests: 0, httpFallbacks: 0 };
}
function writeState(s) { writeFileSync(STATE, JSON.stringify(s)); }

export function totalBytes() {
  let sum = 0;
  for (const f of readdirSync(RAW)) if (f.endsWith(".json")) sum += JSON.parse(readFileSync(join(RAW, f), "utf8")).bytes ?? 0;
  return sum;
}
const key = (url) => createHash("sha1").update(url.replace(/^https?:/, "")).digest("hex");
export const cachePath = (url) => join(RAW, key(url) + ".bin");
export const metaPath = (url) => join(RAW, key(url) + ".json");
export function cached(url) { return existsSync(cachePath(url)) && existsSync(metaPath(url)); }
export const readText = (url) => readFileSync(cachePath(url), "utf8");
export const readMeta = (url) => JSON.parse(readFileSync(metaPath(url), "utf8"));

async function once(url, attempt = 0, base = PAUSE_MS) {
  const st = readState();
  if (st.requests >= MAX_REQUESTS) throw new Error(`Obergrenze von ${MAX_REQUESTS} Anfragen erreicht`);
  if (totalBytes() >= MAX_BYTES) throw new Error("Obergrenze von ca. 1 GB erreicht");
  const wait = Math.max(PAUSE_MS, base * 2 ** attempt) - (Date.now() - lastEnd);
  if (wait > 0) await sleep(wait);
  st.requests += 1; writeState(st);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(120000) });
    const buf = Buffer.from(await res.arrayBuffer());
    lastEnd = Date.now();
    return { ok: res.ok, status: res.status, buf };
  } catch (e) {
    lastEnd = Date.now();
    return { ok: false, status: 0, error: String(e.cause?.code ?? e.message), buf: Buffer.alloc(0) };
  }
}

// Holt eine Adresse (Cache zuerst). Bei data.gdeltproject.org: erst https, http nur bei Fehlschlag (mit Meldung).
export async function get(url) {
  if (cached(url)) return { url, fromCache: true, ...readMeta(url) };
  const candidates = url.startsWith("http://data.gdeltproject.org") || url.startsWith("https://data.gdeltproject.org")
    ? ["https://" + url.replace(/^https?:\/\//, ""), "http://" + url.replace(/^https?:\/\//, "")]
    : [url];
  let last;
  for (let i = 0; i < candidates.length; i++) {
    const u = candidates[i];
    for (let attempt = 0; attempt < 4; attempt++) {
      last = await once(u, attempt, last?.status === 429 ? 60000 : PAUSE_MS);
      if (last.ok) break;
      if (last.status === 404 || last.status === 403) break; // nicht wiederholen
      log(`Fehlschlag ${u} status=${last.status} ${last.error ?? ""} (Versuch ${attempt + 1}/4)`);
    }
    if (last.ok) {
      if (u.startsWith("http://")) {
        const st = readState(); st.httpFallbacks += 1; writeState(st);
        log(`HTTP-FALLBACK: https fehlgeschlagen, ${u} per http geladen`);
      }
      writeFileSync(cachePath(url), last.buf);
      const meta = { url: u, status: last.status, bytes: last.buf.length, fetchedAt: new Date().toISOString() };
      writeFileSync(metaPath(url), JSON.stringify(meta));
      return { url, fromCache: false, ...meta };
    }
    if (i === 0 && candidates.length > 1) log(`https fehlgeschlagen für ${u} (status=${last.status} ${last.error ?? ""}) → versuche http`);
  }
  return { url, fromCache: false, ok: false, status: last.status, error: last.error ?? `HTTP ${last.status}`, bytes: 0 };
}

export const stats = () => ({ ...readState(), bytes: totalBytes() });

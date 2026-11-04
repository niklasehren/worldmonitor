// Erzeugt die Globus-Textur: NASA Blue Marble (Tag, April 2004) und NASA Black Marble 2016 (Nachtlichter) zu EINER Textur.
// Quellen (Rohdateien in data/blue-marble/, nicht in Git):
//   world.200404.3x5400x2700.jpg   Blue Marble: Next Generation, Base Map (gleichwinklig)
//   BlackMarble_2016_3km.jpg       Earth at Night / Black Marble 2016, Farbe, 13500x6750 (gleichwinklig)
// MapLibre legt Bilder in der Web-Mercator-Ebene ab, darum werden beide Bilder nach Mercator umgerechnet (quadratisch,
// Breite +-85,0511 Grad), die Tagesansicht wird zur Stimmung abgedunkelt, entsättigt und ins Bläuliche gelegt, und die
// Nachtlichter kommen als aufgehellte, warm getönte Schicht darüber (Screen-Überblendung, ohne Tag/Nacht-Grenze).
// Start (im Projektordner):  node scripts/globe-textur.mjs [Kantenlänge, Standard 4096] [JPEG-Qualität 0-1, Standard 0.82]
// Ergebnis: public/globe/erde-nacht-<Kantenlänge>.jpg. Braucht nur Node und den vorhandenen Google Chrome (Canvas), keine Pakete.
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const N = Number(process.argv[2] ?? 4096);
const Q = Number(process.argv[3] ?? 0.82);
const dir = new URL("../data/blue-marble/", import.meta.url).pathname;
const DAY = dir + "world.200404.3x5400x2700.jpg";
const NIGHT = dir + "BlackMarble_2016_3km.jpg";
const OUT = new URL(`../public/globe/erde-nacht-${N}.jpg`, import.meta.url).pathname;
mkdirSync(new URL("../public/globe/", import.meta.url).pathname, { recursive: true });

const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", "--user-data-dir=" + new URL("../data/chrome-profile-textur", import.meta.url).pathname, "--remote-debugging-port=9334", "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let list;
for (let i = 0; i < 40; i++) { try { list = await (await fetch("http://127.0.0.1:9334/json/list")).json(); if (list.length) break; } catch { /* Chrome startet noch */ } await sleep(250); }
const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

const dayB64 = readFileSync(DAY).toString("base64");
const nightB64 = readFileSync(NIGHT).toString("base64");
const expr = `(async () => {
  const load = async (b64) => { const img = new Image(); img.src = "data:image/jpeg;base64," + b64; await img.decode(); return img; };
  const N = ${N};
  // gleichwinklig -> Mercator, Zeile für Zeile
  const merc = (img) => {
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = document.createElement("canvas"); c.width = N; c.height = N;
    const g = c.getContext("2d", { willReadFrequently: true }); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
    for (let y = 0; y < N; y++) {
      const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 0.5) / N))) * 180 / Math.PI;
      const v = (90 - lat) / 180 * H;
      g.drawImage(img, 0, Math.min(H - 1, Math.max(0, v - 0.5)), W, 1, 0, y, N, 1);
    }
    return g.getImageData(0, 0, N, N);
  };
  const day = merc(await load("${dayB64}"));
  const night = merc(await load("${nightB64}"));
  const out = new ImageData(N, N);
  const D = day.data, L = night.data, O = out.data;
  // Abdunkeln, Entsättigen, Kaltton; Nachtlichter warm getönt per Screen-Überblendung
  const tone = [0.35, 0.46, 0.62], lift = [0.008, 0.020, 0.046], sat = 0.50, warm = [1.0, 0.86, 0.62];
  for (let i = 0; i < D.length; i += 4) {
    const r = D[i] / 255, g = D[i + 1] / 255, b = D[i + 2] / 255;
    const lum = 0.3 * r + 0.59 * g + 0.11 * b;
    const base = [lum + (r - lum) * sat, lum + (g - lum) * sat, lum + (b - lum) * sat];
    const lr = L[i] / 255, lg = L[i + 1] / 255, lb = L[i + 2] / 255;
    const ll = Math.max(lr, lg, lb);
    const boost = Math.min(1, Math.pow(ll, 0.8) * 1.5);
    const k = ll > 0 ? boost / ll : 0;
    const light = [lr * k, lg * k, lb * k];
    for (let c = 0; c < 3; c++) {
      const dayC = Math.min(1, base[c] * tone[c] + lift[c]);
      const lc = light[c] * (0.5 + 0.5 * warm[c]);
      O[i + c] = Math.round(255 * (1 - (1 - dayC) * (1 - Math.min(1, lc))));
    }
    O[i + 3] = 255;
  }
  const c = document.createElement("canvas"); c.width = N; c.height = N;
  c.getContext("2d").putImageData(out, 0, 0);
  return c.toDataURL("image/jpeg", ${Q}).split(",")[1];
})()`;
const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
if (r.result?.exceptionDetails || !r.result?.result?.value) { console.error("Fehler:", JSON.stringify(r.result ?? r.error).slice(0, 600)); ws.close(); chrome.kill(); process.exit(1); }
const buf = Buffer.from(r.result.result.value, "base64");
writeFileSync(OUT, buf);
console.log(`geschrieben: ${OUT} (${(buf.length / 1e6).toFixed(2)} MB, ${N}x${N}, Qualität ${Q})`);
ws.close(); chrome.kill();

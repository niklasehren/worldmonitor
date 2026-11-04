// Stichprobe der 20 Auslöser mit echten Titeln aus gkg (Verbindung über die Quell-Adresse des Ereignisses).
import { loadGkg, norm } from "./load.mjs";
import { DATA, readText } from "./lib.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const s = JSON.parse(readFileSync(join(DATA, "trigger-sample20.json"), "utf8"));
const names = Object.fromEntries(readText("http://data.gdeltproject.org/api/v2/guides/LOOKUP-COUNTRIES.TXT").split("\n").map((l) => l.trim().split("\t")).filter((x) => x.length === 2));
const cache = {};
const titleOf = (slot, url) => { cache[slot] ??= new Map(loadGkg(slot).map((r) => [norm(r.url), r.title])); return cache[slot].get(norm(url)) ?? null; };
const fmtT = (t) => `${t.slice(6, 8)}.${t.slice(4, 6)}. ${t.slice(8, 10)}:${t.slice(10, 12)}`;
const out = s.map((x, i) => ({ nr: i + 1, titel: titleOf(x.slot, x.srcUrl)?.slice(0, 150) ?? "(kein Titel gefunden)", land: names[x.country] ?? "ohne Ereignisland", klasse: x.klasse, ort: x.place, code: x.code, ereignisdatum: x.sqldate, quellen: x.srcs.map((q) => ({ domain: q.src, zeit: fmtT(q.t) })), ersteMeldungUTC: fmtT(x.t1) }));
writeFileSync(join(DATA, "trigger-sample20-titles.json"), JSON.stringify(out, null, 1));
for (const o of out) console.log(`${o.nr}. [${o.klasse}/${o.land}] code ${o.code} | ${o.titel}\n    Ort: ${o.ort} | Quellen(${o.quellen.length}): ${o.quellen.slice(0, 4).map((q) => q.domain + " " + q.zeit).join(", ")} | erste Meldung ${o.ersteMeldungUTC} UTC`);
console.log("verschiedene Quell-Adressen unter allen 1647 Auslösern:", new Set(JSON.parse(readFileSync(join(DATA, "triggers-v1.json"), "utf8")).map((r) => norm(r.srcUrl))).size);

// Runde 3, Aufgabe 8 (Zuarbeit): wie viele Geschichten/Quellenzeilen pro Tag wären zu speichern (nur vorhandene Daten).
import { loadEvents, min, stamps } from "./load.mjs";
import { buildGroups } from "./stories.mjs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { DATA } from "./lib.mjs";
const { events, mentions } = loadEvents(); const groups = buildGroups(events, mentions);
const days = (min(stamps.at(-1)) - min(stamps[0])) / 1440;
const th = [1, 2, 3, 5, 10]; const out = {};
for (const t of th) { let st = 0, pairs = 0, ev = 0; for (const g of groups.values()) { const srcs = new Set(g.ms.map((m) => m.src)); if (srcs.size >= t) { st++; pairs += srcs.size; ev += g.evIds.length; } } out[`M>=${t}`] = { geschichtenProTag: Math.round(st / days), quellenzeilenProTag: Math.round(pairs / days), ereignisseProTag: Math.round(ev / days) }; }
out.tage = +days.toFixed(2); out.ereignisseProTag = Math.round(events.size / days);
writeFileSync(join(DATA, "r3-speicher.json"), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));

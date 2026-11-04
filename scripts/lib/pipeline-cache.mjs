// Pipeline mit dem lokalen Test-Cache (data/gdelt-test, nicht im Git): Kontext aus den gespeicherten Dateien, kein Netzwerk.
// Für build-data.mjs (Cache-Modus) und die Messskripte. In GitHub Actions wird stattdessen scripts/pipeline/zustand.mjs benutzt.
import { loadEvents, stamps, min } from "../gdelt-test/load.mjs";
import { loadTitles } from "../gdelt-test/r3common.mjs";
export * from "./pipeline.mjs";

export function loadContext() {
  const { events, mentions, missing } = loadEvents();
  return { events, mentions, missing, TM: loadTitles() };
}
export const endMin = min(stamps.at(-1));
export const cacheStartMin = min(stamps[0]);

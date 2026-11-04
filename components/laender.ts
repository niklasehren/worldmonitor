// Basisadresse der laufend erzeugten Daten (world.json, countries/). Standard: eigene Seite (/data). Mit NEXT_PUBLIC_DATA_BASE kann die Seite
// die Daten von woanders lesen (z. B. vom Daten-Zweig des Repos, siehe docs/pipeline.md). Fakten (facts.json) und Beispieldatei liegen immer in /data.
export const DATEN = (process.env.NEXT_PUBLIC_DATA_BASE ?? "/data").replace(/\/+$/, "");
// Länderdateien aus public/data/countries/ (siehe scripts/gdelt-test/c1-laender.mjs). Geladen wird erst beim Klick auf ein Land.
export type LandGeschichte = {
  titel: string | null;
  titelQuelle: "gkg" | "adresse";
  adresstext: string | null;
  medien: number;
  quellen: string[];
  erste: string;
  zuletzt: string;
  link: string;
};

export type LandDatei = {
  iso: string;
  name: string;
  geschichtenImFenster: number;
  wenig: boolean;
  /** Vergleich mit den 48 Stunden davor (null, solange nicht genug Verlauf da ist) */
  vorfenster: { stand: string; geschichten: number; veraenderung: number | null; konfliktAnteil: number | null } | null;
  konflikt: { anteil: number; verhaeltnisZumMedian: number; ereignisse: number } | null;
  top: LandGeschichte[];
};

export type Index = { stand: string; laender: Record<string, { name: string }>; atlas: Record<string, string> };

// Ergebnis eines Klicks: Daten, „keine Daten" (Datei fehlt, leer oder nicht lesbar) oder noch am Laden
export type LandStatus = { art: "laedt" } | { art: "daten"; datei: LandDatei } | { art: "keine" };

let indexPromise: Promise<Index | null> | null = null;
export function ladeIndex(): Promise<Index | null> {
  // Erst die laufenden Daten, sonst die mitgelieferte Länderliste (damit Suche und Klicks auch bei unerreichbaren Daten gehen)
  const hole = (url: string) => fetch(url).then((r) => (r.ok ? (r.json() as Promise<Index>) : null)).catch(() => null);
  indexPromise ??= hole(`${DATEN}/countries/index.json`).then((i) => i ?? (DATEN === "/data" ? null : hole("/data/countries/index.json")));
  return indexPromise;
}

const cache = new Map<string, Promise<LandStatus>>();
// Atlas-Nummer der Karte (ISO-Nummer) -> Länderdatei. Fehlt die Datei oder ist sie leer oder kaputt: art "keine" (sagt nichts über die Nachrichtenlage), nie ein Fehler.
export function ladeLand(atlasId: string): Promise<LandStatus> {
  let p = cache.get(atlasId);
  if (!p) {
    p = (async (): Promise<LandStatus> => {
      const index = await ladeIndex();
      const iso = index?.atlas[atlasId];
      if (!iso) return { art: "keine" };
      try {
        const r = await fetch(`${DATEN}/countries/${iso}.json`);
        if (!r.ok) return { art: "keine" };
        const datei = (await r.json()) as LandDatei;
        return Array.isArray(datei.top) && (datei.top.length || datei.wenig === true) ? { art: "daten", datei } : { art: "keine" };
      } catch {
        return { art: "keine" };
      }
    })();
    cache.set(atlasId, p);
  }
  return p;
}

export const hostVon = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
// Links stammen aus Fremddaten: nur http(s) zulassen
export const sichererLink = (url: string) => (/^https?:\/\//i.test(url) ? url : undefined);

// ---- Weltübersicht (public/data/world.json, sonst die Beispieldatei world.sample.json) ----
export type WeltGeschichte = {
  titel: string | null;
  adresstext: string | null;
  medien: number;
  quellen: string[];
  zuletzt: string;
  link: string;
  laender: string[];
  ort: { iso: string; name: string; region: string | null } | null;
};
export type Welt = { stand: string; beispiel: boolean; top8: WeltGeschichte[] };

let weltPromise: Promise<Welt | null> | null = null;
export function ladeWelt(): Promise<Welt | null> {
  weltPromise ??= (async () => {
    for (const [url, beispiel] of [[`${DATEN}/world.json`, null], ["/data/world.sample.json", true]] as const) {
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const w = (await r.json()) as Welt;
        if (!Array.isArray(w.top8) || !w.stand) continue;
        return { ...w, beispiel: beispiel ?? w.beispiel === true };
      } catch {
        /* nächste Datei */
      }
    }
    return null;
  })();
  return weltPromise;
}

// Anzeigetext einer Geschichte: Titel, sonst lesbarer Text aus der Adresse, sonst nichts (der Aufrufer zeigt dann die Domain)
export const textVon = (g: { titel: string | null; adresstext: string | null }) => g.titel ?? g.adresstext;

// Suche ohne Rücksicht auf Akzente und Groß-/Kleinschreibung (Ländernamen kommen aus Intl.DisplayNames, siehe i18n)
export const normSuche = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/ß/g, "ss");

// ---- Länderfakten (public/data/facts.json, aus Wikidata, CC0; scripts/build-facts.mjs) ----
// Hauptstadt: ein Text oder [deutsch, englisch]; Sprachen: ISO-639-Codes; Währung: ISO-4217-Codes; Region: Kontinentschlüssel (Namen kommen aus Intl.DisplayNames bzw. den Übersetzungsdateien)
export type Fakt = {
  hauptstadt: string | [string, string] | null;
  einwohner: { zahl: number; jahr: number | null } | null;
  flaeche: number | null;
  sprachen: string[] | null;
  waehrung: string[] | null;
  region: string[] | null;
};
let faktenPromise: Promise<Record<string, Fakt> | null> | null = null;
export function ladeFakten(): Promise<Record<string, Fakt> | null> {
  faktenPromise ??= fetch("/data/facts.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => (j && typeof j.laender === "object" ? (j.laender as Record<string, Fakt>) : null))
    .catch(() => null);
  return faktenPromise;
}
// Satzanfang groß (Titel aus Fremddaten beginnen oft klein)
export const satzanfang = (s: string) => (s ? s.charAt(0).toLocaleUpperCase("en") + s.slice(1) : s);

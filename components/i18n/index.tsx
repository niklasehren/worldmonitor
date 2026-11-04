"use client";

// Sprache der Oberfläche: Adressparameter ?lang=de|en, sonst gemerkte Wahl (localStorage), sonst Browsersprache (navigator.languages).
// Alle Texte kommen aus de.ts/en.ts; Namen, Zahlen, Zeiten und Zeitabstände über Intl in der gewählten Sprache (kein Zusatzpaket).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { de, type Texte } from "./de";
import { en } from "./en";

export type Lang = "de" | "en";
const TEXTE: Record<Lang, Texte> = { de, en };
const LOCALE: Record<Lang, string> = { de: "de-AT", en: "en-GB" };
const SPEICHER = "wm-lang";
// Zeiten werden in Wiener Zeit angezeigt (wie bisher); die Uhren im Kopf zeigen je Stadt die eigene Zeit
const ZONE = "Europe/Vienna";

const gueltig = (s: string | null | undefined): Lang | null => (s === "de" || s === "en" ? s : null);

// Erste Browsersprache, die Deutsch oder Englisch ist; keine von beiden: Englisch
export function browserSprache(sprachen: readonly string[]): Lang {
  for (const s of sprachen) {
    const p = s.toLowerCase().split("-")[0];
    if (p === "de") return "de";
    if (p === "en") return "en";
  }
  return "en";
}

function erkenne(): Lang {
  const url = gueltig(new URLSearchParams(window.location.search).get("lang")?.toLowerCase());
  if (url) return url;
  try {
    const s = gueltig(window.localStorage.getItem(SPEICHER));
    if (s) return s;
  } catch {
    /* Speicher gesperrt: weiter mit der Browsersprache */
  }
  return browserSprache(navigator.languages?.length ? navigator.languages : [navigator.language ?? "en"]);
}

function baue(lang: Lang, setLang: (l: Lang) => void) {
  const locale = LOCALE[lang];
  const t = TEXTE[lang];
  const region = new Intl.DisplayNames([lang], { type: "region" });
  const sprache = new Intl.DisplayNames([lang], { type: "language" });
  const waehrung = new Intl.DisplayNames([lang], { type: "currency" });
  const nr = new Intl.NumberFormat(locale);
  const prozent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0, signDisplay: "exceptZero" });
  // Deutsch: 01.11.2026; Englisch: 1 Nov 2026 (Monat als Wort, damit Tag und Monat nicht verwechselt werden)
  const datumTeile: Intl.DateTimeFormatOptions = lang === "de" ? { day: "2-digit", month: "2-digit", year: "numeric" } : { day: "numeric", month: "short", year: "numeric" };
  const zeitFmt = new Intl.DateTimeFormat(locale, { ...datumTeile, hour: "2-digit", minute: "2-digit", timeZone: ZONE });
  const datumFmt = new Intl.DateTimeFormat(locale, { weekday: "short", ...datumTeile, timeZone: ZONE });
  const rel = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  const name = (fn: () => string | undefined, fallback: string) => {
    try {
      return fn() ?? fallback;
    } catch {
      return fallback;
    }
  };
  return {
    lang,
    t,
    setLang,
    locale,
    landName: (iso: string) => name(() => region.of(iso), iso),
    // Sprachen, für die der Browser keinen Namen kennt (er gäbe nur den Code zurück), werden weggelassen statt als Code gezeigt
    sprachName: (code: string) => name(() => (sprache.of(code) === code ? undefined : sprache.of(code)), ""),
    waehrungName: (code: string) => name(() => waehrung.of(code), code),
    zahl: (n: number) => nr.format(n),
    prozent: (anteil: number) => prozent.format(anteil),
    zeit: (iso: string) => zeitFmt.format(new Date(iso)),
    datum: (d: Date) => datumFmt.format(d),
    uhr: (tz: string, d: Date) => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(d),
    // Alter relativ zum Datenstand (nicht zur aktuellen Uhrzeit): "aktuell" unter 5 Minuten, sonst Minuten, Stunden oder Tage
    alter: (zeit: string, stand: string) => {
      const min = Math.max(0, Math.round((new Date(stand).getTime() - new Date(zeit).getTime()) / 60000));
      if (min < 5) return t.aktuell;
      if (min < 60) return rel.format(-min, "minute");
      if (min < 48 * 60) return rel.format(-Math.round(min / 60), "hour");
      return rel.format(-Math.round(min / 1440), "day");
    },
    region: (r: string) => t.regionen[r] ?? r,
    sortiere: (a: string, b: string) => a.localeCompare(b, lang),
  };
}

export type I18n = ReturnType<typeof baue>;
const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Vor dem ersten Effekt Deutsch (Server und Browser rendern gleich); die eigentliche Seite erscheint erst danach
  const [lang, setLangState] = useState<Lang>("de");
  useEffect(() => setLangState(erkenne()), []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  // Umschalter: merken und ?lang= in der Adresse nachführen, damit sich der Link in dieser Sprache teilen lässt
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(SPEICHER, l);
    } catch {
      /* Speicher gesperrt */
    }
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("lang", l);
      window.history.replaceState(null, "", u);
    } catch {
      /* Adresse nicht änderbar */
    }
  }, []);
  const wert = useMemo(() => baue(lang, setLang), [lang, setLang]);
  return <Ctx.Provider value={wert}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n ohne I18nProvider");
  return c;
}

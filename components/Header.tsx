"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n, type Lang } from "./i18n";
import { normSuche } from "./laender";

// Von West nach Ost. IANA-Zeitzonen, damit Sommer-/Winterzeit automatisch stimmt. Städtenamen stehen in den Übersetzungsdateien (kopf.staedte).
const CLOCKS = ["America/Los_Angeles", "America/New_York", "Europe/Vienna", "Europe/Moscow", "Asia/Dubai", "Asia/Shanghai"] as const;

type Land = { iso: string; name: string; alt: string };

// Sprachumschalter DE/EN (merkt die Wahl, siehe i18n)
function Umschalter() {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t.sprache.label} className="flex shrink-0 overflow-hidden rounded-lg border border-[var(--wm-glass-border)] font-mono text-[12px]">
      {(["de", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          title={t.sprache[l]}
          onClick={() => setLang(l)}
          className={`h-9 px-2.5 ${lang === l ? "bg-white/15 text-text" : "text-muted hover:bg-white/10 hover:text-text"}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// Suchfeld mit Vorschlägen (Ländernamen in der gewählten Sprache, gefunden wird auch der Name in der anderen). Pfeiltasten, Eingabe wählt, Escape schließt.
function Suche({ laender, onPick }: { laender: Land[]; onPick: (iso: string) => void }) {
  const { t, sortiere } = useI18n();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [aktiv, setAktiv] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const listId = useId();
  const treffer = useMemo(() => {
    const n = normSuche(q.trim());
    if (!n) return [];
    const mit = laender.filter((l) => normSuche(l.name).includes(n) || normSuche(l.alt).includes(n));
    // Namen, die mit dem Suchtext beginnen, zuerst
    const beginnt = (l: Land) => Number(normSuche(l.name).startsWith(n) || normSuche(l.alt).startsWith(n));
    return mit.sort((a, b) => beginnt(b) - beginnt(a) || sortiere(a.name, b.name)).slice(0, 7);
  }, [q, laender, sortiere]);
  useEffect(() => {
    const off = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  }, []);
  const wahl = (l: Land) => {
    setQ("");
    setOpen(false);
    onPick(l.iso);
  };
  const zeigen = open && q.trim().length > 0;
  return (
    <div ref={box} className="relative min-w-0 flex-1 md:max-w-[260px] md:flex-none md:basis-[240px]">
      <input
        type="search"
        role="combobox"
        aria-expanded={zeigen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={zeigen && treffer[aktiv] ? `${listId}-${aktiv}` : undefined}
        aria-label={t.kopf.suchen}
        placeholder={t.kopf.suchen}
        autoComplete="off"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setAktiv(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setAktiv((a) => Math.min(treffer.length - 1, a + 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setAktiv((a) => Math.max(0, a - 1)); }
          else if (e.key === "Enter" && zeigen && treffer[aktiv]) { e.preventDefault(); wahl(treffer[aktiv]); }
          else if (e.key === "Escape") { setOpen(false); }
        }}
        className="h-9 w-full rounded-lg border border-[var(--wm-glass-border)] bg-white/[0.06] px-3 text-[14px] text-text placeholder:text-muted"
      />
      {zeigen && (
        <ul id={listId} role="listbox" aria-label={t.kopf.vorschlaege} className="absolute top-[42px] right-0 left-0 z-40 m-0 list-none overflow-hidden rounded-lg border border-[var(--wm-glass-border)] bg-[#0A0F16] p-1">
          {treffer.length ? (
            treffer.map((l, i) => (
              <li
                key={l.iso}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === aktiv}
                onPointerDown={(e) => { e.preventDefault(); wahl(l); }}
                onPointerEnter={() => setAktiv(i)}
                className={`cursor-pointer rounded-md px-2.5 py-1.5 text-[14px] ${i === aktiv ? "bg-white/10" : ""}`}
              >
                {l.name}
              </li>
            ))
          ) : (
            <li className="px-2.5 py-1.5 text-[14px] text-muted">{t.kopf.keinLand}</li>
          )}
        </ul>
      )}
    </div>
  );
}

export function Header({ stand, beispiel, laender, onPick }: { stand: string | null; beispiel: boolean; laender: Land[]; onPick: (iso: string) => void }) {
  const { t, datum, uhr } = useI18n();
  // Erst nach dem Laden im Browser setzen, damit Server und Browser nicht unterschiedlich rendern.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="glass absolute inset-x-3 top-3 z-20 flex h-[52px] items-center gap-5 px-4">
      <div className="flex shrink-0 items-center gap-2.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
        </svg>
        <h1 className="hidden text-[17px] font-semibold tracking-[0.06em] sm:block">
          WORLD<span className="text-wichtig-text">MONITOR</span>
        </h1>
      </div>
      <span className="hidden h-6 w-px bg-[var(--wm-glass-border)] md:block" aria-hidden="true" />
      <span className="hidden shrink-0 font-mono text-[13px] text-muted lg:block">
        {t.kopf.stand} {stand ? datum(new Date(stand)) : t.fuss.nichtVerfuegbar}
      </span>
      <Suche laender={laender} onPick={onPick} />
      <Umschalter />
      <ul aria-label={t.kopf.uhrzeiten} className="m-0 ml-auto hidden min-w-0 list-none gap-5 overflow-x-auto p-0 sm:flex">
        {CLOCKS.map((tz) => (
          <li key={tz} className="shrink-0 text-right">
            <span className="block font-mono text-[15px] leading-tight tabular-nums">{now ? uhr(tz, now) : "--:--"}</span>
            <span className="block text-[13px] leading-tight text-muted">{t.kopf.staedte[tz]}</span>
          </li>
        ))}
      </ul>
      {beispiel && (
        <span className="hidden shrink-0 border border-[var(--wm-glass-border)] px-2 py-0.5 text-[13px] tracking-[0.08em] text-muted uppercase lg:block">
          {t.beispiel.badgeKopf}
        </span>
      )}
    </header>
  );
}

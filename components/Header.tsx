"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { normSuche } from "./laender";

// Von West nach Ost. IANA-Zeitzonen, damit Sommer-/Winterzeit automatisch stimmt.
const CLOCKS = [
  { city: "Los Angeles", tz: "America/Los_Angeles" },
  { city: "Washington", tz: "America/New_York" },
  { city: "Wien", tz: "Europe/Vienna" },
  { city: "Moskau", tz: "Europe/Moscow" },
  { city: "Dubai", tz: "Asia/Dubai" },
  { city: "Peking", tz: "Asia/Shanghai" },
] as const;

function formatTime(tz: string, now: Date) {
  return new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(now);
}

function formatDate(now: Date) {
  return new Intl.DateTimeFormat("de-AT", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Vienna" }).format(now);
}

type Land = { iso: string; name: string };

// Suchfeld mit Vorschlägen (deutsche Ländernamen). Pfeiltasten, Eingabe wählt, Escape schließt.
function Suche({ laender, onPick }: { laender: Land[]; onPick: (iso: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [aktiv, setAktiv] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const listId = useId();
  const treffer = useMemo(() => {
    const n = normSuche(q.trim());
    if (!n) return [];
    const mit = laender.filter((l) => normSuche(l.name).includes(n));
    // Namen, die mit dem Suchtext beginnen, zuerst
    return mit.sort((a, b) => Number(normSuche(b.name).startsWith(n)) - Number(normSuche(a.name).startsWith(n)) || a.name.localeCompare(b.name, "de")).slice(0, 7);
  }, [q, laender]);
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
        aria-label="Land suchen"
        placeholder="Land suchen"
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
        <ul id={listId} role="listbox" aria-label="Vorschläge" className="absolute top-[42px] right-0 left-0 z-40 m-0 list-none overflow-hidden rounded-lg border border-[var(--wm-glass-border)] bg-[#0A0F16] p-1">
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
            <li className="px-2.5 py-1.5 text-[14px] text-muted">Kein Land gefunden</li>
          )}
        </ul>
      )}
    </div>
  );
}

export function Header({ stand, beispiel, laender, onPick }: { stand: string | null; beispiel: boolean; laender: Land[]; onPick: (iso: string) => void }) {
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
        Stand {stand ? formatDate(new Date(stand)) : "nicht verfügbar"}
      </span>
      <Suche laender={laender} onPick={onPick} />
      <ul aria-label="Uhrzeiten" className="m-0 ml-auto hidden min-w-0 list-none gap-5 overflow-x-auto p-0 sm:flex">
        {CLOCKS.map((c) => (
          <li key={c.tz} className="shrink-0 text-right">
            <span className="block font-mono text-[15px] leading-tight tabular-nums">{now ? formatTime(c.tz, now) : "--:--"}</span>
            <span className="block text-[13px] leading-tight text-muted">{c.city}</span>
          </li>
        ))}
      </ul>
      {beispiel && (
        <span className="hidden shrink-0 border border-[var(--wm-glass-border)] px-2 py-0.5 text-[13px] tracking-[0.08em] text-muted uppercase lg:block">
          Beispieldaten
        </span>
      )}
    </header>
  );
}

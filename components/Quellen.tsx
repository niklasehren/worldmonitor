"use client";

import { useEffect, useRef } from "react";

const A = "text-wichtig-text underline";

// Quellenfenster: Escape und Klick außerhalb schließen. Kein NASA-Logo, nichts, was eine Unterstützung durch NASA nahelegt.
export function Quellen({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && boxRef.current) {
        const f = boxRef.current.querySelectorAll<HTMLElement>("a[href],button");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="h-quellen" className="glass max-h-[85dvh] w-full max-w-[560px] overflow-y-auto px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <h2 id="h-quellen" className="text-[13px] font-semibold tracking-[0.14em] uppercase">
            Quellen
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Quellenfenster schließen" className="-mt-1 -mr-2 h-8 w-8 rounded-lg text-[20px] leading-none text-muted hover:bg-white/10">
            ×
          </button>
        </div>
        <p className="mt-2 text-[13px] text-muted">Automatisch aus öffentlichen Quellen erfasst, nicht redaktionell geprüft.</p>
        <dl className="mt-3 flex flex-col gap-3 text-[14px] leading-snug">
          <div>
            <dt className="font-semibold">Nachrichtendaten</dt>
            <dd className="text-muted">
              Ereignis- und Meldungsdaten: <span className="text-text">The GDELT Project</span>,{" "}
              <a className={A} href="https://www.gdeltproject.org/" target="_blank" rel="noreferrer">
                https://www.gdeltproject.org/
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Satellitenbild</dt>
            <dd className="text-muted">
              Tagesansicht: NASA Earth Observatory,{" "}
              <a className={A} href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/" target="_blank" rel="noreferrer">
                Blue Marble: Next Generation
              </a>
              .
              <br />
              Nachtlichter:{" "}
              <a className={A} href="https://science.nasa.gov/earth/earth-observatory/earth-at-night/" target="_blank" rel="noreferrer">
                NASA Earth Observatory images by Joshua Stevens, using Suomi NPP VIIRS data from Miguel Román, NASA GSFC
              </a>
              .
              <br />
              Beide Bilder sind für diese Darstellung abgedunkelt, umgefärbt und zusammengerechnet.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Ländergrenzen</dt>
            <dd className="text-muted">
              Made with{" "}
              <a className={A} href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">
                Natural Earth
              </a>
              , als TopoJSON aufbereitet von world-atlas (Mike Bostock, ISC-Lizenz).
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Länderfakten</dt>
            <dd className="text-muted">
              Hauptstadt, Einwohner, Fläche, Sprachen, Währung:{" "}
              <a className={A} href="https://www.wikidata.org/" target="_blank" rel="noreferrer">
                Wikidata
              </a>
              , Daten unter CC0 (gemeinfrei), Abfrage vom 03.11.2026. Einwohnerzahlen mit dem Jahr des jeweiligen Eintrags.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Karte</dt>
            <dd className="text-muted">
              <a className={A} href="https://maplibre.org/" target="_blank" rel="noreferrer">
                MapLibre GL JS
              </a>
              , Copyright (c) 2023, MapLibre contributors, BSD-3-Clause-Lizenz (
              <a className={A} href="/licenses/maplibre-gl-LICENSE.txt" target="_blank" rel="noreferrer">
                Lizenztext
              </a>
              ).
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Schriften</dt>
            <dd className="text-muted">
              Inter (Copyright 2016 The Inter Project Authors) und JetBrains Mono (Copyright 2020 The JetBrains Mono Project Authors), beide unter der SIL Open Font License 1.1 (
              <a className={A} href="/licenses/inter-OFL.txt" target="_blank" rel="noreferrer">
                Inter
              </a>
              ,{" "}
              <a className={A} href="/licenses/jetbrains-mono-OFL.txt" target="_blank" rel="noreferrer">
                JetBrains Mono
              </a>
              ).
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

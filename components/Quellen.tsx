"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "./i18n";

const A = "text-wichtig-text underline";

// Quellenfenster: Escape und Klick außerhalb schließen. Kein NASA-Logo, nichts, was eine Unterstützung durch NASA nahelegt.
export function Quellen({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const q = t.quellen;
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
            {q.titel}
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={q.schliessen} className="-mt-1 -mr-2 h-8 w-8 rounded-lg text-[20px] leading-none text-muted hover:bg-white/10">
            ×
          </button>
        </div>
        <p className="mt-2 text-[13px] text-muted">{q.hinweis}</p>
        <dl className="mt-3 flex flex-col gap-3 text-[14px] leading-snug">
          <div>
            <dt className="font-semibold">{q.nachrichten}</dt>
            <dd className="text-muted">
              {q.nachrichtenText}<span className="text-text">The GDELT Project</span>,{" "}
              <a className={A} href="https://www.gdeltproject.org/" target="_blank" rel="noreferrer">
                https://www.gdeltproject.org/
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-semibold">{q.satellit}</dt>
            <dd className="text-muted">
              {q.satellitTag}
              <a className={A} href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/" target="_blank" rel="noreferrer">
                Blue Marble: Next Generation
              </a>
              .
              <br />
              {q.satellitNacht}
              <a className={A} href="https://science.nasa.gov/earth/earth-observatory/earth-at-night/" target="_blank" rel="noreferrer">
                NASA Earth Observatory images by Joshua Stevens, using Suomi NPP VIIRS data from Miguel Román, NASA GSFC
              </a>
              .
              <br />
              {q.satellitHinweis}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">{q.grenzen}</dt>
            <dd className="text-muted">
              Made with{" "}
              <a className={A} href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">
                Natural Earth
              </a>
              {q.grenzenText}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">{q.fakten}</dt>
            <dd className="text-muted">
              {q.faktenText}
              <a className={A} href="https://www.wikidata.org/" target="_blank" rel="noreferrer">
                Wikidata
              </a>
              {q.faktenText2}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">{q.karte}</dt>
            <dd className="text-muted">
              <a className={A} href="https://maplibre.org/" target="_blank" rel="noreferrer">
                MapLibre GL JS
              </a>
              {q.karteText}
              <a className={A} href="/licenses/maplibre-gl-LICENSE.txt" target="_blank" rel="noreferrer">
                {q.lizenztext}
              </a>
              ).
            </dd>
          </div>
          <div>
            <dt className="font-semibold">{q.schriften}</dt>
            <dd className="text-muted">
              {q.schriftenText}
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

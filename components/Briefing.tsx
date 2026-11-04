"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Globe, type MarkerData, type Padding, type View } from "./Globe";
import { Header } from "./Header";
import { Quellen } from "./Quellen";
import { ladeMittelpunkte, dzFuerSpanne, type Centroid } from "./centroids";
import { LAGEN, TIERS, TIER_BG_CLASS, TIER_LABEL, TIER_TEXT_CLASS, tierOfRank, type Lage, type Tier } from "./globe-data";
import {
  alterZuStand, formatZeit, hostVon, ladeFakten, ladeIndex, ladeLand, ladeWelt, landNameDe, satzanfang, sichererLink, textVon,
  type Fakt, type Index, type LandStatus, type Welt, type WeltGeschichte,
} from "./laender";

// Was im rechten Panel steht: ein Land (Karte, Suche, Marker, Liste) oder eine Lage (Chip).
type Detail = { kind: "land"; id: string; name: string } | { kind: "lage"; id: string };

// Freier Bereich für den Globus. Desktop: links das Panel (wenn offen), rechts nur bei geöffnetem Detail; unter der Leiste, über den Chips.
const PANEL_W = 320;
const padDesktop = (links: boolean, detail: boolean): Padding => ({ top: 76, bottom: 120, left: links ? 12 + PANEL_W + 16 : 12, right: detail ? 12 + PANEL_W + 16 : 12 });
// Handy: unter der Leiste, über dem Sheet (Höhen in Pixeln)
const SHEET_CLOSED = 176;
const SHEET_DETAIL = 340;

const TITLE = "Heute wichtig";

// Test-Schalter (Adressparameter, standardmäßig aus): ?glas=0 ohne Weichzeichner, ?rand=0 ohne Leuchtverlauf, ?gruppen=0 ohne Marker-Gruppen, ?textur=2048 oder 4096
type Schalter = { glas: boolean; rand: boolean; gruppen: boolean; textur: "2048" | "4096" | null };
const SCHALTER_AUS: Schalter = { glas: true, rand: true, gruppen: true, textur: null };

function BeispielBadge() {
  return (
    <span className="inline-block border border-[var(--wm-glass-border)] px-1.5 py-0.5 text-[12px] leading-none tracking-[0.08em] text-muted uppercase">
      Beispiel
    </span>
  );
}

function useMedia(query: string) {
  const [match, setMatch] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

type Zeile = WeltGeschichte & { rank: number; tier: Tier };

function Zeilenrahmen({ z, cls, onPick, children }: { z: Zeile; cls: string; onPick: (z: Zeile) => void; children: React.ReactNode }) {
  return z.ort ? (
    <button type="button" onClick={() => onPick(z)} className={`${cls} cursor-pointer text-left hover:bg-white/[0.04]`}>
      {children}
    </button>
  ) : (
    <div className={cls}>{children}</div>
  );
}

// Linke Liste (ruhig): Top 3 groß (Rubrik, Titel bis 2 Zeilen, „N Medien · vor X Std.", schlanker Balken); die übrigen 5 hinter dem Knopf „Weitere 5"
// als einzeilige Zeilen. Keine Domainlisten; bis zu 3 Quellennamen nur bei der gewählten Meldung (aufgeklappt).
function Heute({ zeilen, stand, selectedNr, onPick }: { zeilen: Zeile[]; stand: string | null; selectedNr: number | null; onPick: (z: Zeile) => void }) {
  const [mehr, setMehr] = useState(false);
  const top = zeilen.filter((z) => z.tier === "top");
  const rest = zeilen.filter((z) => z.tier !== "top");
  const max = Math.max(1, ...zeilen.map((z) => z.medien));
  const titelOf = (z: Zeile) => satzanfang(textVon(z) ?? "");
  const rubrik = (z: Zeile) => (z.ort ? [z.ort.name, z.ort.region].filter(Boolean).join(" · ") : "Ort unbekannt");
  const alter = (z: Zeile) => (stand ? ` · ${alterZuStand(z.zuletzt, stand)}` : "");
  return (
    <>
      <ol className="m-0 list-none p-0">
        {top.map((z) => (
          <li key={z.rank} className="border-t border-[var(--wm-glass-border)] first:border-t-0">
            <Zeilenrahmen z={z} onPick={onPick} cls="block w-full rounded-md px-2 py-3">
              <span className="flex items-center gap-1.5 font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
                <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${TIER_BG_CLASS[z.tier]}`} aria-hidden="true" />
                <span className="truncate">{rubrik(z)}</span>
              </span>
              <span className="mt-1.5 line-clamp-2 text-[17px] leading-snug font-semibold">{titelOf(z)}</span>
              <span className="mt-1.5 block text-[12px] text-muted">
                <span className="font-mono text-text">{z.medien}</span> Medien{alter(z)}
              </span>
              <span className="mt-2 block h-[3px] overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                <span className={`block h-full rounded-full ${TIER_BG_CLASS[z.tier]}`} style={{ width: `${(z.medien / max) * 100}%` }} />
              </span>
              {selectedNr === z.rank && z.quellen.length > 0 && <span className="mt-2 block text-[12px] text-muted">{z.quellen.slice(0, 3).join(", ")}</span>}
            </Zeilenrahmen>
          </li>
        ))}
      </ol>
      {rest.length > 0 && (
        <div className="border-t border-[var(--wm-glass-border)] pt-1">
          <button
            type="button"
            aria-expanded={mehr}
            onClick={() => setMehr((m) => !m)}
            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-[13px] text-muted hover:bg-white/[0.04] hover:text-text"
          >
            <span>{mehr ? "Weniger" : `Weitere ${rest.length}`}</span>
            <span aria-hidden="true">{mehr ? "▴" : "▾"}</span>
          </button>
          {mehr && (
            <ol className="m-0 list-none p-0">
              {rest.map((z) => (
                <li key={z.rank}>
                  <Zeilenrahmen z={z} onPick={onPick} cls="flex w-full items-center gap-2 rounded-md px-2 py-1.5">
                    <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${TIER_BG_CLASS[z.tier]}`} aria-hidden="true" />
                    <span className="w-3 shrink-0 font-mono text-[12px] text-muted">{z.rank}</span>
                    <span className={`min-w-0 flex-1 truncate text-[13px] ${selectedNr === z.rank ? "text-text" : "text-muted"}`}>{titelOf(z)}</span>
                    <span className="shrink-0 font-mono text-[12px] text-text" title={`${z.medien} Medien`}>
                      {z.medien}
                    </span>
                  </Zeilenrahmen>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </>
  );
}

// Konfliktmarke: nur „erhöht" (Verhältnis zum Median der Länder mindestens 2 bei mindestens 100 Ereignissen), sonst wird nichts gezeigt
const KONFLIKT_FAKTOR = 2;
const KONFLIKT_MIN_EREIGNISSE = 100;

export function Briefing() {
  const mobile = useMedia("(max-width: 767px)");
  const [sw, setSw] = useState<Schalter>(SCHALTER_AUS);
  const [welt, setWelt] = useState<Welt | null>(null);
  const [index, setIndex] = useState<Index | null>(null);
  const [mitte, setMitte] = useState<Map<string, Centroid> | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [tab, setTab] = useState<"lage" | "news" | "fakten">("lage");
  const [fakten, setFakten] = useState<Record<string, Fakt> | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [listeOffen, setListeOffen] = useState(true);
  const [quellenOffen, setQuellenOffen] = useState(false);
  const [land, setLand] = useState<{ id: string; status: LandStatus } | null>(null);
  const drag = useRef<{ y: number } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("textur");
    setSw({ glas: q.get("glas") !== "0", rand: q.get("rand") !== "0", gruppen: q.get("gruppen") !== "0", textur: t === "2048" || t === "4096" ? t : null });
    let alive = true;
    ladeWelt().then((w) => alive && setWelt(w));
    ladeIndex().then((i) => alive && setIndex(i));
    ladeMittelpunkte().then((m) => alive && setMitte(m));
    ladeFakten().then((f) => alive && setFakten(f));
    return () => {
      alive = false;
    };
  }, []);

  const stand = welt?.stand ?? index?.stand ?? null;
  const isoToAtlas = useMemo(() => Object.fromEntries(Object.entries(index?.atlas ?? {}).map(([id, iso]) => [iso, id])), [index]);

  // Liste und Marker aus der Weltübersicht: Rang 1 bis 8, Stufe nach Rang
  // Einträge ohne lesbaren Text werden nie angezeigt (zusätzliche Absicherung zu build-data.mjs); der Rest rückt nach
  const zeilen = useMemo<Zeile[]>(() => (welt?.top8 ?? []).filter((g) => textVon(g)).map((g, i) => ({ ...g, rank: i + 1, tier: tierOfRank(i + 1) })), [welt]);
  const markers = useMemo<MarkerData[]>(() => {
    if (!mitte) return [];
    const out: MarkerData[] = [];
    for (const z of zeilen) {
      const c = z.ort && mitte.get(isoToAtlas[z.ort.iso]);
      if (!z.ort || !c) continue;
      out.push({ nr: z.rank, tier: z.tier, lon: c.lon, lat: c.lat, label: textVon(z) ?? hostVon(z.link), iso: z.ort.iso });
    }
    return out;
  }, [zeilen, mitte, isoToAtlas]);

  const landId = detail?.kind === "land" ? detail.id : null;
  const landIso = landId ? index?.atlas[landId] ?? null : null;
  const tierOfIso = useMemo(() => {
    const m = new Map<string, Tier>();
    for (const z of zeilen) if (z.ort && !m.has(z.ort.iso)) m.set(z.ort.iso, z.tier);
    return m;
  }, [zeilen]);
  const selectedNr = landIso ? zeilen.find((z) => z.ort?.iso === landIso)?.rank ?? null : null;
  const selectedCountry = detail?.kind === "land" ? detail.name : null;
  const activeLage = detail?.kind === "lage" ? detail.id : null;

  // Beim Klick auf ein Land die Länderdatei laden (Ergebnis nur übernehmen, wenn dasselbe Land noch gewählt ist)
  useEffect(() => {
    if (!landId) return;
    let alive = true;
    ladeLand(landId).then((status) => alive && setLand({ id: landId, status }));
    return () => {
      alive = false;
    };
  }, [landId]);
  const landStatus: LandStatus | null = landId ? (land?.id === landId ? land.status : { art: "laedt" }) : null;

  const padding = useMemo<Padding>(
    () => (mobile ? { top: 76, bottom: (detail ? SHEET_DETAIL : SHEET_CLOSED) + 12, left: 12, right: 12 } : padDesktop(listeOffen, !!detail)),
    [mobile, detail, listeOffen],
  );

  // Land öffnen: aus Karte (ohne Kamerafahrt), Suche, Liste, Marker oder Lage (mit Kamerafahrt)
  const pickAtlas = useCallback(
    (id: string, name: string, fly: boolean) => {
      setDetail({ kind: "land", id, name });
      setTab("lage");
      setSheetOpen(false);
      const c = mitte?.get(id);
      if (fly && c) setView({ lon: c.lon, lat: c.lat, dz: dzFuerSpanne(c.span), key: Date.now() });
    },
    [mitte],
  );
  const pickIso = useCallback(
    (iso: string) => {
      const id = isoToAtlas[iso];
      if (id) pickAtlas(id, mitte?.get(id)?.name ?? landNameDe(iso), true);
    },
    [isoToAtlas, mitte, pickAtlas],
  );
  const pickZeile = (z: Zeile) => z.ort && pickIso(z.ort.iso);
  const pickLage = (l: Lage) => {
    setDetail({ kind: "lage", id: l.id });
    setView({ lon: l.lon, lat: l.lat, dz: l.dz, key: Date.now() });
    setSheetOpen(false);
  };

  const suche = useMemo(
    () => [...new Set(Object.values(index?.atlas ?? {}))].map((iso) => ({ iso, name: landNameDe(iso) })).sort((a, b) => a.name.localeCompare(b.name, "de")),
    [index],
  );

  if (mobile === null) return <div className="fixed inset-0 bg-bg" />;

  const chips = (cls: string) => (
    <nav aria-label="Lagen" className={cls}>
      {LAGEN.map((l) => (
        <button
          key={l.id}
          type="button"
          aria-pressed={activeLage === l.id}
          title={l.region}
          onClick={() => pickLage(l)}
          className={`glass shrink-0 rounded-full! px-4 py-2 text-[15px] whitespace-nowrap hover:bg-white/10 ${activeLage === l.id ? "border-[var(--wm-text)]!" : ""}`}
        >
          {l.name}
        </button>
      ))}
    </nav>
  );

  // ---- Länderpanel ----
  const geschichteText = (g: { titel: string | null; adresstext: string | null }) => satzanfang(textVon(g) ?? "");
  const schliessen = (
    <button type="button" onClick={() => setDetail(null)} aria-label="Detailpanel schließen" className="-mt-1 -mr-2 h-8 w-8 shrink-0 rounded-lg text-[20px] leading-none text-muted hover:bg-white/10">
      ×
    </button>
  );
  const landKopf = (name: string, tier: Tier | undefined) => (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={`font-mono text-[12px] tracking-[0.1em] uppercase ${tier ? TIER_TEXT_CLASS[tier] : "text-muted"}`}>
          {tier ? (
            <>
              <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${TIER_BG_CLASS[tier]}`} aria-hidden="true" />
              {TIER_LABEL[tier]}
            </>
          ) : (
            "Land"
          )}
        </p>
        <h2 className="mt-1 text-2xl leading-tight font-semibold break-words">{name}</h2>
      </div>
      {schliessen}
    </div>
  );

  const alterText = (zeit: string) => (stand ? alterZuStand(zeit, stand) : formatZeit(zeit));
  const fakt = (iso: string | null): Fakt | null => (iso && fakten?.[iso]) || null;
  const zahl = (n: number) => n.toLocaleString("de-AT");
  const faktenZeilen = (f: Fakt | null): [string, string][] => [
    ["Hauptstadt", f?.hauptstadt ?? "–"],
    ["Einwohner", f?.einwohner ? `${zahl(f.einwohner.zahl)}${f.einwohner.jahr ? ` (${f.einwohner.jahr})` : ""}` : "–"],
    ["Fläche", f?.flaeche ? `${zahl(f.flaeche)} km²` : "–"],
    ["Sprachen", f?.sprachen?.length ? f.sprachen.join(", ") : "–"],
    ["Währung", f?.waehrung ?? "–"],
    ["Region", f?.region ?? "–"],
  ];

  const landInhalt = (st: LandStatus) => {
    if (tab === "fakten") {
      return (
        <dl className="m-0 grid grid-cols-[88px_1fr] gap-x-3 gap-y-3 text-[14px] leading-snug">
          {faktenZeilen(fakt(landIso)).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase">{k}</dt>
              <dd className="m-0">{v}</dd>
            </div>
          ))}
        </dl>
      );
    }
    if (st.art === "laedt") return <p className="text-[14px] text-muted">Lade …</p>;
    if (st.art === "keine")
      return <p className="text-[14px] text-muted">{welt?.beispiel ? "Dieses Land ist in den Beispieldaten nicht enthalten." : "Für dieses Land sind gerade keine Daten verfügbar."}</p>;
    const d = st.datei;
    if (tab === "news") {
      return (
        <ol className="m-0 list-none p-0">
          {d.top.slice(0, 10).map((g, i) => {
            const href = sichererLink(g.link);
            const inhalt = (
              <>
                <span className="line-clamp-2 text-[14px] leading-snug font-semibold">{geschichteText(g)}</span>
                <span className="mt-1 block text-[12px] text-muted">
                  <span className="font-mono text-text">{g.medien}</span> Medien · {alterText(g.zuletzt)}
                </span>
              </>
            );
            return (
              <li key={i} className="border-t border-[var(--wm-glass-border)] first:border-t-0">
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="block rounded-md px-1.5 py-2.5 hover:bg-white/[0.05]">
                    {inhalt}
                  </a>
                ) : (
                  <div className="px-1.5 py-2.5">{inhalt}</div>
                )}
              </li>
            );
          })}
        </ol>
      );
    }
    const k = d.konflikt;
    const erhoeht = !!k && k.verhaeltnisZumMedian >= KONFLIKT_FAKTOR && k.ereignisse >= KONFLIKT_MIN_EREIGNISSE;
    return (
      <>
        {erhoeht && (
          <p className="mb-2 flex items-center gap-1.5 text-[14px] text-top-text">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-top" aria-hidden="true" />
            Konfliktberichte erhöht
          </p>
        )}
        {d.wenig && <p className="mb-2 text-[14px] text-muted">Wenig Berichterstattung in den letzten 48 Stunden</p>}
        {d.vorfenster?.veraenderung != null && (
          <p className="mb-2 text-[13px] text-muted">
            Gegenüber den 48 Stunden davor: <span className="font-mono text-text">{`${d.vorfenster.veraenderung > 0 ? "+" : ""}${Math.round(d.vorfenster.veraenderung * 100)} %`}</span>
          </p>
        )}
        <ol className="m-0 list-none p-0">
          {d.top.slice(0, 3).map((g, i) => (
            <li key={i} className="border-t border-[var(--wm-glass-border)] py-2.5 first:border-t-0 first:pt-0">
              <span className="line-clamp-2 text-[14px] leading-snug font-semibold">{geschichteText(g)}</span>
              <span className="mt-1 block text-[12px] text-muted">
                <span className="font-mono text-text">{g.medien}</span> Medien · {alterText(g.zuletzt)}
              </span>
            </li>
          ))}
        </ol>
      </>
    );
  };

  const TABS = [["lage", "Lage"], ["news", "News"], ["fakten", "Fakten"]] as const;
  const tabs = (
    <div role="tablist" aria-label="Ansicht" className="mt-3 flex gap-5 border-b border-[var(--wm-glass-border)]">
      {TABS.map(([t, label]) => (
        <button
          key={t}
          type="button"
          role="tab"
          id={`tab-${t}`}
          aria-selected={tab === t}
          aria-controls="tab-inhalt"
          onClick={() => setTab(t)}
          className={`-mb-px border-b-2 pb-2 text-[14px] font-semibold ${tab === t ? "border-[var(--wm-text)] text-text" : "border-transparent text-muted hover:text-text"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  // Empfänger für fehlende Länder: Name aus Karte (englisch), wenn keine ISO-Zuordnung bekannt ist
  const lageDetail = detail?.kind === "lage" ? LAGEN.find((l) => l.id === detail.id) : undefined;
  const detailBody =
    detail?.kind === "land" ? (
      <>
        {landKopf(landIso ? landNameDe(landIso) : detail.name, landIso ? tierOfIso.get(landIso) : undefined)}
        {tabs}
        <div role="tabpanel" id="tab-inhalt" aria-labelledby={`tab-${tab}`} className="mt-4 min-h-0 flex-1 overflow-y-auto">
          {landStatus && landInhalt(landStatus)}
        </div>
      </>
    ) : lageDetail ? (
      <>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[12px] tracking-[0.1em] text-muted uppercase">Lage · {lageDetail.region}</p>
            <h2 className="mt-1 text-2xl leading-tight font-semibold">{lageDetail.name}</h2>
          </div>
          {schliessen}
        </div>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          <h3 className="font-mono text-[12px] tracking-[0.1em] text-muted uppercase">Länder</h3>
          <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
            {lageDetail.laender.map((iso) => (
              <li key={iso}>
                <button type="button" disabled={!isoToAtlas[iso]} onClick={() => pickIso(iso)} className="rounded-full border border-[var(--wm-glass-border)] bg-white/[0.04] px-3 py-1 text-[13px] hover:bg-white/10">
                  {landNameDe(iso)}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[14px] text-muted">Geschichten sind den Lagen noch nicht zugeordnet.</p>
        </div>
      </>
    ) : null;

  const standText = stand ? formatZeit(stand) : "nicht verfügbar";
  // Alte Daten bleiben sichtbar und werden gekennzeichnet (Pipeline normal höchstens ca. 90 Minuten alt)
  const veraltet = !!stand && Date.now() - new Date(stand).getTime() > 3 * 3600 * 1000;
  const quellenKnopf = (
    <button type="button" onClick={() => setQuellenOffen(true)} className="text-wichtig-text underline">
      Quellen
    </button>
  );

  // Handy: Sheet per Ziehen oder Tippen auf den Griff umschalten
  const onHandleDown = (e: React.PointerEvent) => {
    drag.current = { y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onHandleUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dy = e.clientY - d.y;
    if (Math.abs(dy) > 30) setSheetOpen(dy < 0);
    else setSheetOpen((o) => !o);
  };

  const texture = `/globe/erde-nacht-${sw.textur ?? (mobile ? "2048" : "4096")}.jpg`;
  const liste = zeilen.length ? <Heute zeilen={zeilen} stand={stand} selectedNr={selectedNr} onPick={pickZeile} /> : <p className="px-2 py-2 text-[14px] text-muted">Keine Daten verfügbar</p>;

  return (
    <div className={`fixed inset-0 overflow-hidden bg-bg text-text ${sw.glas ? "" : "wm-ohne-glas"}`}>
      <Globe
        markers={markers}
        glow={sw.rand}
        gruppen={sw.gruppen}
        selectedNr={selectedNr}
        selectedCountry={selectedCountry}
        view={view}
        padding={padding}
        texture={texture}
        onSelectPoint={(nr) => pickZeile(zeilen[nr - 1])}
        onSelectCountry={(name, id) => pickAtlas(id, name, false)}
        onError={setError}
      />

      <Header stand={stand} beispiel={welt?.beispiel === true} laender={suche} onPick={pickIso} />

      {welt?.beispiel && (
        <p role="status" className="glass absolute top-[64px] left-1/2 z-10 max-w-[calc(100vw-24px)] -translate-x-1/2 px-4 py-1.5 text-center text-[13px] md:top-[76px]">
          Aktuelle Daten nicht erreichbar. Gezeigt werden Beispieldaten{stand ? ` (Stand ${formatZeit(stand)})` : ""}.
        </p>
      )}

      {error && (
        <p role="status" className="glass absolute top-[76px] left-1/2 z-10 -translate-x-1/2 px-4 py-2 text-[13px] text-muted md:top-auto md:bottom-[110px]">
          Karte nicht verfügbar: {error}
        </p>
      )}

      {!mobile && (
        <>
          {/* Links: Heute wichtig (ab 1280 px Breite bis zum unteren Rand, sonst bis über Chips und Fußzeile); einklappbar */}
          {listeOffen ? (
            <aside aria-labelledby="h-wichtig" className="glass absolute top-[76px] left-3 z-10 flex max-h-[60dvh] flex-col" style={{ width: PANEL_W }}>
              <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-1">
                <h2 id="h-wichtig" className="text-[13px] font-semibold tracking-[0.14em] uppercase">
                  {TITLE}
                </h2>
                <span className="flex items-center gap-1">
                  {welt?.beispiel && <BeispielBadge />}
                  <button type="button" onClick={() => setListeOffen(false)} aria-label="Liste einklappen" aria-expanded="true" className="h-8 w-8 rounded-lg text-[18px] leading-none text-muted hover:bg-white/10">
                    ‹
                  </button>
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">{liste}</div>
            </aside>
          ) : (
            <button type="button" onClick={() => setListeOffen(true)} aria-label="Liste ausklappen" aria-expanded="false" className="glass absolute top-[76px] left-3 z-10 flex h-10 items-center gap-2 px-3 text-[13px] font-semibold tracking-[0.14em] uppercase hover:bg-white/10">
              {TITLE} <span aria-hidden="true">›</span>
            </button>
          )}

          {/* Rechts: Detailpanel, standardmäßig eingeklappt */}
          {detail && (
            <aside aria-label="Details" className="glass absolute top-[76px] right-3 bottom-[110px] z-10 flex flex-col px-4 py-4" style={{ width: PANEL_W }}>
              {detailBody}
            </aside>
          )}

          {/* Unten: Lagen */}
          {chips(`absolute inset-x-3 bottom-[58px] z-10 flex flex-wrap justify-center gap-2 ${listeOffen ? "xl:left-[348px]" : ""}`)}

          {/* Fußzeile */}
          <footer className={`glass absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-x-6 px-4 py-2 text-[12px] text-muted ${listeOffen ? "xl:left-[348px]" : ""}`}>
            <span>
              Stand: <span className="font-mono text-text">{standText}</span>{veraltet && <span> · Daten älter als 3 Std.</span>}
            </span>
            {quellenKnopf}
          </footer>
        </>
      )}

      {mobile && (
        <>
          {/* Handy: Heute wichtig als Sheet unten (zwei Zustände) */}
          <section
            aria-label={TITLE}
            className="glass absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-b-none! border-x-0! border-b-0! transition-[height] duration-300"
            style={{ height: sheetOpen ? "72dvh" : `${SHEET_CLOSED}px` }}
          >
            <button
              type="button"
              aria-expanded={sheetOpen}
              aria-label={sheetOpen ? "Liste einklappen" : "Liste ausklappen"}
              onPointerDown={onHandleDown}
              onPointerUp={onHandleUp}
              onPointerCancel={() => (drag.current = null)}
              style={{ touchAction: "none" }}
              className="flex h-7 w-full shrink-0 items-center justify-center"
            >
              <span className="h-1 w-10 rounded-full bg-[var(--wm-muted)]" aria-hidden="true" />
            </button>
            <div className="flex shrink-0 items-center justify-between px-4 pb-1.5">
              <h2 className="text-[13px] font-semibold tracking-[0.14em] uppercase">{TITLE}</h2>
              {welt?.beispiel && <BeispielBadge />}
            </div>
            {chips("flex shrink-0 gap-2 overflow-x-auto px-3 pb-2")}
            <div inert={!sheetOpen} className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 ${sheetOpen ? "" : "invisible"}`}>
              {liste}
            </div>
            <p className="flex shrink-0 items-center justify-between px-4 py-1.5 text-[12px] leading-snug text-muted">
              <span>
                Stand: <span className="font-mono text-text">{standText}</span>{veraltet && <span> · Daten älter als 3 Std.</span>}
              </span>
              {quellenKnopf}
            </p>
          </section>

          {/* Handy: Detail als eigenes Sheet */}
          {detail && (
            <aside aria-label="Details" className="glass absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-b-none! border-x-0! border-b-0! px-5 pt-4 pb-4" style={{ height: `${SHEET_DETAIL}px` }}>
              {detailBody}
            </aside>
          )}
        </>
      )}
      {quellenOffen && <Quellen onClose={() => setQuellenOffen(false)} />}
    </div>
  );
}

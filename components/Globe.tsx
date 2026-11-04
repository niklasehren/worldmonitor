"use client";

import { useEffect, useRef } from "react";
import { Map as MapLibreMap, Marker, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { borderLinesFromTopology, countriesFromTopology, type Topology } from "./topo";
import { START, TIER_LABEL, type Tier } from "./globe-data";

const MERC_LAT = 85.0511287798;
// Verhältnis aus gemessenem Globus-Durchmesser (Screenshot) und der Formel 512 · 2^zoom / π
const GLOBE_K = 0.892;

// Größte sinnvolle Zoomstufe (E2, Rechnung in DESIGN.md): In der Mitte des Globus gilt gemessen 1,581 · 2^zoom Bildschirmpixel je Grad.
// Die Textur hat N/360 Texel je Grad Länge (4096: 11,38; 2048: 5,69), auf der Bildschirmbreite eines Längengrades bei Breite φ bleibt cos φ davon.
// Texel je Gerätepixel = (N/360) / (dpr · 1,581 · 2^zoom · cos φ). Wir verlangen mindestens 0,5 (höchstens doppelt vergrößert) bei φ = 35°.
const PX_GRAD = 1.581;
const MIN_TEXEL_JE_PIXEL = 0.5;
const REF_BREITE = 35;
export function zoomGrenze(textur: string, dpr: number) {
  const n = Number(/erde-nacht-(\d+)/.exec(textur)?.[1] ?? 4096);
  return Math.log2(n / 360 / (MIN_TEXEL_JE_PIXEL * dpr * PX_GRAD * Math.cos((REF_BREITE * Math.PI) / 180)));
}

export type Padding = { top: number; bottom: number; left: number; right: number };
export type MarkerData = { nr: number; tier: Tier; lon: number; lat: number; label: string; iso: string | null };
// Marker, die auf dem Bildschirm näher als so viele Pixel beieinander liegen, werden zu einer Gruppe (größter Marker 34 px)
export const GRUPPEN_ABSTAND = 34;
export type View = { lon: number; lat: number; dz: number; key: number };

type Props = {
  markers: MarkerData[];
  /** Leuchtverlauf um den Globus (Test-Schalter ?rand=0 schaltet ihn ab) */
  glow: boolean;
  /** Marker zu Gruppen zusammenfassen (Test-Schalter ?gruppen=0 schaltet das ab) */
  gruppen: boolean;
  selectedNr: number | null;
  selectedCountry: string | null;
  view: View | null;
  padding: Padding;
  /** Textur: NASA Blue Marble (Base Map), von scripts/globe-textur.mjs nach Mercator umgerechnet (4096 oder 2048) */
  texture: string;
  onSelectPoint: (nr: number) => void;
  onSelectCountry: (name: string, id: string) => void;
  onError: (msg: string) => void;
};

// Zoom so wählen, dass der ganze Globus mit etwas Abstand in den freien Bereich zwischen den Panels passt.
function fitZoom(el: HTMLElement, pad: Padding) {
  const w = el.clientWidth - pad.left - pad.right;
  const h = el.clientHeight - pad.top - pad.bottom;
  const d = Math.max(120, Math.min(w, h)) * 0.92;
  return Math.log2((d * Math.PI) / (512 * GLOBE_K));
}

export function Globe({ markers: markerData, glow, gruppen: gruppieren, selectedNr, selectedCountry, view, padding, texture, onSelectPoint, onSelectCountry, onError }: Props) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const glowEl = useRef<HTMLDivElement>(null);
  const markers = useRef<Map<number, HTMLButtonElement>>(new Map());
  const cb = useRef({ onSelectPoint, onSelectCountry, onError });
  cb.current = { onSelectPoint, onSelectCountry, onError };
  const countryRef = useRef<string | null>(null);
  countryRef.current = selectedCountry;
  const baseZoom = useRef(2);
  const limitZoom = useRef(7);
  // Grenze, aber nie unter Startzoom + 0,35 (auf Handys mit grober Textur ist schon der Start unscharf)
  const setzeGrenze = (map: MapLibreMap) => {
    limitZoom.current = Math.min(7, Math.max(zoomGrenze(texture, window.devicePixelRatio || 1), baseZoom.current + 0.35));
    map.setMaxZoom(limitZoom.current);
  };
  const paddingRef = useRef(padding);
  paddingRef.current = padding;

  useEffect(() => {
    const el = mapEl.current;
    if (!el) return;
    let cancelled = false;

    // Der Bundler findet den Worker von maplibre-gl 6 nicht selbst; die Dateien liegen als Kopie in public/maplibre/
    // (Kopierbefehl: siehe Abschnitt „Karte: Globus" in DESIGN.md).
    setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

    let map: MapLibreMap;
    try {
      const z = fitZoom(el, paddingRef.current);
      baseZoom.current = z;
      map = new MapLibreMap({
        container: el,
        // Stil nur aus eigenen Ebenen: keine Kartenserver, keine Schriften, keine Beschriftung.
        style: { version: 8, sources: {}, layers: [{ id: "grund", type: "background", paint: { "background-color": "#101332" } }] },
        center: [START.lon, START.lat],
        zoom: z,
        minZoom: z - 0.7,
        maxZoom: 7,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
        touchPitch: false,
      });
    } catch (e) {
      cb.current.onError(String(e instanceof Error ? e.message : e));
      return;
    }
    performance.mark("wm-karte-erzeugt");
    mapRef.current = map;
    setzeGrenze(map);
    map.setPadding(paddingRef.current);
    map.touchZoomRotate.disableRotation();

    // Leuchtrand: MapLibres eigene Atmosphäre (setSky/setLight) ergab im Test keinen sichtbaren Rand und ist nicht in Farbe und Stärke einstellbar;
    // stattdessen ein weicher CSS-Verlauf über dem Globus.
    // Der Globus liegt immer im Mittelpunkt des freien Bereichs (Padding).
    const updateGlow = () => {
      const g = glowEl.current;
      if (!g) return;
      const z = map.getZoom();
      const c = map.getCenter();
      const c0 = map.project(c);
      g.style.setProperty("--cx", `${c0.x}px`);
      g.style.setProperty("--cy", `${c0.y}px`);
      // Rand des Globus aus der Kamera selbst: zwei Punkte im Abstand 10° und 20° vom Mittelpunkt nach Osten projizieren,
      // daraus Brennweite f und Kameraabstand b (in Globusradien) lösen; Randradius = f / sqrt(b² − 1).
      const rad = Math.PI / 180;
      const east = (deg: number) => {
        const d = deg * rad, phi = c.lat * rad;
        const lat2 = Math.asin(Math.sin(phi) * Math.cos(d));
        const lon2 = c.lng * rad + Math.atan2(Math.sin(d) * Math.cos(phi), Math.cos(d) - Math.sin(phi) * Math.sin(lat2));
        const p2 = map.project([lon2 / rad, lat2 / rad]);
        return Math.hypot(p2.x - c0.x, p2.y - c0.y);
      };
      const d1 = 10 * rad, d2 = 20 * rad, x1 = east(10), x2 = east(20);
      const b = (x1 / Math.tan(d1) - x2 / Math.tan(d2)) / (x1 / Math.sin(d1) - x2 / Math.sin(d2));
      const f = (x1 * (b - Math.cos(d1))) / Math.sin(d1);
      const r = b > 1 ? f / Math.sqrt(b * b - 1) : 0;
      g.style.setProperty("--r", `${r}px`);
      g.style.setProperty("--zoom", String(z));
      g.style.setProperty("--pxgrad", String(east(1))); // Bildschirmpixel je Grad (Großkreis) in der Mitte, für die Schärfe-Messung (DESIGN.md)
      g.style.opacity = String(Math.max(0, Math.min(1, 1 - (z - 4) / 2)));
    };
    map.on("move", updateGlow);
    map.on("resize", updateGlow);
    updateGlow();
    map.on("error", (ev) => {
      if (!cancelled) cb.current.onError(String(ev.error?.message ?? ev.error));
    });

    map.on("style.load", async () => {
      performance.mark("wm-style-geladen");
      map.setProjection({ type: "globe" });
      // Satellitenbild, abgedunkelt zur Stimmung
      map.addSource("satellit", {
        type: "image",
        url: texture,
        coordinates: [[-180, MERC_LAT], [180, MERC_LAT], [180, -MERC_LAT], [-180, -MERC_LAT]],
      });
      map.addLayer({
        id: "satellit",
        type: "raster",
        source: "satellit",
        // Abdunkeln, Kaltton und Nachtlichter sind in die Textur eingerechnet (scripts/globe-textur.mjs)
        paint: { "raster-fade-duration": 0 },
      });
      // Messmarke: erstes gezeichnetes Bild, nachdem die Textur geladen ist (siehe Browser-Konsole: performance.getEntriesByType("mark"))
      const onSource = (e: { sourceId?: string }) => {
        if (e.sourceId === "satellit" && map.isSourceLoaded("satellit")) {
          map.off("sourcedata", onSource);
          map.once("render", () => performance.mark("wm-globe-sichtbar"));
        }
      };
      map.on("sourcedata", onSource);

      try {
        const topo = (await import("world-atlas/countries-50m.json")).default as unknown as Topology;
        if (cancelled) return;
        map.addSource("laender", { type: "geojson", data: countriesFromTopology(topo) as never });
        map.addSource("grenzen", { type: "geojson", data: borderLinesFromTopology(topo) as never });
        // Für Klicks auf Länder: praktisch unsichtbare Fläche (Deckkraft 0,01)
        map.addLayer({ id: "laender-flaeche", type: "fill", source: "laender", paint: { "fill-color": "#ffffff", "fill-opacity": 0.01 } });
        map.addLayer({
          id: "laender-grenze",
          type: "line",
          source: "grenzen",
          paint: { "line-color": "#F2F5F8", "line-opacity": 0.2, "line-width": ["interpolate", ["linear"], ["zoom"], 1, 0.4, 5, 1] },
        });
        map.addLayer({
          id: "laender-auswahl",
          type: "fill",
          source: "laender",
          filter: ["==", ["get", "name"], countryRef.current ?? ""],
          paint: { "fill-color": "#F2F5F8", "fill-opacity": 0.16 },
        });
        map.on("click", "laender-flaeche", (e) => {
          const props = e.features?.[0]?.properties;
          if (typeof props?.name === "string") cb.current.onSelectCountry(props.name, String(props.id ?? ""));
        });
        map.on("mouseenter", "laender-flaeche", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "laender-flaeche", () => (map.getCanvas().style.cursor = ""));
        map.once("idle", () => performance.mark("wm-laender-fertig"));
      } catch (e) {
        if (!cancelled) cb.current.onError(String(e instanceof Error ? e.message : e));
      }
    });

    // Fenstergröße ändert sich: Kartengröße nachziehen.
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);

    return () => {
      cancelled = true;
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markers.current.clear();
    };
  }, []);

  // Marker als Knöpfe mit Zahl (Daten kommen später als die Karte). Liegen Marker auf dem Bildschirm zu dicht beieinander
  // (Abstand unter GRUPPEN_ABSTAND Pixel, nur Vorderseite), werden sie zu einer Gruppe mit Zahl zusammengefasst:
  // Klick öffnet eine Liste der enthaltenen Meldungen (Zeile wählt die Meldung; bei mehreren Ländern auch „Hineinzoomen").
  const regroupRef = useRef<(() => void) | null>(null);
  const selectedRef = useRef<number | null>(null);
  selectedRef.current = selectedNr;
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const items: { p: MarkerData; marker: Marker; el: HTMLButtonElement }[] = [];
    for (const p of markerData) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `wm-marker wm-marker--${p.tier}`;
      b.textContent = String(p.nr);
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", `Meldung ${p.nr}, ${TIER_LABEL[p.tier]}: ${p.label}`);
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        cb.current.onSelectPoint(p.nr);
      });
      items.push({ p, marker: new Marker({ element: b, anchor: "center", opacityWhenCovered: "0" }).setLngLat([p.lon, p.lat]).addTo(map), el: b });
      markers.current.set(p.nr, b);
    }
    let gruppen: Marker[] = [];
    const rad = Math.PI / 180;
    // Liste der Meldungen einer Gruppe: Klick auf eine Zeile wählt die Meldung, bei mehreren Ländern zusätzlich „Hineinzoomen"
    let liste: HTMLDivElement | null = null;
    const schliesseListe = () => { liste?.remove(); liste = null; };
    const zeigeListe = (knopf: HTMLElement, mitglieder: MarkerData[], mitte: [number, number], zoomen: boolean) => {
      schliesseListe();
      const box = map.getContainer(), kb = knopf.getBoundingClientRect(), bb = box.getBoundingClientRect();
      const d = document.createElement("div");
      d.className = "wm-gruppenliste";
      d.setAttribute("role", "dialog");
      d.setAttribute("aria-label", "Meldungen in dieser Gruppe");
      d.addEventListener("click", (e) => e.stopPropagation());
      for (const m of mitglieder) {
        const z = document.createElement("button");
        z.type = "button";
        z.innerHTML = "<b></b><span></span>";
        z.firstElementChild!.textContent = String(m.nr);
        z.lastElementChild!.textContent = m.label;
        z.addEventListener("click", () => { schliesseListe(); cb.current.onSelectPoint(m.nr); });
        d.appendChild(z);
      }
      if (zoomen) {
        const z = document.createElement("button");
        z.type = "button";
        z.className = "wm-gruppenliste-zoom";
        z.textContent = "Hineinzoomen";
        z.addEventListener("click", () => { schliesseListe(); map.easeTo({ center: mitte, zoom: Math.min(limitZoom.current, map.getZoom() + 1.5), duration: 800 }); });
        d.appendChild(z);
      }
      box.appendChild(d);
      const w = d.offsetWidth, h = d.offsetHeight;
      const x = Math.max(8, Math.min(bb.width - w - 8, kb.left - bb.left + kb.width / 2 - w / 2));
      const unten = kb.bottom - bb.top + 10, oben = kb.top - bb.top - 10 - h;
      d.style.left = `${x}px`;
      d.style.top = `${Math.max(8, unten + h <= bb.height - 8 ? unten : oben)}px`;
      liste = d;
      (d.querySelector("button") as HTMLElement | null)?.focus();
    };
    const taste = (e: KeyboardEvent) => { if (e.key === "Escape") schliesseListe(); };
    document.addEventListener("keydown", taste);
    map.on("click", schliesseListe);
    map.on("movestart", schliesseListe);
    const regroup = () => {
      schliesseListe();
      for (const g of gruppen) g.remove();
      gruppen = [];
      const c = map.getCenter();
      const vorne = (lon: number, lat: number) => Math.acos(Math.max(-1, Math.min(1, Math.sin(c.lat * rad) * Math.sin(lat * rad) + Math.cos(c.lat * rad) * Math.cos(lat * rad) * Math.cos((lon - c.lng) * rad)))) / rad < 70;
      const pos = items.map((i) => (vorne(i.p.lon, i.p.lat) ? map.project([i.p.lon, i.p.lat]) : null));
      const used = new Set<number>();
      for (let i = 0; i < items.length; i++) {
        items[i].el.style.display = "";
      }
      for (let i = 0; i < items.length; i++) {
        const pi = pos[i];
        if (used.has(i) || !pi) continue;
        const mem = [i];
        for (let j = i + 1; j < items.length; j++) { const pj = pos[j]; if (!used.has(j) && pj && Math.hypot(pi.x - pj.x, pi.y - pj.y) < (gruppieren ? GRUPPEN_ABSTAND : 0)) mem.push(j); }
        if (mem.length < 2) continue;
        mem.forEach((k) => { used.add(k); items[k].el.style.display = "none"; });
        const lon = mem.reduce((a, k) => a + items[k].p.lon, 0) / mem.length, lat = mem.reduce((a, k) => a + items[k].p.lat, 0) / mem.length;
        const nrs = mem.map((k) => items[k].p.nr), isos = new Set(mem.map((k) => items[k].p.iso));
        // Gruppe = Pillenform mit den enthaltenen Rängen („1 · 2"), damit sie nicht wie ein Rang-Marker aussieht
        const rang = [...nrs].sort((a, b) => a - b);
        const g = document.createElement("button");
        g.type = "button";
        g.className = "wm-marker wm-marker--gruppe";
        g.textContent = rang.length <= 3 ? rang.join(" · ") : `${rang.slice(0, 2).join(" · ")} +${rang.length - 2}`;
        g.setAttribute("aria-pressed", String(nrs.includes(selectedRef.current ?? -1)));
        g.setAttribute("aria-label", `Gruppe aus ${mem.length} Meldungen (Rang ${rang.join(", ")}); Klick zeigt die Liste`);
        g.addEventListener("click", (e) => {
          e.stopPropagation();
          zeigeListe(g, mem.map((k) => items[k].p).sort((a, b) => a.nr - b.nr), [lon, lat], isos.size > 1);
        });
        gruppen.push(new Marker({ element: g, anchor: "center", opacityWhenCovered: "0" }).setLngLat([lon, lat]).addTo(map));
      }
    };
    regroupRef.current = regroup;
    regroup();
    map.on("moveend", regroup);
    map.on("zoomend", regroup);
    return () => {
      map.off("moveend", regroup);
      map.off("zoomend", regroup);
      map.off("click", schliesseListe);
      map.off("movestart", schliesseListe);
      document.removeEventListener("keydown", taste);
      schliesseListe();
      regroupRef.current = null;
      for (const g of gruppen) g.remove();
      for (const i of items) i.marker.remove();
      markers.current.clear();
    };
  }, [markerData, gruppieren]);

  // Auswahl von Punkt und Land nachführen
  useEffect(() => {
    for (const [nr, b] of markers.current) b.setAttribute("aria-pressed", String(nr === selectedNr));
    regroupRef.current?.();
  }, [selectedNr, markerData]);
  useEffect(() => {
    const map = mapRef.current;
    if (map?.getLayer("laender-auswahl")) map.setFilter("laender-auswahl", ["==", ["get", "name"], selectedCountry ?? ""]);
  }, [selectedCountry]);

  // Freier Bereich ändert sich (Detailpanel oder Sheet): Globus sanft in die neue Mitte schieben; steht die Ansicht noch auf
  // der Startzoomstufe, wird der Zoom so angepasst, dass der ganze Globus weiter in den freien Bereich passt.
  const firstPadding = useRef(true);
  useEffect(() => {
    if (firstPadding.current) {
      firstPadding.current = false;
      return;
    }
    const map = mapRef.current;
    const el = mapEl.current;
    if (!map || !el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const atBase = Math.abs(map.getZoom() - baseZoom.current) < 0.05;
    const fit = fitZoom(el, padding);
    baseZoom.current = fit;
    setzeGrenze(map);
    map.easeTo({ padding, zoom: atBase ? fit : map.getZoom(), duration: reduce ? 0 : 350 });
  }, [padding.top, padding.bottom, padding.left, padding.right]); // eslint-disable-line react-hooks/exhaustive-deps

  // Kamerafahrt von außen (Liste, Marker, Chips): kurzer Weg um den Globus, 1,3 s
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !view) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur = map.getCenter().lng;
    let lon = view.lon;
    while (lon - cur > 180) lon -= 360;
    while (lon - cur < -180) lon += 360;
    // padding mitgeben: ein gleichzeitig ausgelöster Paddingwechsel (Detail-Sheet) würde sonst von dieser Fahrt abgebrochen
    map.easeTo({ center: [lon, view.lat], zoom: Math.min(limitZoom.current, baseZoom.current + view.dz), padding: paddingRef.current, duration: reduce ? 0 : 1300 });
  }, [view]);

  // maplibre-gl.css setzt für .maplibregl-map selbst position: relative; darum steht die Fläche in einer eigenen absoluten Hülle.
  return (
    <div className="absolute inset-0">
      <div ref={mapEl} className="h-full w-full" role="region" aria-label="Globus mit Meldungen" />
      {glow && <div ref={glowEl} className="wm-glow pointer-events-none absolute inset-0" aria-hidden="true" />}
    </div>
  );
}

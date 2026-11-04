// Landesmittelpunkte und Ausdehnung aus den lokalen Grenzdaten (world-atlas, 50m): größtes Polygon eines Landes,
// Schwerpunkt als Flächenmittel in Länge/Breite (für die Suche und die Kamerafahrt genau genug, kein Kartenwerkzeug).
import { countriesFromTopology, type Topology } from "./topo";

export type Centroid = { id: string; name: string; lon: number; lat: number; span: number };

type Ring = [number, number][];
function ringStats(r: Ring) {
  let a = 0, cx = 0, cy = 0, minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < r.length - 1; i++) {
    const [x0, y0] = r[i], [x1, y1] = r[i + 1];
    const f = x0 * y1 - x1 * y0;
    a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
  }
  for (const [x, y] of r) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  a /= 2;
  const mid: [number, number] = [(minX + maxX) / 2, (minY + maxY) / 2];
  return { area: Math.abs(a), lon: a ? cx / (6 * a) : mid[0], lat: a ? cy / (6 * a) : mid[1], span: Math.max(maxX - minX, (maxY - minY) * 1.2) };
}

let promise: Promise<Map<string, Centroid>> | null = null;
export function ladeMittelpunkte(): Promise<Map<string, Centroid>> {
  promise ??= import("world-atlas/countries-50m.json").then((m) => {
    const fc = countriesFromTopology(m.default as unknown as Topology);
    const out = new Map<string, Centroid>();
    for (const f of fc.features) {
      const id = String(f.properties.id ?? "");
      if (!id) continue;
      const polys = (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates) as Ring[][];
      let best: ReturnType<typeof ringStats> | null = null;
      for (const p of polys) { const s = ringStats(p[0]); if (!best || s.area > best.area) best = s; }
      if (best) out.set(id, { id, name: String(f.properties.name), lon: best.lon, lat: best.lat, span: best.span });
    }
    return out;
  });
  return promise;
}

// Zoomzuschlag auf die Startzoomstufe: kleine Länder näher heran, große kaum
export const dzFuerSpanne = (span: number) => Math.max(0.6, Math.min(4, Math.log2(110 / Math.max(span, 0.5))));

// Minimaler TopoJSON-Leser (nur Polygon/MultiPolygon), damit für world-atlas kein weiteres Paket nötig ist.
type Position = [number, number];

type TopoGeometry = { type: string; id?: string; arcs?: number[][] | number[][][]; properties?: Record<string, unknown> };

export type Topology = {
  arcs: number[][][];
  transform?: { scale: [number, number]; translate: [number, number] };
  objects: Record<string, { geometries: TopoGeometry[] }>;
};

export type CountryCollection = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: { type: "Polygon" | "MultiPolygon"; coordinates: Position[][] | Position[][][] };
  }[];
};

function decodeArcs(topo: Topology): Position[][] {
  const { scale, translate } = topo.transform ?? { scale: [1, 1], translate: [0, 0] };
  return topo.arcs.map((arc) => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]) => {
      x += dx;
      y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]] as Position;
    });
  });
}

export function countriesFromTopology(topo: Topology, objectName = "countries"): CountryCollection {
  const arcs = decodeArcs(topo);
  const ring = (indices: number[]): Position[] => {
    const out: Position[] = [];
    for (const i of indices) {
      const pts = i < 0 ? [...arcs[~i]].reverse() : arcs[i];
      out.push(...(out.length ? pts.slice(1) : pts));
    }
    return out;
  };
  const features: CountryCollection["features"] = [];
  for (const g of topo.objects[objectName].geometries) {
    if (g.type === "Polygon") {
      features.push({
        type: "Feature",
        properties: { ...(g.properties ?? {}), id: g.id },
        geometry: { type: "Polygon", coordinates: (g.arcs as number[][]).map(ring) },
      });
    } else if (g.type === "MultiPolygon") {
      features.push({
        type: "Feature",
        properties: { ...(g.properties ?? {}), id: g.id },
        geometry: { type: "MultiPolygon", coordinates: (g.arcs as number[][][]).map((p) => p.map(ring)) },
      });
    }
  }
  return { type: "FeatureCollection", features };
}

// Nur Grenzen zwischen zwei Ländern (Bögen, die von mindestens zwei Ländern genutzt werden). Küstenlinien entfallen,
// die Landfläche zeichnet sie selbst; so entstehen auch keine Linien an Rändern, an denen Flächen geschnitten wurden.
export function borderLinesFromTopology(topo: Topology, objectName = "countries") {
  const arcs = decodeArcs(topo);
  const owners = new Map<number, Set<number>>();
  topo.objects[objectName].geometries.forEach((g, gi) => {
    const rings = g.type === "Polygon" ? (g.arcs as number[][]) : g.type === "MultiPolygon" ? (g.arcs as number[][][]).flat() : [];
    for (const r of rings) for (const i of r) {
      const k = i < 0 ? ~i : i;
      if (!owners.has(k)) owners.set(k, new Set());
      owners.get(k)!.add(gi);
    }
  });
  const coordinates: Position[][] = [];
  for (const [k, set] of owners) if (set.size > 1) coordinates.push(arcs[k]);
  return {
    type: "FeatureCollection" as const,
    features: [{ type: "Feature" as const, properties: {}, geometry: { type: "MultiLineString" as const, coordinates } }],
  };
}

// Stufen und Lagen für die Oberfläche. Rang und Medienzahl der Meldungen kommen aus public/data/world.json (siehe laender.ts).
// Die Stufe steht für Farbe und Größe des Punktes und immer auch als Text; sie ist keine Wertung der Quelle.
export type Tier = "top" | "wichtig" | "rand";

export const TIER_LABEL: Record<Tier, string> = { top: "Top", wichtig: "Wichtig", rand: "Am Rande" };
export const TIER_TEXT_CLASS: Record<Tier, string> = {
  top: "text-top-text",
  wichtig: "text-wichtig-text",
  rand: "text-rand",
};
export const TIER_BG_CLASS: Record<Tier, string> = { top: "bg-top", wichtig: "bg-wichtig", rand: "bg-rand" };
export const TIERS: Tier[] = ["top", "wichtig", "rand"];

// Rang 1 bis 3 Top, 4 bis 6 Wichtig, 7 und 8 Am Rande
export const tierOfRank = (rank: number): Tier => (rank <= 3 ? "top" : rank <= 6 ? "wichtig" : "rand");

// Startblickrichtung: Europa und Nahost mittig
export const START = { lon: 5, lat: 26 };

// Lagen: Mittelpunkt und Zoom als Zuschlag (dz) auf die Start-Zoomstufe; `laender` sind ISO-Codes der beteiligten Länder.
export type Lage = { id: string; name: string; region: string; lon: number; lat: number; dz: number; laender: string[] };
export const LAGEN: Lage[] = [
  { id: "iran", name: "Iran · USA · Israel", region: "Nahost", lon: 45, lat: 31, dz: 1.8, laender: ["IR", "US", "IL"] },
  { id: "ru-ua", name: "Russland · Ukraine", region: "Osteuropa", lon: 34, lat: 49, dz: 1.9, laender: ["RU", "UA"] },
  { id: "cn-tw", name: "China · Taiwan", region: "Ostasien", lon: 113, lat: 32, dz: 1.5, laender: ["CN", "TW"] },
  { id: "kp-kr", name: "Nord · Südkorea", region: "Koreanische Halbinsel", lon: 127.5, lat: 37.5, dz: 2.8, laender: ["KP", "KR"] },
];

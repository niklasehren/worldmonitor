// Themenfilter-Varianten (A = GDELT-Themenkürzel, B = Suchbegriffe), je Sprache.
// Kürzel stammen aus LOOKUP-GKGTHEMES.TXT (geprüft, dass sie existieren).
export const TOPICS = [
  { key: "konflikte", name: "Konflikte",
    A: "theme:ARMEDCONFLICT",
    B: { english: "(war OR attack OR fighting OR offensive)", german: "(Krieg OR Angriff OR Gefechte OR Offensive)" } },
  { key: "diplomatie", name: "Diplomatie",
    A: "(theme:NEGOTIATIONS OR theme:CEASEFIRE)",
    B: { english: "(diplomacy OR diplomatic OR \"peace talks\" OR summit)", german: "(Diplomatie OR diplomatisch OR Friedensgespräche OR Gipfeltreffen)" } },
  { key: "sanktionen", name: "Sanktionen",
    A: "theme:SANCTIONS",
    B: { english: "(sanctions OR embargo)", german: "(Sanktionen OR Embargo)" } },
  { key: "wahlen", name: "Wahlen und Regierungswechsel",
    A: "(theme:ELECTION OR theme:RESIGNATION)",
    B: { english: "(election OR coup OR resigns OR \"new government\")", german: "(Wahl OR Putsch OR Rücktritt OR Regierungsbildung)" } },
  { key: "energie", name: "Energie und Rohstoffe",
    A: "(theme:ENV_OIL OR theme:ENV_NATURALGAS OR theme:ENV_COAL)",
    B: { english: "(oil OR \"natural gas\" OR \"energy prices\" OR lithium)", german: "(Öl OR Erdgas OR Energiepreise OR Rohstoffe)" } },
  { key: "maerkte", name: "Märkte und Wirtschaft",
    A: "(theme:ECON_CENTRALBANK OR theme:ECON_STOCKMARKET OR theme:ECON_GOLDPRICE OR theme:ECON_INTEREST_RATES)",
    B: { english: "(\"central bank\" OR \"stock market\" OR gold OR \"interest rates\")", german: "(Notenbank OR Börse OR Goldpreis OR Leitzins)" } },
];
export const LANGS = ["english", "german"];
export const DOC = "https://api.gdeltproject.org/api/v2/doc/doc";
export const GEO = "https://api.gdeltproject.org/api/v2/geo/geo";
export const q = (query, lang) => `${query} sourcelang:${lang}`;
export const docUrl = (query, lang, extra = {}) => {
  const p = new URLSearchParams({ query: q(query, lang), format: "json", ...extra });
  return `${DOC}?${p.toString()}`;
};

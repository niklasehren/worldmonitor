// Bewertung der Themen-Stichprobe: Einschätzung des Modells (nur nach Titel). P = passt, N = passt nicht, U = unklar.
import { readFileSync, writeFileSync } from "node:fs";
import { DATA } from "./lib.mjs";
import { join } from "node:path";
import { sample } from "./load.mjs";
const J = {
  konflikte:  "NNNNUNUUNNNUNNNNNNPN",
  diplomatie: "NUNPUUUPPPNUNNNNUNPU",
  sanktionen: "UUNNUNUUUNNUNNNUNUUN",
  wahlen:     "PPPPPPNNPNNPPPPPPNPP",
  energie:    "UNPPPNPNNPNNNNNNPNUN",
  maerkte:    "PNPNNPNPPUPUNPPPUPNP",
};
const S = JSON.parse(readFileSync(join(DATA, "topic-sample.json"), "utf8"));
const out = {}; let seed = 500;
for (const [k, labels] of Object.entries(J)) {
  if (labels.length !== S[k].length) throw new Error("Länge passt nicht: " + k);
  const c = { P: 0, N: 0, U: 0 }; [...labels].forEach((l) => c[l]++);
  const rows = S[k].map((x, i) => ({ ...x, urteil: labels[i] }));
  out[k] = { passt: c.P, passtNicht: c.N, unklar: c.U, kontrolle5: sample(rows, 5, seed++).map((r) => ({ titel: r.titel, domain: r.domain, sprache: r.lang, urteil: { P: "passt", N: "passt nicht", U: "unklar" }[r.urteil] })) };
}
writeFileSync(join(DATA, "topic-judgment.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, `${v.passt} passt / ${v.unklar} unklar / ${v.passtNicht} passt nicht`])), null, 1));

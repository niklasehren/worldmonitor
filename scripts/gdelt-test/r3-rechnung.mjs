// Runde 3, Aufgabe 7: Laufzeit-/Minutenrechnung (Annahmen siehe docs/gdelt-test-runde3.md, Abschnitt 7). Kein Netzwerk.
const mb = { ex: 0.065, me: 0.091, gkg: 3.938, tex: 0.046, tme: 0.058, tgkg: 8.085 }, sPerMB = 0.62, pause = 5;
const V = { "a ohne gkg (en)": ["ex", "me"], "a mit gkg (en)": ["ex", "me", "gkg"], "b ohne gkg (en+Übersetzung)": ["ex", "me", "tex", "tme"], "b mit gkg (en+Übersetzung+gkg)": ["ex", "me", "gkg", "tex", "tme", "tgkg"] };
for (const setup of [30, 45, 60]) { console.log("\nStartzeit", setup, "s");
  for (const [name, f] of Object.entries(V)) for (const takt of [60, 30, 15]) {
    const slots = takt / 15, files = f.length * slots + 1, MB = f.reduce((a, k) => a + mb[k], 0) * slots, sec = files * pause + MB * sPerMB + setup, runs = 30 * 24 * 60 / takt, billed = Math.ceil(sec / 60);
    console.log(name.padEnd(34), "Takt", takt, "Dateien", files, "MB/Lauf", MB.toFixed(1), "Sek", sec.toFixed(0), "Läufe/Monat", runs, "Min/Monat gerundet", runs * billed, `(${(runs * billed / 20).toFixed(0)} % von 2000)`, "ungerundet", (runs * sec / 60).toFixed(0)); } }

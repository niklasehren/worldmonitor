# Übergabe WORLDMONITOR (Stand 04.11.2026, nach C2)

Kurzübergabe für eine neue Sitzung ohne den bisherigen Verlauf. Kennzeichnung: **gemessen** = gezählt oder nachgemessen, **Einschätzung** = Urteil von Claude an Stichproben, **Annahme** = nicht geprüft. Alles Weitere steht in `docs/entscheidungen.md`, `DESIGN.md` und den lokalen Berichten `docs/bericht-*.md` (absichtlich nicht im Git).

## 1. Ziel und Vorgaben
- Persönliches, **vollautomatisches Weltportal** (Globus plus Panels): ernstes Briefing zu Krieg, Politik, Katastrophen, Wirtschaft, internationaler Lage. **Kein** Lokalkrimi, Lifestyle, Sport, Unterhaltung, Krypto-Kurs.
- Länder (später Regionen, Städte) anklickbar mit Neuigkeiten und Fakten; vier Lagen als Einstieg (Iran · USA · Israel, Russland · Ukraine, China · Taiwan, Nord · Südkorea).
- **Kein Geld, keine Konten ohne OK.** Hauptsprache Deutsch, Titel im Original. Stack: Next.js 16, TypeScript, Tailwind v4, MapLibre GL 6.15.0 (Globus), world-atlas 2.0.2 (Grenzen), GDELT-Dateien als Datenquelle.
- Der Nutzer hat keinen Entwickler-Hintergrund: Fachbegriffe kurz erklären, Schritte einzeln, **vor Installationen fragen**.

## 2. Entscheidungen (Stand `docs/entscheidungen.md` plus spätere Beschlüsse)
- Weltübersicht: Rang nach **roher Medienzahl** (verschiedene Domains), **ohne Länderfaktoren**.
- **Eilmeldung** weggelassen. Themenliste und Städte später, nicht im MVP.
- Kern: Länder-, Regions- und Lagenseiten; obere Schicht „Heute wichtig" automatisch aus dem GDELT-Rang.
- **„Briefing-Schicht" gestrichen:** kein Import aus einem Morgen-Briefing, kein täglicher Datei-Import.
- **Keine Datenbank im MVP:** Daten sind erzeugte JSON-Dateien (`public/data/`), Erzeugung per Skript aus dem GDELT-Cache.
- **Repo öffentlich**, Ziel `https://github.com/niklasehren/worldmonitor.git` (`origin` ist gesetzt; **noch nicht gepusht**, Push nur durch den Nutzer; der Verlauf wurde am 04.11.2026 auf **einen Commit** reduziert, Sicherung des vollen Verlaufs lokal unter `data/backup/`).
- Datenquelle: nur Datei-Downloads von `data.gdeltproject.org`; DOC-/GEO-API nicht im MVP (beide Retests HTTP 429).
- **Krypto:** Hacks und Diebstähle (Sicherheit, Sanktionen) **bleiben**, **reine Kursmeldungen fliegen raus** (`rettung`-Liste in `config/ausschluss.json`).
- Ernst-Filter ohne Personennamen und ohne mehrdeutige Einzelwörter; GKG-Themen ausgeschaltet (an Tag 1/2 mehrfach falsch).
- Grafik: Satellitentextur (NASA Blue Marble plus Nachtlichter), Glas-Panels, Stufen Top rot, Wichtig blau, Am Rande grau, Schriften Inter und JetBrains Mono; Test-Schalter statt Entscheidung bei Glas, Leuchtrand, Textur.
- Offen und nicht beschlossen: Takt (60 oder 120 Min.), Gewichtskandidat gegen Zeitungsketten, Themenklassifikation, Übersetzung, Gratis-Limits von GitHub/Vercel/Supabase, Regionen und Städte.

## 3. Was gebaut ist (die folgenden Commits B2 bis E2 sind nach der Kürzung nur noch in der lokalen Sicherung)
| Commit | Inhalt |
|---|---|
| `9d3e7f0`, `e4d3cea` | Globus-Prototyp (MapLibre, world-atlas), Design v2 mit NASA-Textur |
| `21c2ef0` B2 | Startansicht, Kamerafahrten, Marker nur bei echter Rückseite ausgeblendet, Handy-Sheets |
| `f7f86e4` B3 | Rechtes Panel eingeklappt, Atmosphärenrand aus der Kamera, Nachtlichter, dunkleres Glas |
| `f9a5691` C1 | Länderdateien aus dem Cache, Fußzeile einzeilig, Quellenfenster, Texturumschalter |
| `e76e791` D1 | Länderpanel mit Reitern, Suche, Stand aus den Daten, Schalter `?glas=0 ?rand=0 ?textur=2048`, Schriftlizenzen |
| `0ec0f51` E1 | Dubletten zusammenfassen, Ernst-Filter, Länderzuordnung nach Titel, `build-data.mjs`, Pipeline in `scripts/lib` |
| `c48bdb4` E2 | Ruhiges Layout (Top 3 plus „Weitere 5"), Reiter Lage/News/Fakten, Fakten aus Wikidata (CC0), Zoomgrenze |
| (einziger Commit) | Verlauf vor dem ersten Push gekürzt. Stand enthält zusätzlich C2: Top 8 höchstens 2 je Land, Marker-Gruppen, Krypto-Regel, Pipeline für GitHub Actions (nur lokal getestet), Ausfall-Hinweis, `.env.example` |
- **Oberfläche (E2):** links „Heute wichtig" (Top 3 groß mit Rubrik, Titel bis 2 Zeilen, „N Medien · vor X Std.", Balken; „Weitere 5" einzeilig; höchstens 60 % Fensterhöhe; einklappbar). Rechts Länderpanel (Lage, News, Fakten; Konfliktmarke „Konfliktberichte erhöht" ab Verhältnis 2 zum Median bei mindestens 100 Ereignissen). Kopfzeile: Suche, Datenstand, Weltuhren. Unten Lagen-Chips, Fußzeile (Stand, Quellen). Handy: Bottom-Sheet mit denselben Zeilen.
- **Daten:** `node scripts/build-data.mjs` (einige Minuten, nur Cache) erzeugt `public/data/world.json` (Top 8, nicht im Git), `world.sample.json` (im Git, Etikett „Beispieldaten"), 211 Länderdateien in `public/data/countries/` (im Git nur DE, UA, IR, MA, KN und `index.json`), `data/world.json`. `node scripts/build-facts.mjs` erzeugt `public/data/facts.json` aus `data/fakten/wikidata-laender.json` (einmalig geladen).
- Pipeline (`scripts/lib/pipeline.mjs`): Geschichten je Adresse, Zusammenfassen nach IDF-gewichteter Titelüberlappung (0,5), Medienzahl = verschiedene Domains, Ernst-Filter (`config/ausschluss.json`), Land im Titel/Adresse sonst GDELT-Ereignisort (höchstens zwei), Geschichten ohne lesbaren Text nie anzeigen, Titel aus Adresse mit großem Anfangszeichen.
- Läuft lokal: `npm run build` und `npx next start -p 3100` (Produktion), `npm run dev` auf Port 3000.

## 4. Wichtigste Messwerte
| Ergebnis | Belastbarkeit |
|---|---|
| Cache: 29.10. 04:30 bis 01.11.2026 04:15 UTC (71,75 h), 296.447 Ereignisse, 36.582 Geschichten im 48-h-Fenster; **kein Vorfenster-Vergleich möglich** (bräuchte 96 h) | gemessen |
| Dubletten: 3 falsche von 40 zusammengeführten Paaren (7,5 %, Intervall 3–20 %) | Einschätzung, Tag 3 |
| Ernst-Filter: zu Recht ausgeschlossen an Einstelltagen 87,5 % (n 80), an unberührtem Tag 3 92,5 % (n 40); **26–30 % der behaltenen Einträge bleiben nicht ernst** | Einschätzung, kleine Stichproben |
| Länderzuordnung: vorher 77 %, nachher 91 % richtig (n 35) | Einschätzung |
| Gewichtskandidaten (roh, log, Herkunftsländer, Familien, kombi): keiner klar besser, **keine Entscheidung** | Einschätzung, 3 Tage |
| Titel: gkg-Titel nur für etwa ein Viertel der Geschichten im Cache (nur 56 Zeitpunkte geladen); rund 20 % der Pool-Geschichten ohne lesbaren Text, in der Top 10 fällt 0–1 Eintrag aus | gemessen |
| Fakten: 255 Länder, 47 KB; fehlend Hauptstadt 14, Einwohner 11, Fläche 3, Sprachen 8, Währung 7, Region 4 | gemessen, Werte ungeprüft |
| Globus sichtbar: Desktop 1,9–2,2 s (E2), Handy-Emulation 1,5 s; Bildrate ca. 60/s; Texturen 1,15 MB (4096) und 0,37 MB (2048) | gemessen, Chrome mit GPU |
| Zoom: Pixel je Grad = 1,581 · 2^zoom; Obergrenze bei 0,5 Texel je Gerätepixel: 4,14 (dpr 1), 3,14 (dpr 2), Handy knapp über Start | gemessen/Rechnung |
| Kontrast: alle gemessenen Text-/Untergrundpaare ≥ 4,5:1 (D1, E2) | gemessen |
| Konfliktanzeiger: Rangkorrelation der Hälften 0,38; taugt als grobe Stufe, nicht als Zahl | gemessen/Einschätzung |

## 5. Offene Punkte
- **Länderzuordnung** bleibt fehlerbehaftet (Ereignisort oft falsch, Demonyme zählen nicht, kurze Titel ohne Landesnamen).
- **Titel aus Adressen:** Adressreste, die wie Wörter aussehen („Redding Chico Eureka"), gelten als lesbar; Titelabdeckung steigt erst mit vollständig geladenen gkg-Dateien (ca. 840 MB für 48 h, Schätzung).
- **US-Übergewicht:** viele US-Lokal- und Wahlmeldungen in den Top-Listen; Ernst-Filter lässt Promi-/Musikmeldungen ohne Kategoriewort durch.
- **Marker-Gruppen (C2):** Marker unter 34 px Abstand werden zu einer Gruppe mit Zahl zusammengefasst (Klick: Zoom oder Land öffnen); Schalter `?gruppen=0`.
- **Pipeline (C2):** Workflow `.github/workflows/daten.yml` (stündlich, Zustand im Actions-Cache, Ausgabe im Zweig `data`) ist vorbereitet, aber **nie in Actions gelaufen**; Takt, Ort von Zustand/Ausgabe und Datenleser sind Vorschläge (`docs/pipeline.md`). Beschlossen: Takt 60 Minuten, Zustand im Actions-Cache, Ausgabe im Zweig `data`, Seite liest von `raw.githubusercontent.com`. Nächster Schritt: erster Push (Zweig `main`), dann Workflow einmal von Hand starten.
- Wortzerlegung (Apostroph: „O'Neill" gegen „oneill"), kurze Meldungen mit nur einem gemeinsamen Namen werden nicht zusammengefasst.
- Länder erscheinen durch die Zoomgrenze kleiner; größere Textur wäre die Option (nicht entschieden).
- Fakten (Wikidata): Qualität nicht geprüft, Iran ohne Einwohnerzahl, Sprachbezeichnungen teils sperrig. Fenster 768–1279 px und echte Geräte nicht gemessen.
- **Safari:** Früher gemeldeter Absturz („Seite neu geladen"); der Nutzer hat die Seite inzwischen **auf Port 3100 (Produktions-Build) ohne Absturz** benutzt. Ursache nicht isoliert; Schalter `?glas=0 ?rand=0 ?textur=2048` stehen bereit.
- Daten werden nur von Hand erneuert (kein Holer, kein Zeitplan); Konten, Hosting und Takt offen.

## 6. Dateiübersicht
| Pfad | Inhalt |
|---|---|
| `PLAN.md` | Plan v6 (**nur auf ausdrücklichen Auftrag ändern**) |
| `DESIGN.md`, `docs/design-v1.md` | Design v2 mit Layouts, Zoomrechnung, Nutzungsbedingungen NASA; altes Design |
| `app/`, `components/` | Next.js-Seite; `Briefing.tsx` (Layout), `Globe.tsx` (Karte, Zoomgrenze), `Header.tsx` (Suche), `Quellen.tsx`, `laender.ts` (Lader), `centroids.ts`, `globe-data.ts`, `topo.ts` |
| `design/` | Tokens (`tokens-v2.css`), Schriften, `screens/` und `referenz/` (nicht im Git) |
| `config/ausschluss.json`, `config/anzeige.json`, `config/gdelt-laender.txt`, `config/weights.json` | Ernst-Filter; Anzeige-Regeln (Top 8 je Land); GDELT-Länderliste; Länderfaktoren (nicht mehr benutzt) |
| `scripts/build-data.mjs`, `scripts/build-facts.mjs`, `scripts/lib/{pipeline,pipeline-cache,ausgabe}.mjs`, `scripts/pipeline/{lauf,zustand}.mjs`, `scripts/pipeline/veroeffentlichen.sh`, `.github/workflows/daten.yml` | Datenerzeugung (Cache-Modus und Actions-Pipeline), siehe `docs/pipeline.md` |
| `scripts/globe-textur.mjs` | Texturrechnung aus NASA-Rohdateien (nur Node und Chrome) |
| `scripts/gdelt-test/*.mjs` | Test-Skripte (Runde 1–4, `e1-*.mjs` für E1) |
| `public/data/`, `public/globe/`, `public/licenses/`, `public/maplibre/` | Daten, Texturen, Lizenztexte, Worker-Kopien |
| `docs/entscheidungen.md`, `docs/mvp-vorschlag.md`, `docs/plan-vorschlaege.md`, `docs/gdelt-test*.md` | Entscheidungen, Entwürfe, Testberichte |
| `docs/bericht-b1.md` bis `bericht-e2.md` | Aufgabenberichte (**nicht im Git**, lokal) |
| `data/` (**nicht im Git**) | GDELT-Cache `data/gdelt-test/` (ca. 580 MB), NASA-Rohdateien, Wikidata-Rohdatei, Messergebnisse |

## 7. Regeln für Claude Code
- **Grenzen:** Netz nur, wenn die Aufgabe es ausdrücklich erlaubt (GDELT-Dateien nur von `data.gdeltproject.org`, https zuerst, ≥ 5 s Pause); nichts installieren ohne Rückfrage, kein sudo, nichts außerhalb von `~/worldmonitor`, **kein Push**, keine Kosten, keine Konten.
- **Nie ändern/ausgeben:** `PLAN.md` nur auf Auftrag; `DESIGN.md` nur im Rahmen einer Aufgabe; `data/` und `.env*` nie in Git; vor Löschen oder Überschreiben fragen (erzeugte Datenausgaben des Skripts ausgenommen).
- **Git:** Identität nur lokal (`git config --local`); Commit-Text endet mit `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`; Berichte `docs/bericht-*.md` nicht committen; Screenshots nur in `design/screens/`.
- **Arbeitsweise:** Antworten auf Deutsch, Fachbegriffe kurz erklären; **nie Zahlen oder Quellen erfinden**; jedes Ergebnis mit „gemessen", „Einschätzung" oder „Annahme" kennzeichnen; keine Entscheidungen für den Nutzer (messen, vergleichen, berichten); vertrauliche Unterlagen nie an externe Dienste; bei Unklarheit die vorsichtigere Variante wählen und im Bericht vermerken.
- **Berichte:** Bericht in `docs/bericht-<aufgabe>.md`, im Terminal nur eine Kurzfassung (meist höchstens 10 Zeilen) mit Pfad. Regeln fairer Messung: einstellen an zwei Tagen, prüfen am dritten.

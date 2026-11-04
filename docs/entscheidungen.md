# Entscheidungsvorlage WORLDMONITOR

Stand: 01.11.2026. Grundlage: `docs/gdelt-test.md` (Runde 1), `docs/gdelt-test-runde2.md` (Runde 2), `docs/plan-vorschlaege.md`. `PLAN.md` ist unverändert. Keine neuen Downloads oder Tests für diese Vorlage. **Mit Ausnahme des Abschnitts „Beschlossen (03.11.2026)" ist nichts hier entschieden, die Empfehlungen sind meine Einschätzung.**

Kennzeichnung: **gemessen** = aus den Daten gezählt; **Einschätzung** = mein Urteil nach Titel (nicht belastbar wie eine Messung); **Annahme** = vermutet, nicht geprüft.

**Gemeinsame Einschränkung für alles unten:** Der Test deckt nur 3 Tage ab (29.10. 04:30 bis 01.11.2026 04:15 UTC, Donnerstag bis Sonntag, mit Wochenende). Die DOC-API und die GEO-API wurden nicht getestet (HTTP 429, evtl. Netz). Titel gab es nur für ca. 60 Zeitpunkte, Stichproben (n=20) sind klein, die Urteile sind von mir und nicht von einer zweiten Person gegengeprüft.

## Beschlossen (03.11.2026, vom Nutzer)

- **Weltübersicht:** Rang nach roher Medienzahl, **ohne Länderfaktoren**.
- **Eilmeldung:** wird weggelassen (nicht in V1).
- **Themenliste und Städte:** später, nicht im MVP.
- **Kern:** Länder-, Regions- und Lagenseiten; die obere Schicht („Heute wichtig") kommt automatisch aus dem GDELT-Rang (rohe Medienzahl).
- **„Briefing-Schicht" ist gestrichen (Änderung 03.11.2026):** Das Portal ist unabhängig vom Morgen-Briefing und läuft vollautomatisch. Es gibt keinen Import aus dem Morgen-Briefing und keinen täglichen Datei-Import; die obere Schicht wird automatisch aus GDELT erzeugt.
- **Repo:** öffentlich.
- **Datenquelle:** DOC-/GEO-API nicht im MVP, nur Datei-Downloads von `data.gdeltproject.org` (Grundlage: DOC-API-Retest 03.11.2026, beide Anfragen HTTP 429, siehe `docs/gdelt-test-status.md`).

## Beschlossen (04.11.2026, vom Nutzer, nachgetragen aus `docs/UEBERGABE.md`)

- **Keine Datenbank im MVP:** Die Oberfläche liest erzeugte JSON-Dateien (Datendatei-Lösung); Supabase o. ä. entfällt vorerst.
- **Datendatei:** `world.json` (Top 8, Länderliste, Lagen) und je Land eine Datei `countries/<ISO>.json`, erzeugt aus den GDELT-Dateien; Fakten (`facts.json`) einmalig aus Wikidata (CC0).
- **Repo öffentlich**, Ziel `https://github.com/niklasehren/worldmonitor.git`. Erster Push erst nach der Prüfung auf persönliche Daten (siehe `docs/bericht-c2.md`) und nach ausdrücklichem OK.
- **Krypto:** Hacks und Diebstähle (Sicherheit, Sanktionen) bleiben in den Listen, **reine Kursmeldungen fliegen raus** (Regel `krypto_kurs` in `config/ausschluss.json`, Rettungsliste für Hack-Wörter).
- **Top 8: höchstens 2 Meldungen je Land** (`config/anzeige.json`, `maxProLandTop8`); die nächste rückt nach. Land = erstes Land der Geschichte; Meldungen ohne Land sind nicht begrenzt.
- Ernst-Filter ohne Personennamen und ohne mehrdeutige Einzelwörter; GKG-Themen für den Filter ausgeschaltet.
- **Pipeline (Beschluss 04.11.2026):** Takt **60 Minuten** (GitHub Actions, `.github/workflows/daten.yml`); Zustand im **Actions-Cache**; Ausgabe im Zweig **`data`**, bei jedem Lauf zu einem einzigen Commit überschrieben (keine wachsende Historie); die Seite lädt die Daten von `raw.githubusercontent.com` (`NEXT_PUBLIC_DATA_BASE`). Sind die Daten nicht erreichbar, zeigt die Seite die Beispieldatei mit deutlichem Hinweis, ohne Absturz.
- **Verlauf:** vor dem ersten Push auf einen einzigen frischen Commit reduziert; vollständige Sicherung als lokale `git bundle`-Datei unter `data/backup/` (nicht versioniert).
- Weiter offen: Gewichtskandidat gegen Zeitungsketten.

## Beschlossen (04.11.2026, vom Nutzer, nach F1)

- **Schlagzeilen bleiben in der Originalsprache, keine maschinelle Übersetzung.** Der Übersetzungstest (F2-Idee) entfällt; die Messung aus F1 (OPUS-MT en-de: 20 % gut, 48 % brauchbar, 33 % sinnentstellend, Einschätzung, n 40) bleibt in `docs/bericht-f1.md`. Im Panel steht der Hinweis „Schlagzeilen in Originalsprache" bzw. „Headlines in original language".
- **Oberfläche zweisprachig (Deutsch, Englisch):** Sprache aus `navigator.languages` (erste Sprache der Liste, die Deutsch oder Englisch ist, sonst Englisch); Umschalter DE/EN im Kopf, Wahl im Browser gemerkt (localStorage, mit Ausfallschutz); `?lang=de` und `?lang=en` in der Adresse gehen vor und werden beim Umschalten nachgeführt; das `lang`-Attribut der Seite folgt. Alle Oberflächentexte stehen in `components/i18n/de.ts` und `en.ts`. Länder-, Sprach- und Währungsnamen über `Intl.DisplayNames`, Zahlen über `Intl.NumberFormat`, Zeiten über `Intl.DateTimeFormat`, „vor X Std." über `Intl.RelativeTimeFormat`; kein neues Paket.
- **Fakten:** Hauptstädte deutsch und englisch aus Wikidata (CC0, eine zusätzliche Abfrage am 04.11.2026, `data/fakten/q2.rq`); Sprachen und Währungen als ISO-Codes, Kontinente als Schlüssel. Die Daten selbst (Ländernamen in `world.json`, Titel) bleiben unverändert.

Noch offen (nicht beschlossen): Takt (60 oder 120 Min.), Titel-Schwelle, Lagen-Liste und Stichwörter, Gratis-Limits von GitHub/Supabase/Vercel. `PLAN.md` ist weiterhin unverändert; Änderungen dort erst nach ausdrücklichem OK.

Hinweis: Die Abschnitte unten sind der Stand vom 01.11.2026 und werden durch diese Beschlüsse in den genannten Punkten überholt (Punkt 3 Länderfaktoren, Punkt 4 Eilmeldung, Punkt 1 DOC-API).

## Überblick

| Punkt | Stand des Tests | Belastbarkeit | Wichtigste offene Entscheidung |
|---|---|---|---|
| 1 Feed | machbar ohne DOC-API | mittel | Quelle: gkg-Dateien oder DOC-API (nach Netzwechsel) |
| 2 Themen | Titelwort verbessert stark, Sanktionen ungelöst | gering bis mittel | Methode je Thema, Umgang mit Sanktionen |
| 3 Weltübersicht (Ranking) | Zusammenfassen nötig, Faktoren wirken stark | mittel (nur 4 Zeitpunkte) | Rohwert oder log, Länderfaktoren, Regionale Spitze |
| 4 Eilmeldung | Fehlalarm zu hoch | gering (n=2 bis 20) | Regel, Schwelle, ob überhaupt in V1 |
| 5 Land | häufigstes gkg-Land am treffendsten | gering (n=27) | Länderquelle |
| 6 Lagen | Paar plus Stichwort brauchbar | gering bis mittel (n=20 je Lage) | Ob und mit welcher Regel |
| 7 Takt | Dateien erscheinen früh, Rechnung zur Wartezeit | mittel | Abrufintervall |
| 8 Datenvolumen | 439 MB für 3 Tage Cache | mittel | Übersetzungsstrom ja/nein |

---

## 1. Feed (Artikelliste ohne DOC-API)

**Optionen**
- A. Feed aus den gkg-Dateien (Titel, Adresse, Domain, Themen, Orte), selbst gefiltert.
- B. Feed aus der DOC-API (fertige Themenabfragen), falls sie aus einem anderen Netz funktioniert.
- C. Kombination: gkg als Grundlage, DOC später als Ergänzung.

**Gemessen**
- gkg-Zeilen haben Domain, Adresse und Titel (721 von 722 im ersten Zeitpunkt; 14.535 Artikel in 5 Zeitpunkten). Themenkürzel bei 84 % (gkg) bzw. 91 % (translation.gkg), Ort bei 75 % bzw. 82 %.
- Verbindung Ereignis ↔ Artikel über die Adresse: 4.490 von 4.498 (99,8 %) in 5 Zeitpunkten.
- Sprache nur in `translation.gkg` (`srclc:xxx`); Titel sind HTML-kodiert und müssen umgewandelt werden.
- Ein 60-Minuten-Lauf würde 4 Zeitpunkte mal 2 Dateien laden, je nach Tageszeit ca. 20 bis 75 MB (Rechnung aus gemessenen Größen).
- DOC-API: 21 Anfragen, fast alle HTTP 429. **Nicht getestet.** `doc-retest.mjs` liegt bereit (max. 12 Anfragen).

**Belastbarkeit:** Feldabdeckung und Verbindung sind gemessen (n groß, aber nur 5 Zeitpunkte für gkg). Qualität des Feeds hängt an den Themen (Punkt 2). Laufzeit in GitHub Actions nicht gemessen.

**Offen:** DOC-API aus anderem Netz; ob die Ortsangabe aus gkg als Land taugt (Punkt 5); Laufzeit des Holers; Sprache der unübersetzten Titel (Annahme: Englisch).

## 2. Themen (Konflikte, Diplomatie, Sanktionen, Wahlen, Energie, Märkte)

**Optionen je Thema**
- M1 nur Themenkürzel. M2 Kürzel plus Stichwort im Titel. M3 Kürzel mit mindestens 3 Vorkommen im Artikel. M4 Ereigniscodes (nur für Konflikte, Diplomatie, Sanktionen getestet).
- Zusatzoption: Thema entfällt oder wird nur als Stichwortliste geführt.

**Gemessen/Einschätzung (Anteil "passt nicht" in 20 zufälligen Treffern, Einschätzung):**

| Thema | M1 | M2 | M3 | M4 |
|---|---|---|---|---|
| Konflikte | 60 % | **25 %** | 40 % | 70 % |
| Diplomatie | 70 % | **27 %** (n=15) | 53 % (n=19) | 70 % |
| Sanktionen | 75 % | n=1 | n=4 | 90 % |
| Wahlen | 40 % | **5 %** | **5 %** (n=19) | nicht getestet |
| Energie | 70 % | **5 %** | 50 % | nicht getestet |
| Märkte | 20 % | **5 %** | **5 %** (n=19) | nicht getestet |

- Mehrfachzuordnung (gemessen): M1 25 % der Artikel mit Thema haben mehr als eines, M2 3 %, M3 6 %.
- Nur Titelwort liefert bei Sanktionen fast keine Treffer in der Stichprobe (n=1).

**Belastbarkeit:** gering bis mittel. Pro Zelle 20 Treffer (teils weniger), Urteile von mir nach Titel, Stichwortlisten von mir gewählt (Annahme), Grundgesamtheit 5 Haupt-Zeitpunkte, nur Deutsch und Englisch. Fehlerquoten ohne Stichprobenfehler: bei n=20 liegt ein Wert von 25 % grob zwischen 10 und 50 %.

**Offen:** Stichwortlisten (deutsch/englisch, Pflege); Sanktionen (keine Methode taugt); ob Märkte-Treffer (viele Einzelaktien-Artikel) gewünscht sind; DOC-Variante nie getestet; Themenzuordnung für nicht-englische Titel.

## 3. Weltübersicht (Ranking der Top-Meldungen)

**Optionen**
- Wert: roher M (Anzahl Erwähnungen) oder log(1+M).
- Länderfaktoren: weit 1,0/1,5/2,0 oder eng 1,0/1,25/1,5.
- Mit oder ohne "Regionale Spitze" (je Weltregion die Geschichte mit höchstem M, ohne Länderfaktor, 7 Regionen = 7 Plätze).
- Zusammenfassen: nach Adresse (gemessen wirksam), zusätzlich nach Titelähnlichkeit (Schwelle 0,8, unvollständig).

**Gemessen (4 Zeitpunkte)**
- Alte Top 20 (Ereignisebene): 7 bis 13 verschiedene Geschichten. Neue Top 20 (Geschichtenebene): immer 20 verschiedene Adressen.
- Basisländer in der Top 20 im Mittel: roh/weit/ohne 1,75; roh/eng/ohne 2,5; log ohne Regionale Spitze 1,5; mit Regionaler Spitze 4,0 bis 4,5.
- Länderstufe "erhöht": in allen 32 Listen 0 Plätze. "Hoch": 13 bis 19 von 20.
- Auch nach Zusammenfassen stehen gleiche Meldungen mit anderem Wortlaut mehrfach (Frankreich-Proteste dreimal in einer Liste).
- Die Zahl "Quellen" im Blatt ist die Summe der Erwähnungen, nicht verschiedene Medien (Annahme: Medien können mehrfach zählen).
- Regionale Spitzen (04:15): teils Randthemen (Guyana-Besuch von König Charles, Palestine Action in London).

**Belastbarkeit:** mittel für die Zählungen (gemessen, aber nur 4 Zeitpunkte, ein Wochenverlauf fehlt). **Keine Messung zur Qualität:** Ob Liste A (roh) oder B (log) besser wirkt, ist **Ihr Urteil** am verdeckten Blatt (`docs/gdelt-test-ranking-blind-2.md`, Schlüssel erst danach öffnen). Ich habe nichts bewertet.

**Offen:** Ihr Urteil am Blatt; stärkere Zusammenfassung; Regionendefinition (Annahmen: Türkei = Naher Osten, Russland = Europa); Faktor des Themas und Altersabschlag (Halbwertszeit 12 Stunden) wurden nicht neu getestet; ob Regionale Spitze 7 Plätze belegen soll.

## 4. Eilmeldung

**Optionen**
- V0 alle Codes 18–20, mindestens 2 Medien in 60 Minuten (wie bisher, aber auf Geschichten).
- A5/A10: mindestens 5 bzw. 10 Medien.
- B: nur Waffen-/Luftangriff-/Massengewalt-Codes. C: nur bewaffnete/staatliche Akteure. D1: B und C. D3: B und C mit mindestens 5 Medien.
- Keine Eilmeldung in V1.

**Gemessen/Einschätzung**

| Variante | pro Tag | Fehlalarm (N) | N+U | n |
|---|---|---|---|---|
| Runde 1, Ereignisebene | 551 | 70 % | | 20 |
| V0 Geschichten | 277 | 75 % | 80 % | 20 |
| A5 | 57 | 70 % | 80 % | 20 |
| A10 | 22 | 72 % | 83 % | 18 |
| B | 74 | 65 % | 80 % | 20 |
| C | 64 | 40 % | 65 % | 20 |
| D1 | 17 | 36 % | 55 % | **11** |
| D3 | 4 | 33 % | 67 % | **3** |
| D4 | 4 | 100 % | 100 % | **2** |

- D1 hat in 3 Tagen 17 Basisland-Geschichten (≈ 5,7/Tag), 26 "hoch", 2 "erhöht", 6 ohne Land (gemessen).
- Fehlalarme sind meist Kriminalität, Sport, Lokales (Code 193 bei Hackerangriff und bei Theater-Gedenken).
- Medienzahl allein (A5, A10) senkt den Fehlalarm nicht (Einschätzung, Stichprobe).
- Akteursfelder sind bei ca. 6.500 von ca. 18.000 schweren Ereignissen leer (gemessen); die Typ-Liste (inkl. UAF) ist meine Annahme.
- Geschwindigkeit (Runde 1, gemessen): erste Meldung bis zweites Medium Median 15 Minuten, 90-%-Wert 60 Minuten. Mit Abruf alle 60 Minuten sichtbar typisch 45 bis 75 Minuten nach Erfassung (Rechnung).

**Belastbarkeit:** gering. Die Stichproben von D1, D3, D4 sind zu klein für eine Rate (n=11, 3, 2). Ob eine Meldung "P" ist, ist mein Urteil. Die Varianten wurden auf derselben Stichprobe verglichen und gewählt (Gefahr, dass D1 auf Zufall beruht).

**Offen:** Größere Stichprobe (mehr Titel nötig); Schwelle; ob Waffenverkäufe/Ankündigungen ausgeschlossen werden; Verhalten bei Nachtstunden und Wochentagen; ob Eilmeldung in V1 überhaupt sinnvoll ist, solange der Fehlalarm über 30 % liegt (Ihre Entscheidung).

## 5. Land einer Geschichte

**Optionen**
- Aktionsland (bisher). Land Akteur 1. Erstes gkg-Land. Häufigstes gkg-Land. Kombination (z. B. Aktionsland, bei Abweichung gkg).

**Gemessen/Einschätzung (30 Geschichten, 3 unklare ausgenommen, n=27):**

| Variante | offensichtlich falsch |
|---|---|
| Aktionsland | 4 von 27 (15 %) |
| Akteur 1 | 2 von 22 mit Wert (9 %), 5 leer |
| gkg erstes Land | 4 von 27 (15 %) |
| gkg häufigstes Land | 1 von 27 (4 %) |

**Belastbarkeit:** gering. n=27, ein Urteil von mir, "offensichtlich falsch" ist nach Titel entschieden. Der Unterschied zwischen 1 und 4 Fällen ist statistisch nicht abgesichert. gkg-Land gibt es nur für Geschichten mit gkg-Eintrag.

**Offen:** größere Stichprobe; Umgang mit Geschichten, die mehrere Länder betreffen; Länderzuordnung für "ohne Land" (2,7 % der Ereignisse); Slowakei (`LO`) und Palästina (`GZ`, `WE`) bleiben Annahmen in `config/weights.json`.

## 6. Lagen (eigene Seite je Lage)

**Optionen**
- Nur Länderpaar. Länderpaar plus Stichwort im Titel (Vorschlag). Zusätzlich Stichwortlisten ohne Länderpaar. Funktion nicht in V1.
- Konfliktskala (Goldstein): weglassen, nur als Tagesmittel, oder stündlich.

**Gemessen (3 Tage)**
- Beide Länder sind bei 173.539 von 296.447 Ereignissen gesetzt (58 %), mit verschiedenen Ländern bei 43.238 (15 %).
- Ereignisse/Geschichten pro Tag: USA–Iran 442 / 170, Russland–Ukraine 768 / 241, China–Taiwan 32 / 18, Israel–Gaza/Libanon 164 / 61, USA–China 213 / 82.
- Titelabdeckung nur 9 bis 22 % der Geschichten (sonst Stichwortsuche in der Adresse).
- Verlauf pro Stunde: USA–Iran und Russland–Ukraine alle 73 Stunden belegt; China–Taiwan nur 30 von 73.
- Goldstein-Skala: Streuung 3,4 bis 6,5 Punkte, stündliche Mittel von −10 bis +7; Russland–Ukraine Mittel 0,07.

**Einschätzung (je 20 Treffer: G/U/N)**

| Lage | nur Paar | Paar + Stichwort |
|---|---|---|
| USA–Iran | 7/6/7 | 16/4/0 |
| Russland–Ukraine | 8/6/6 | 13/6/1 |
| China–Taiwan | 5/8/7 | 14/1/5 |
| Israel–Gaza/Libanon | 14/5/1 | 19/1/0 |
| USA–China | 6/6/8 | 15/2/3 |

**Belastbarkeit:** gering bis mittel. n=20 je Zelle, mein Urteil, ein Teil der Treffer ist ohne lesbaren Titel (ca. 31 von 100 "unklar" bei nur Paar), Stichwortlisten von mir gewählt. Die Skala ist maschinell berechnet und nicht validiert.

**Offen:** Pflege der Stichwörter; Mehrfachzuordnung; China–Taiwan zu dünn für Stundenverlauf (Tageswerte); Format (`config/lagen.json`, Seite `/lagen`) steht als Vorschlag in `docs/plan-vorschlaege.md`; ob Goldstein überhaupt gezeigt wird.

## 7. Takt (Abrufintervall)

**Optionen:** alle 15, 30 oder 60 Minuten (GDELT-Raster 15 Minuten); getrennt je Funktion (Eilmeldung schneller als Weltübersicht) möglich.

**Gemessen**
- Neue Dateien erscheinen vor dem Zeitstempel im Namen: Median −7,9 Minuten, größter Wert −2,0 (7 Messungen, 01.11. 13:30 bis 15:20 UTC). Keine Verzögerung nach dem Zeitstempel gemessen.
- Erste Meldung bis zweites Medium: Median 15 Minuten (grob, Raster 15).
- Wartezeit bis zum nächsten Lauf (Rechnung): im Mittel 30 / 15 / 7,5 Minuten bei 60 / 30 / 15 Minuten Takt.

**Belastbarkeit:** mittel für die Dateiverfügbarkeit (n=7, ein Nachmittag, Sonntag), die Wartezeit ist Rechnung. **Nicht gemessen:** Laufzeit und Pünktlichkeit von GitHub-Actions-Läufen (Annahme: Läufe können sich verspäten, nicht geprüft), Anzeige-Verzögerung.

**Offen:** Takt je Funktion; Kosten/Limits der Actions bei 15 Minuten (Repo privat, Minutenkontingent nicht geprüft); Ruhe nachts.

## 8. Datenvolumen

**Optionen**
- Nur unübersetzter Strom (export, mentions, gkg). Zusätzlich Übersetzungsstrom (translation.export/mentions, translation.gkg). gkg nur für ausgewählte Zeitpunkte statt immer.

**Gemessen**
- Dateipaar export+mentions: 87 KB gezippt um 03:00 UTC; Ereignisse je Zeitpunkt 342 bis 2.398 (Median 1.000).
- gkg plus translation.gkg: 4,8 MB (Nacht) bis 18,5 MB (Freitag 14:00 UTC) je Zeitpunkt.
- translation.export und translation.mentions: Hochrechnung ca. 11 (Mittel) bis 19 MB (Obergrenze) pro Tag. **translation.gkg** (Einzeldateien 6,9 bis 13,2 MB gezippt) wurde nicht auf einen Tag hochgerechnet; Einschätzung: bei 96 Zeitpunkten wäre das im Bereich von gut 0,6 bis 1,2 GB pro Tag, das ist eine Rechnung aus 4 Messwerten.
- Rohdaten im Test: ca. 439 MB für 3 Tage plus gkg-Auswahl und Teil der Übersetzungsdateien.
- Der Übersetzungsstrom ist ähnlich groß wie der unübersetzte: 33.970 Ereignisse in 59 Zeitpunkten gegenüber ca. 60.700 im unübersetzten Strom im selben Zeitraum (Rechnung); Brasilien 902 Ereignisse, aber unter den Auslösern nicht in den Top 12.

**Belastbarkeit:** mittel für Dateigrößen (Messungen), gering für Tageshochrechnung der Übersetzungs-gkg. Der Download des Übersetzungstages brach bei 59 von 96 Zeitpunkten ab (selbst gesetzte Anfragen-Obergrenze 800).

**Offen:** Was Vercel Hobby, Supabase Free und GitHub Actions bei dauerhaftem Betrieb vertragen (Speicher, Minuten, Laufzeit) wurde **nicht geprüft**; Speicherdauer (nur Verdichtetes oder auch Rohartikel); ob der Übersetzungsstrom die Top 20 oder die Auslöser verändert (nicht gemessen); GDELT-Nutzungsbedingungen für dauerhaften Abruf nicht neu geprüft.

---

## Reihenfolge, in der ich entscheiden würde (Einschätzung)

1. Ranking-Blatt beurteilen (Punkt 3), weil es die Basis für Weltübersicht und Eilmeldung ist.
2. Themenmethode je Thema festlegen (Punkt 2), Sanktionen ausklammern oder zurückstellen.
3. Netzwechsel und DOC-API-Test (Punkt 1) vor der Entscheidung für gkg oder DOC.
4. Eilmeldung nur nach größerer Stichprobe (Punkt 4), sonst aus V1 herausnehmen.
5. Land, Lagen, Takt und Volumen danach.

Nichts davon ist beschlossen. Nach Ihrer Entscheidung würde ich die Änderungen in `PLAN.md` vorschlagen und erst nach Ihrem OK einarbeiten.

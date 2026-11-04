# MVP-Vorschlag WORLDMONITOR (Entwurf, nichts davon ist beschlossen)

Stand: 01.11.2026. Reiner Text auf Basis der Messungen in `docs/gdelt-test.md`, `docs/gdelt-test-runde2.md`, `docs/gdelt-test-runde3.md`. Es wurde nichts angelegt oder ausgeführt, `PLAN.md` und `DESIGN.md` sind unverändert. Alle Zahlen: **gemessen**, **Einschätzung** (mein Urteil) oder **Annahme**, wie in den Berichten. Jeder Punkt ist ein Vorschlag zur Entscheidung durch Sie.

**Gemeinsamer Vorbehalt:** Der Test deckt nur 3 Tage (Do bis So, 29.10. bis 01.11.2026) ab. Die DOC-API und die GEO-API wurden nie erfolgreich getestet. Stichproben sind klein (n = 11 bis 41), alle Urteile sind von mir.

## 1. Startumfang in einem Satz

Eine Seite mit **Weltübersicht** (Top 20 Geschichten plus Block „Regionale Spitzen"), **fünf Lagen** (je eine Seite), **fünf Themen** als Filter und den sechs Uhren; Datenquelle sind die 15-Minuten-Dateien von GDELT (englisch/unübersetzt), stündlich abgeholt. **Keine Eilmeldung in der Anzeige.**

## 2. Quellen

**Vorschlag:** `export`, `mentions` und `gkg` (unübersetzter Strom) von `data.gdeltproject.org`, jeweils alle 4 Zeitpunkte pro Stundenlauf. Kein DOC-API, keine Übersetzungsdateien.

| Begründung (Messwert) | |
|---|---|
| Ereignis ↔ Artikel über die Adresse verbunden | 99,8 % (4.490 von 4.498, gemessen) |
| gkg liefert Titel, Domain, Adresse, Themenkürzel (84 %), Ort (75 %) | gemessen, 5 Zeitpunkte |
| Titel nur über gkg: Ein Artikel steht in der gkg des Zeitpunkts, in dem sein Ereignis erfasst wurde. Lässt man 3 von 4 gkg-Zeitpunkten aus, fehlen für ca. 75 % der Geschichten die Titel | Annahme (aus Stichproben: Titelabdeckung 9–25 %, wenn nur ein Teil der Zeitpunkte geladen ist) |
| Dateigrößen: export 0,065 MB, mentions 0,091 MB, gkg 3,94 MB je Zeitpunkt | gemessen |
| Übersetzungs-gkg 8,1 MB je Zeitpunkt (n = 5), 776 MB/Tag | gemessen/Hochrechnung; sprengt das Minutenbudget (144 %) |
| Der Übersetzungsstrom ist ähnlich groß wie der unübersetzte (33.970 Ereignisse in 59 Zeitpunkten) und enthält z. B. Brasilien (902 Ereignisse) | gemessen; ohne ihn fehlen früh gemeldete nicht-englische Quellen |

**Offene Risiken:**
- Ohne Übersetzungsstrom fehlt ein großer Teil der Weltmeldungen (z. B. Spanisch, Russisch, Arabisch). Das ist **eine bewusste Lücke** und muss in der Oberfläche stehen („nur englisch/unübersetzte Quellen").
- Minutenbudget (siehe Abschnitt 8) ist bei gkg knapp.
- Die Dateien erscheinen früh (Median −7,9 Minuten vor dem Zeitstempel, n = 7), der Abruf kann also pünktlich sein; Pünktlichkeit von GitHub-Läufen ist nicht gemessen.

## 3. Themen

**Vorschlag:** Wahlen, Energie, Märkte, Konflikte, Diplomatie; Methode **Themenkürzel plus Stichwort im Titel** (M2). **Sanktionen** nicht als eigenes Thema, sondern als Unterpunkt von Diplomatie mit Stichwortliste.

| Thema | Fehlerquote „passt nicht" (Stichprobe n = 20, Einschätzung) |
|---|---|
| Wahlen | 5 % |
| Energie | 5 % |
| Märkte | 5 % (aber ca. 50 % davon Einzelaktien-Meldungen, nach Filter 20 %, Filter verliert ca. 15 % echter Marktmeldungen) |
| Konflikte | 25 % |
| Diplomatie | 27 % (n = 15) |
| Sanktionen (Stichwort) | 30 % falsch; als Unterpunkt von Diplomatie 1 von 9 falsch (n = 9, nicht abgesichert) |
| zum Vergleich: nur Kürzel | 20–75 % |

**Begründung:** Nur Kürzel ist deutlich schlechter. Ereigniscodes sind für Konflikte und Diplomatie nicht besser (70 %), für Sanktionen kaum brauchbar (90 %). Mehrfachzuordnung: 3 % bei M2.
**Offene Risiken:** Stichproben von 20 haben Intervalle von grob ±20 Prozentpunkten. Stichwortlisten sind von mir (Deutsch/Englisch) und müssen gepflegt werden. Titel-Stichwort funktioniert nur, wenn ein Titel da ist. Strom-/Wassertarife und Boykott-Meldungen verwässern „Sanktionen" (Regel nicht getestet). Märkte: Entscheidung, ob Einzelaktien gewünscht sind.

## 4. Weltübersicht

**Vorschlag:**
- Geschichte = gleiche normierte Adresse; danach Titelähnlichkeit zusammenfassen, **Startwert 0,5 bis 0,6** (einstellbar in `config/`).
- Rang = Zahl verschiedener Medien × Länderfaktor × Alterungsabschlag (Halbwertszeit 12 Stunden), wie `config/weights.json`.
- Ein getrennter Block **„Regionale Spitzen"** (je Weltregion die Geschichte mit den meisten Medien, ohne Länderfaktor, 7 Regionen), damit Basisländer sichtbar bleiben.
- Titel bereinigen (Seitenname entfernen, HTML dekodieren), ca. 2 % der Titel verwerfen (zu kurz, Slogan, nur Großbuchstaben, allgemeine Seite).

| Begründung (Messwert) | |
|---|---|
| Alte Top 20 auf Ereignisebene: nur 7–13 verschiedene Geschichten, auf Geschichtenebene immer 20 | gemessen |
| Titelähnlichkeit 0,5 bis 0,8: 0 falsche Zusammenführungen von 40 beurteilten (Intervall bis 9 %); bei 0,5 aber ca. 5 überzählige Doppelungen in der Top 20, bei 0,8 ca. 7 | gemessen/Einschätzung, Pool nur 150 Geschichten |
| Länderfaktoren ersetzen im Mittel 3,2 von 20 Plätzen; Basisländer 1,3 mit / 2,2 ohne Faktoren; Gewinner UK, USA | gemessen (11 volle Zeitpunkte) |
| Stufe „erhöht" ändert höchstens 1 Platz an 3 von 12 Zeitpunkten | gemessen |
| Mit Regionaler Spitze 4 bis 4,5 Basisländer in der Top 20 statt 1,5 bis 2,5 | gemessen (Runde 2) |
| Titel: 10,3 % mit Seitenname, 1,9 % zu verwerfen | gemessen |

**Offene Risiken:**
- **Ihr Urteil am verdeckten Blatt** (`docs/gdelt-test-ranking-blind-2.md`) steht aus: roh gegen log(1+M) ist unentschieden.
- Doppelungen bleiben auch bei niedriger Schwelle (anderer Wortlaut, Blickwinkel); Eigennamen-Vergleich brachte keinen messbaren Unterschied (kaum Titel).
- „Erhöht" wirkt kaum: Stufe weglassen oder neu justieren ist eine Entscheidung.
- Regionale Spitzen enthalten Randthemen (Guyana-Besuch, Palestine Action in London); die Regionendefinition ist eine Annahme.
- Basis: nur Do–So, kein Wochenverlauf.

## 5. Lagen

**Vorschlag:** Fünf Lagen (USA–Iran, Russland–Ukraine, China–Taiwan, Israel–Gaza/Libanon, USA–China), Regel **Länderpaar (beide Richtungen) und Stichwort**, Wortlisten aus `docs/gdelt-test-runde3.md` Abschnitt 6, Konfiguration in `config/lagen.json` (siehe `docs/plan-vorschlaege.md`). Verlauf als Geschichten pro Stunde, bei China–Taiwan **pro Tag**. Konflikt-Kooperations-Skala (Goldstein) **nicht in V1**.

| Lage | Geschichten/Tag (nur Paar, 3 Tage) | Paar + Stichwort G/U/N je 20 (Prüfmenge, Einschätzung) |
|---|---|---|
| USA–Iran | 170 | 18/2/0 |
| Russland–Ukraine | 241 | 20/0/0 |
| China–Taiwan | 18 | 11/0/0 (nur 11 Fälle, 19 in 3 Tagen) |
| Israel–Gaza/Libanon | 61 | 16/3/1 |
| USA–China | 82 | 18/2/0 |

**Begründung:** Stichwort allein ersetzt das Paar nicht (nur 7–13 von 20 passend, Überlappung der Mengen 21–55 %); Paar allein ist in Runde 2 zu unscharf (5–14 von 20). Stundenverlauf: USA–Iran und Russland–Ukraine alle 73 Stunden belegt, China–Taiwan nur 30 von 73. Goldstein: Streuung 3,4–6,5 Punkte, stündliche Mittel −10 bis +7, Russland–Ukraine im Mittel 0,07 (bildet die Kriegslage nicht ab).
**Offene Risiken:** Nur 58 % der Ereignisse haben beide Länder, 15 % mit verschiedenen Ländern: Lagen sind immer ein Ausschnitt. Wortlisten wurden an den Fehlern der Vorrunde angepasst (kleines Risiko der Überanpassung). China–Taiwan ist dünn (eine Geschichte dominierte die 3 Tage). Mehrfachzuordnung einer Geschichte zu mehreren Lagen nicht gemessen.

## 6. Was bewusst nicht in Version 1 kommt

| Funktion | Begründung | Wiedervorlage |
|---|---|---|
| **Eilmeldung in der Anzeige** | Beste Variante D1 mit Ausschlussliste: 13 Auslöser/Tag, Fehlalarm 15 % (5–36 %), 55 % „falsch oder unklar" (n = 20); Prüfmenge klein, viele Geschichten ohne lesbaren Text | nach größerer Stichprobe; vorher **Schattenbetrieb** (berechnen und speichern, nicht anzeigen) |
| Übersetzungsstrom | 144 % des Minutenbudgets (mit gkg), 776 MB/Tag | nach Messung der echten Laufzeit |
| DOC-API, GEO-API/Karte | nie erfolgreich getestet (429, dann Timeout) | nach Netz-Test |
| Sanktionen als eigenes Thema | 30 % falsch, nur 66 Treffer/Tag mit Kürzel+Stichwort | als Unterpunkt Diplomatie |
| Konflikt-Kooperations-Skala | stündlich zu verrauscht, nicht validiert | optional als Tagesmittel, klar „maschinell berechnet" |
| Märkte-Kurse, Live-Cams, DeepL (Phase 2) | wie in `PLAN.md` | nach Version 1 |
| Land aus gkg statt Aktionsland | nur 27 Stichproben (4 % gegen 15 % falsch) | größere Stichprobe |

## 7. Laufzeit und Minutenbudget (Annahmen!)

Rechnung `scripts/gdelt-test/r3-rechnung.mjs` (Pause 5 s je Datei, 0,62 s/MB aus dem Protokoll, Start-/Schreibzeit 30–60 s nicht gemessen, Aufrundung je Lauf auf ganze Minuten laut Annahme in `PLAN.md`, Guthaben ca. 2.000 Minuten laut `PLAN.md`, **keine aktuellen Preise geprüft**):

| Variante (stündlich, 4 Zeitpunkte) | Minuten/Monat |
|---|---|
| nur export + mentions | 1.440 (72 %) |
| **Vorschlag: export + mentions + gkg** | **1.440 bei 30 s, 2.160 bei 45–60 s Startzeit (108 %)** |
| plus Übersetzung ohne gkg | 1.440 bis 2.160 |
| plus Übersetzung mit gkg | 2.880 (144 %) |
| Rückfall: alle 2 Stunden, 8 Zeitpunkte, mit gkg (nach demselben Modell, nicht in der Tabelle des Berichts) | ca. 1.440 (360 Läufe × 4 Min.) |

**Offenes Risiko:** Der Vorschlag liegt je nach unbekannter Startzeit zwischen 72 % und 108 % des Guthabens. Erst die Messung der ersten echten Läufe entscheidet; Rückfall: 2-Stunden-Takt oder gkg-Anteil reduzieren (kostet Titel).

## 8. Datenbankentwurf (nur Text, nichts angelegt)

Grundlage für Mengen (gemessen, 3 Tage): 99.160 Ereignisse/Tag; Geschichten pro Tag mit mindestens 2 / 3 / 5 / 10 Medien: 5.877 / 3.396 / 1.874 / 915; Quellenzeilen (Geschichte × Domain) dazu 46.867 / 41.906 / 36.791 / 30.620 pro Tag. Annahme: Speicherung ab **3 Medien** (spätere Auslöser-Regel nutzt 2 Medien; dafür siehe Schattentabelle).

**Tabelle `laeufe`:** `id`, `gestartet_um`, `zeitpunkte` (Liste der 15-Minuten-Zeitpunkte), `dateien_ok`, `dateien_fehlend`, `status`, `dauer_sekunden`. Aufbewahrung 90 Tage. Zweck: „Stand: <letzter erfolgreicher Abruf>" und Laufzeitmessung.

**Tabelle `geschichten`** (Schlüssel `url_norm`): `url_norm`, `url_original`, `domain`, `titel` (bereinigt), `titel_roh`, `sprache`, `erste_meldung`, `letzte_meldung`, `land_haupt` (FIPS), `laender` (Zähler je Land), `region`, `themen` (Liste), `quellen` (Liste verschiedener Domains), `medienzahl`, `schwere_codes` (Liste der Ereigniscodes 18–20), `akteurtypen`, `titel_verworfen` (ja/nein mit Grund). Aufbewahrung **14 Tage** (wie `PLAN.md`). Zeilen: ca. 3.400 × 14 ≈ 48.000. Die Domain-Liste steckt in der Zeile selbst, damit überlappende Läufe (90-Minuten-Fenster) die Medienzahl ohne Doppelzählung aktualisieren können.
**Tabelle `lagen_treffer`:** `lage_id`, `url_norm`, `regel` (Paar / Paar+Stichwort), `zeitpunkt`. Wird je Lauf aus `config/lagen.json` berechnet. 14 Tage.
**Tabelle `zaehlwerte`:** `zeitpunkt`, `land`, `thema`, `geschichten`, `medien`. **90 Tage** (wie `PLAN.md`), für Verlauf und Normalwerte; auch je Lage tägliche Werte.
**Tabelle `regionale_spitzen`:** `zeitpunkt`, `region`, `url_norm`, `medienzahl` (Verlauf der Spitzenmeldung je Region, optional, 14 Tage).
**Tabelle `eilmeldung_schatten`:** `url_norm`, `variante` (B/C/D1), `ausgeloest_um`, `medien_in_60_min`, `ausschlussliste_treffer` (ja/nein), `spaeter_beurteilt` (leer; Ihr Urteil oder meines). Aufbewahrung 90 Tage; nicht angezeigt; liefert die größere Stichprobe.
**Konfigurationsdateien (nicht in der Datenbank):** `config/weights.json`, `config/lagen.json`, Stichwortlisten je Thema, `config/ausschluss.json`.

**Größenschätzung (Annahme: 120–200 Byte je kleiner Zeile, 600–1.000 Byte je Geschichte mit Titel, Faktor 1,5 für Indizes):** `geschichten` ca. 48.000 × 1 KB ≈ 50–75 MB; `zaehlwerte` ca. 216.000 Zeilen (Schätzung aus `PLAN.md`) ≈ 30–60 MB; übrige Tabellen zusammen unter 20 MB; insgesamt ca. 100–160 MB, also unter den 500 MB des Supabase-Gratis-Tarifs laut `PLAN.md` (Zahlen dort aus Drittquellen). Nicht gemessen, nur gerechnet.
**Zugriff (Vorschlag):** Der Holer schreibt mit einem geheimen Schlüssel, die Webseite liest nur über den Server; kein Besucher löst eine GDELT-Anfrage aus (wie `PLAN.md`). Keine Schlüssel in Git.
**Offene Risiken:** Zeilenanzahl und Größe sind Rechnung, nicht Messung; Aktualisieren der Domain-Liste je Lauf erhöht Schreibzugriffe; Supabase pausiert Projekte bei Inaktivität (Annahme aus `PLAN.md`, Holer-Schreibzugriff zählt als Aktivität).

## 9. Offene Risiken insgesamt (Rangfolge nach meiner Einschätzung)

1. Minutenbudget mit gkg (72–108 %) hängt an einer nicht gemessenen Startzeit.
2. Titelabdeckung: ohne gkg aller 4 Zeitpunkte pro Lauf fehlen die Titel für die Weltübersicht.
3. Ranking-Entscheidung (roh oder log, Länderfaktoren, Regionale Spitze) hängt an Ihrem Urteil am verdeckten Blatt.
4. Nur englischer/unübersetzter Strom: bewusste Lücke.
5. Alle Stichproben klein, Urteile von nur einer Person (mir), Zeitraum nur Do–So.
6. DOC-/GEO-API unbekannt.

## 10. Was ich von Ihnen bräuchte (Entscheidungen, keine Empfehlungen)

Ranking (Blatt), Themenliste und Methode, ob Märkte Einzelaktien zeigen sollen, Schwelle der Titelzusammenfassung, ob „erhöht" bleibt, Lagen-Liste und Wortlisten, Eilmeldung nur im Schattenbetrieb oder gar nicht, Takt (60 oder 120 Minuten), ob der Übersetzungsstrom später folgt.

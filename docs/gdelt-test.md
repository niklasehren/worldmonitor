# GDELT-Test (Schritt 5): Bericht

Stand: 01.11.2026. Alles Gemessene stammt aus den öffentlichen GDELT-Dateien von `data.gdeltproject.org` (per `https`, kein `http`-Fallback nötig). Es wurde **nichts entschieden** (Themenfilter, Takt, Ranking sind offen). Jede Aussage trägt eine Kennzeichnung:

- **gemessen** = aus den Daten gezählt oder berechnet.
- **Einschätzung** = mein Urteil (Modell), nach Titel, nicht belastbar wie eine Messung.
- **Annahme** = vermutet oder aus dem Gedächtnis, nicht geprüft.

## 1. Rahmen und was NICHT getestet werden konnte

| Punkt | Ergebnis |
|---|---|
| Zeitraum der Ereignisdateien | 29.10.2026 04:30 UTC bis 01.11.2026 04:15 UTC, 288 Zeitpunkte (je `export` + `mentions`), **0 fehlende Dateien** (gemessen) |
| Weitere Dateien | gkg + translation.gkg für 5 Zeitpunkte, dazu 19 gkg-Dateien für die Auslöser-Stichprobe (gemessen) |
| Gesamtmenge Rohdaten | 199 MB gezippt im Cache (gemessen, Obergrenze 1 GB nie berührt) |
| Anfragen | 614 Zählerstand beim Schreiben (davon ca. 21 an die gesperrte DOC-API, Rest an `data.gdeltproject.org`; die minütliche Verfügbarkeitsmessung in Abschnitt 9 kommt hinzu), mindestens 5 s Pause, keine Schlüssel, keine Anmeldung |
| **DOC-API (Artikelsuche)** | **Nicht getestet.** 21 Anfragen, fast alle mit **HTTP 429** („zu viele Anfragen") abgelehnt, schon die erste nach über einer Minute Pause. Lauf gestoppt. **Ursache unbekannt, möglicherweise das Hotel-WLAN.** Der Test muss aus einem anderen Netz wiederholt werden. |
| **GEO-API (Orte)** | **Nicht getestet** (pausiert, wie vereinbart) |
| Themenfilter über DOC (Variante A/B) | **Nicht getestet** (siehe DOC). Stattdessen Auswertung auf gkg-Basis (Abschnitt 4) |
| Verlaufsdaten 3 Monate (DOC `TimelineVolRaw`) | **Nicht getestet** (siehe DOC) |

Hinweise aus dem Protokoll (gemessen): Einzelne Abrufe liegen im Protokoll Stunden auseinander (z. B. 06:56 → 08:56 → 11:01 → 13:01 UTC). Wahrscheinliche Ursache ist ein Ruhezustand des Macs (Annahme). Die Vollständigkeitsprüfung steht in Abschnitt 9, es fehlen keine Daten.

## 2. Dateien: Aufbau und Größe (gemessen)

- `export` (Ereignisse): 61 Spalten, `mentions`: 16 Spalten, `gkg`: 27 Spalten.
- **Ein Dateipaar (export + mentions) um 03:00 UTC: 87 KB gezippt.** Ereignisse pro 15-Minuten-Zeitpunkt über die 3 Tage: Minimum 342, Median 1.000, Maximum 2.398 (also ein Faktor von etwa 7 zwischen ruhigster und lebhaftester Zeit).
- Gesamt über alle 288 Zeitpunkte: 296.447 Ereignisse. Davon 7.883 ohne Ereignisland (2,7 %).
- **gkg-Größen nach Tageszeit** (gkg + translation.gkg, gezippt, gemessen):

| Zeitpunkt (UTC) | Größe |
|---|---|
| Sonntag 01.11. 03:00 | 4,8 MB |
| Freitag 30.10. 08:00 | 12,4 MB |
| Freitag 30.10. 14:00 | 18,5 MB |
| Freitag 30.10. 20:00 | 12,4 MB |
| Samstag 31.10. 12:00 | 10,6 MB |

Die nächtliche Datei ist also nur etwa ein Viertel bis ein Drittel der Größe der Werktags-Dateien. Die ersten Hochrechnungen aus dem Nacht-Zeitpunkt waren damit zu niedrig.

## 3. gkg-Felder und Feed ohne DOC-API

**Gemessen (5 Zeitpunkte, 14.535 Artikel, davon 5.012 deutsch oder unübersetzt/vermutlich englisch):**
- Jede Zeile hat **Domain, Adresse und Seitentitel** (721 von 722 bzw. 441 von 441 im ersten Zeitpunkt).
- **Themenkürzel** bei 84 % (gkg) bzw. 91 % (translation.gkg), **Ort** bei 75 % bzw. 82 % (erster Zeitpunkt).
- **Sprache:** nur in `translation.gkg` als `srclc:xxx`. In `gkg` (unübersetzt) fehlt das Feld. Die Titel dort waren in den Stichproben englisch, ein Beweis ist das nicht (Annahme). Deutsche Artikel liegen laut Messung in `translation.gkg` (821 von 14.535).
- Titel sind HTML-kodiert (`&#x…;`) und müssen für die Anzeige umgewandelt werden.
- Der Ort in gkg ist ein im Text erwähnter Ort, nicht notwendig das Ereignisland (Annahme laut GDELT-Handbuch, nicht in den Daten geprüft).

**Einschätzung:** Ein Feed ohne DOC-API ist technisch machbar (alle Felder vorhanden). Offene Punkte: Pro Holer-Lauf (60 Min.) wären 4 Zeitpunkte × 2 Dateien nötig, bei den größeren Tageszeiten etwa 13–18 MB je Zeitpunkt, also je nach Tageszeit etwa 20 bis 75 MB pro Lauf (Rechnung aus den gemessenen Größen). Das passt zu GitHub-Actions, die Laufzeit bleibt zu messen. Die Qualität hängt an den Themenkürzeln (siehe 5.).

## 4. Verbindung Ereignis ↔ Artikel (gemessen)

Über die Adresse (Quell-Adresse des Ereignisses = Adresse des Artikels in gkg, nach Vereinheitlichung ohne `http(s)://`, `www.`, `#…`, Schrägstrich) in den 5 gkg-Zeitpunkten:

| Zeitpunkt (UTC) | Ereignisse | mit Titel | Anteil |
|---|---|---|---|
| Fr 30.10. 08:00 | 953 | 949 | 99,6 % |
| Fr 30.10. 14:00 | 1.121 | 1.121 | 100 % |
| Fr 30.10. 20:00 | 1.161 | 1.157 | 99,7 % |
| Sa 31.10. 12:00 | 457 | 457 | 100 % |
| So 01.11. 03:00 | 806 | 806 | 100 % |
| **Gesamt** | **4.498** | **4.490** | **99,8 %** |

Alle verbundenen Artikel lagen in der **unübersetzten** `gkg`-Datei, keiner in der Übersetzungsdatei (gemessen). Das gilt nur für den **gleichen Zeitpunkt**, in dem das Ereignis hinzugefügt wurde. Ob es für ältere Artikel (spätere Erwähnungen) gilt, wurde nicht gemessen.

## 5. Themenqualität auf gkg-Basis (Einschätzung, nach Titel)

**Vorgehen:** Aus allen Artikeln in deutscher Sprache und den unübersetzten Artikeln (5.012 Stück in 5 Zeitpunkten) wurden pro Thema die Treffer über GDELT-Themenkürzel gezählt und 20 zufällige Treffer (feste Zufallszahl) von mir **nur nach dem Titel** beurteilt. Die Kürzel: Konflikte `ARMEDCONFLICT`, Diplomatie `NEGOTIATIONS`/`CEASEFIRE`, Sanktionen `SANCTIONS`, Wahlen `ELECTION`/`RESIGNATION`, Energie `ENV_OIL`/`ENV_NATURALGAS`/`ENV_COAL`, Märkte `ECON_CENTRALBANK`/`ECON_STOCKMARKET`/`ECON_GOLDPRICE`/`ECON_INTEREST_RATES`.

| Thema | Treffer (gemessen) | davon deutsch | Urteil Stichprobe (20) Einschätzung: passt / unklar / passt nicht | Treffer mit Stichwort im Titel (gemessen) |
|---|---|---|---|---|
| Konflikte | 574 | 95 | 1 / 4 / 15 | 7 % |
| Diplomatie | 194 | 54 | 5 / 7 / 8 | 1 % |
| Sanktionen | 86 | 8 | 0 / 10 / 10 | 1 % |
| Wahlen und Regierungswechsel | 584 | 64 | 15 / 0 / 5 | 19 % |
| Energie und Rohstoffe | 175 | 38 | 6 / 2 / 12 | 8 % |
| Märkte und Wirtschaft | 311 | 49 | 11 / 3 / 6 | 3 % |

Wichtige Grenzen:
- **Nur nach Titel beurteilt.** Das Themenkürzel kann sich auf den Artikeltext beziehen und im Titel nicht erkennbar sein. Gerade bei Sanktionen steht fast nie das Wort im Titel (1 von 86), die Wertung „unklar" bedeutet hier nicht „falsch".
- **Dubletten verzerren:** Dieselbe Geschichte erscheint mehrfach, z. B. kam „Evacuated Oleshky residents…" in der Stichprobe bei vier Themen vor (Konflikte, Diplomatie, Sanktionen, Märkte), bei Sanktionen und Märkten ohne erkennbaren Bezug. Das deutet auf **breite Themenmarkierung** durch GDELT hin (Einschätzung).
- **Wahlen:** Die Stichprobe besteht fast nur aus US-Zwischenwahlen (Zeitraum vor den Midterms), „Regierungswechsel" kam nicht vor.
- Unsichere Sprachen: Die Stichprobe enthielt nur deutsche und unübersetzte (englische) Titel, keine Titel, die ich nicht lesen konnte.
- Stichproben von 20 sind klein.

**Kontrolle für dich (5 zufällige pro Thema, mit meinem Urteil):**

**Konflikte**
- passt nicht: „Police investigate report of 'assault' against cleric in Armagh" (burytimes.co.uk)
- passt nicht: „5 inducted into Berks County Military Hall of Fame" (pottsmerc.com)
- passt nicht: „For libertarians, Election Day is the cruelest day of the year" (reason.com)
- passt nicht: „Why I Converted My 1979 Volvo 245 From Fuel Injection To Carburetion" (jalopnik.com)
- passt nicht: „Adam Sandler Spotted at Friendly Toast, Puritan Backroom in NH" (shark1053.com)

**Diplomatie**
- unklar: „Evacuated Oleshky residents begin long journey out of Russian-occupied region" (swindonadvertiser.co.uk)
- passt: „COP17's marathon talks yield Yerevan Pathway to speed up biodiversity action" (english.news.cn)
- passt nicht: „Right-wing bloc wins Israeli election with 53 seats, Likud takes top spot" (jns.org)
- unklar: „ITU Receives New IPv6 and Internet Governance Proposals Ahead of November Conference" (circleid.com)
- passt: „Kanzler auf Asienreise: Besuch an der Grenzlinie: Merz hofft auf Einheit Koreas" (handelsblatt.com)

**Sanktionen**
- unklar: „Miliband boycotted cancelled G20 photocall with Russian envoy over Ukraine" (westerntelegraph.co.uk)
- passt nicht: „Evacuated Oleshky residents begin long journey out of Russian-occupied region" (cravenherald.co.uk)
- unklar: „US delegation expected in Doha for direct Iran talks after reported breakthrough: Reports" (taiwansun.com)
- passt nicht: „Trump verliert Verbündete nach Wahl in Brasilien und Serbien" (dw.com)
- unklar: „G20 diplomats, including from China and Russia, face deep rifts as they prepare to meet in Atlanta" (ksat.com)

**Wahlen und Regierungswechsel**
- passt nicht: „Organised mock Parliament to soothe its troubled prince: Sudhanshu Trivedi targets Congress over mock Parliament…" (hongkongherald.com)
- passt: „Could President Trump's approval rating impact who voters send to Congress?" (koco.com)
- passt: „Tafoya, Demuth make campaign stops in Moorhead" (dglobe.com)
- passt: „Trump cancels rallies in Kansas and Iowa, opting for telerallies" (ketv.com)
- passt: „Betting Markets Overrate Favorites in Midterm Election Predictions" (el-balad.com)

**Energie und Rohstoffe**
- passt: „Wall Street Journal Reports Ukrainian Strike on Samara Refinery After Reported Pause" (econotimes.com)
- passt nicht: „Golvia unveils revolutionary 'Social Commerce Wheel' to monetize Africa's digital creative economy" (dailypost.ng)
- passt nicht: „BERENBERG stuft Knorr-Bremse auf 'Buy'" (finanznachrichten.de)
- passt nicht: „Kein «Familienfoto»: G20-Außenminister mit Signal an Moskau" (azonline.de)
- unklar: „Deutsche HVPI-Inflation sinkt im Oktober deutlicher als erwartet" (finanznachrichten.de)

**Märkte und Wirtschaft**
- passt nicht: „Voters 50+ Have Had Enough. New AARP Survey Reveals Why" (aol.com)
- unklar: „Media Monitor: MIT Technology Review Reports Record Binance Crypto Hack, Nvidia Spy Case and AI Pressure on Alphabet" (newsroomamerica.com)
- passt: „US futures fall as Amazon, Intel and Alphabet weigh on Wall Street" (dailycamera.com)
- passt: „GAIL (India) to list city gas distribution arm; profit surges to ₹4,724 cr in Q2 FY27" (thehindubusinessline.com)
- passt: „Nasdaq fällt nach Fed-Entscheid – dieser LONG-Trade wird zum Krimi!" (finanzen.net)

Die DOC-Variante B (Suchbegriffe) wurde nicht getestet. Die Spalte „Stichwort im Titel" ist nur eine Zählung, kein Qualitätsurteil.

## 6. Eilmeldungs-Auslöser (gemessen, Auswahl der Codes und Schwellen bleibt offen)

**Definition im Test (Entwurf aus dem Plan, kein Beschluss):** Ereignis-Hauptcode 18, 19 oder 20 (laut meinem Gedächtnis zu CAMEO: Angriff, Kampf, unkonventionelle Massengewalt; **nicht aus den Daten bestätigt**), mindestens 2 verschiedene Medien (Web-Erwähnungen, verschiedene Quellnamen) innerhalb von 60 Minuten nach der ersten Erwähnung. Das Auslöse-Zeitraster ist 15 Minuten (gröber geht es mit den Dateien nicht).

| Messgröße | Wert (gemessen) |
|---|---|
| Ereignisse Hauptcode 18 / 19 / 20 | 3.796 / 14.276 / 88 |
| Davon Auslöser (≥ 2 Medien in 60 Min.) | **1.647** (ca. **551 pro Tag**) |
| Ereignisse mit nur einer Quelle in 60 Min. | 16.335 (nicht ausgelöst) |
| am Fensterrand abgeschnitten (nicht bewertbar) | 178 |
| Verschiedene Quell-Adressen unter den Auslösern | 827 (also etwa jede zweite Meldung ist eine zweite Ereignis-Buchung derselben Adresse) |
| Mit Zusatzfilter Goldstein ≤ -8 | 1.647, **identisch** (der Filter trennt hier nichts) |
| Mit Zusatzfilter „Ereignisdatum höchstens 1 Tag alt" | 1.628 (fast alle Auslöser sind frisch) |
| Mindestzahl Medien in 60 Min. | ≥ 2: 1.647; ≥ 3: 655; ≥ 5: 306; ≥ 10: 111 |
| Häufigste Ereigniscodes unter den Auslösern | 190: 813, 193: 256, 180: 158, 192: 104, 194: 99, 181: 52, 182: 43, 1821: 30, 195: 27, 186: 21 |
| Zeit zwischen erster und zweiter Quelle | Median 15 Min., 90-%-Wert 60 Min.; 27 % im selben 15-Min-Zeitpunkt |

**Aufteilung nach deiner Länder-Gewichtung (gemessen):**

| Klasse | Auslöser | Anteil |
|---|---|---|
| hoch | 961 | 58 % |
| erhöht | 119 | 7 % |
| Basis / nicht gelistet | 502 | 30 % |
| ohne Ereignisland | 65 | 4 % |

**Einschätzung (nur Titel, kleine Stichprobe von 20):** Von 20 zufälligen Auslösern beschreiben **5** ein frisches, schweres Gewalt-/Militärereignis (Nr. 4, 8, 10, 14, 15; Nr. 4 und 14 sind **derselbe Artikel in zwei Ereignissen**), **1** ist unklar (Nr. 17: Drohung statt Ereignis), **14** passen nicht. Aufgeteilt: **hoch 0 von 10**, **Basis 5 von 8**, **erhöht 0 von 2**. Das ergibt eine **Fehlalarmquote um 70 %** in dieser Stichprobe (Einschätzung, n = 20, nicht belastbar). Auffällig: Unter den „hoch"-Auslösern waren vor allem US- und britische Kriminalfälle und Meldungen mit falsch zugeordnetem Ereigniscode (z. B. Wahlen, Unterhaltung, Waffenlieferung).

**10 zufällige Auslöser zur Kontrolle (Titel aus gkg, Zeiten in UTC):**

| Nr | Titel | Ereignisland (Klasse) | Quellen (Zeit der ersten Erwähnung) | Code | Mein Urteil |
|---|---|---|---|---|---|
| 1 | US approves $2.1 billion Patriot missile sale to Ukraine | Russia (hoch) | internazionale.it 30.10. 20:15, lufkindailynews.com 20:30 | 194 | nein (Waffenverkauf, kein Gewaltereignis) |
| 2 | U.S. and world news for Oct. 30 | Iran (hoch) | westfaironline.com 14:30, localnews8.com 15:00 | 190 | nein (Nachrichtensammlung) |
| 3 | No charges for Ottawa police in hostage-taker's shooting | Canada (Basis) | ottawacitizen.com 01.11. 00:15, ottawasun.com 01:00 | 180 | nein (lokal, Rückblick) |
| 4 | Saudi Arabia reports interception of Houthi drone targeting Mecca | Yemen (Basis) | dominicanrepublicpost.com 30.10. 13:00, aljazeera.com 13:00 | 195 | **ja** |
| 5 | Man accused in Cornell rape lawsuit wants Letitia James removed from investigation… | United States (hoch) | 15 Quellen ab 29.10. 14:30 (z. B. clickondetroit.com, dailycamera.com) | 1821 | nein (Zivilverfahren) |
| 6 | 11-year-old from Ohio rescued in Tennessee, suspect charged with child rape | United States (hoch) | fox17.com 29.10. 23:00, newschannel9.com 23:00 | 1821 | nein (lokale Kriminalität) |
| 7 | Redland City Council by-election: Council moves to request postal ballot following mayor's resignation | Australia (Basis) | smh.com.au, theage.com.au, brisbanetimes.com.au (alle 29.10. 07:45) | 190 | nein (Fehlzuordnung) |
| 8 | Pakistani military installation in Balochistan attacked by BRG's new drone unit | Pakistan (Basis) | prokerala.com 31.10. 10:45, ianslive.in 11:00 | 195 | **ja** |
| 9 | Federal officials investigate fire at beleaguered police department in Mississippi | United States (hoch) | listenupyall.com 01.11. 00:45, greenevillesun.com 01:00, clickondetroit.com 01:00 | 193 | nein |
| 10 | Nigeria says troops kill 48 Islamist fighters after attacks in Borno, Yobe bases | Nigeria (Basis) | whbl.com 30.10. 14:15, vanguardngr.com 14:45 | 190 | **ja** |

(Die übrigen 10 der Stichprobe stehen in `data/gdelt-test/trigger-sample20-titles.json` und `trigger-judgment.json`, lokal, nicht in Git.)

**Geschwindigkeit des Eilmeldungs-Pfads (Verzögerung vom Ereignis bis zur Anzeige):**
- (a) **Ereignis → erste Meldung:** nicht messbar mit diesen Daten (der Ereigniszeitpunkt ist nicht bekannt). Die Zeitstempel in den Dateien sind Zeitpunkte der Erfassung durch GDELT, nicht die Veröffentlichungszeit des Artikels (Annahme laut Handbuch, nicht geprüft).
- (b) **Erste Meldung → zweites Medium (Auslöser):** Median **15 Minuten**, 90-%-Wert **60 Minuten** (gemessen, grob, da das Raster 15 Minuten beträgt).
- (c) **Verfügbarkeit der Dateien auf dem Server:** siehe Abschnitt 10 (Messung, Ergänzung).
- (d) **Wartezeit auf den nächsten Holer-Lauf:** bei Takt **60 Min.** im Mittel 30 Min. (Maximum 60), bei 30 Min. im Mittel 15 (Maximum 30), bei 15 Min. im Mittel 7,5 (Maximum 15). Das ist **Rechnung**, keine Messung. Hinzu kommen Laufzeit des Holers und Anzeige (unbekannt).
- Fazit (gemessen plus Rechnung): Bei 60 Min. Takt kommt zur Verzögerung bis zum Auslöser (Median 15 Min.) im Mittel noch eine halbe Stunde Wartezeit. Eine Eilmeldung wäre also typischerweise **etwa 45 bis 75 Minuten** nach der ersten Erfassung durch GDELT sichtbar (Rechnung, ohne Dateiverzögerung und Laufzeit).

## 7. Rang: roh gegen log(1 + M) (gemessen, mit Annahmen)

**Annahmen:** „Geschichte" = ein GDELT-Ereignis, M = Zahl verschiedener Web-Quellen bis zum Zeitpunkt, Aktualität Halbwertszeit 12 Stunden, Gewichtung Land aus deiner Liste (Faktoren 1,0/1,5/2,0), **Gewichtung Thema = 1,0** (Ereignisdateien kennen unsere sechs Themen nicht), Länder ohne Ereignisland = Basis. Deshalb ist das **kein** Test der vollen Formel mit Themen.

| Zeitpunkt (Ende, UTC) | Geschichten | Übereinstimmung Top 10 | Top 20 | gleiches Land in Top 10 (roh / log) | mittleres M der Top 10 (roh / log) | Gewichtung Top 20 roh | Gewichtung Top 20 log |
|---|---|---|---|---|---|---|---|
| 01.11. 04:15 | 72.765 | 1 | 4 | 4 / 9 | 237,8 / 121,6 | 20 hoch | 20 hoch |
| 31.10. 22:15 | 81.904 | 7 | 13 | 4 / 6 | 218,8 / 212,8 | 20 hoch | 20 hoch |
| 31.10. 16:15 | 101.820 | 9 | 15 | 4 / 4 | 185,3 / 182,8 | 15 hoch, 5 erhöht | 20 hoch |
| 31.10. 10:15 | 114.172 | 8 | 14 | 3 / 4 | 123,4 / 112,6 | 17 hoch, 2 erhöht, 1 Basis | 20 hoch |

- **Stabilität** (mittlere Übereinstimmung der Top 20 zwischen aufeinanderfolgenden stündlichen Zeitpunkten, 24 Stunden): **roh 17,5 von 20, log 15 von 20**.
- **Gemessen:** Beide Varianten liefern in den Top 20 fast nur Länder der Stufe „hoch" (mit dem Faktor 2,0 dominieren die 13 „hoch"-Länder, zu denen die USA gehören, bei sehr vielen Meldungen). Roh und log unterscheiden sich im ersten Zeitpunkt stark (nur 1 gemeinsame Geschichte in den Top 10) und kaum in den anderen.
- **Verdecktes Blatt für dich:** `docs/gdelt-test-ranking-blind.md` (zwei Listen A und B für den neuesten Zeitpunkt, Titel nur aus der Adresse abgeleitet). Den Schlüssel, welche Liste welche ist, bitte erst **nach** deinem Urteil öffnen: `data/gdelt-test/ranking-key.json`.
- **Nicht gemessen:** Die Formel mit unseren sechs Themen, weil dafür DOC bzw. Themenmarkierung pro Geschichte nötig ist.

## 8. Ausreißer-Verlauf (gemessen, nur Probelauf)

- Verlaufsdaten reichen nur über etwa **3 Tage** (2,96 Tage), nicht über 28. Die Messgröße „Geschichten je (Land, Thema)" lässt sich ohne Themen nicht bilden. Als Näherung: **Ereignisse je Ereignisland, rollierend 24 Stunden.**
- **235 Länder** haben im Zeitraum Ereignisse, **203** an allen drei Tagen.
- Die Gesamtmenge schwankt stark (342 bis 2.398 Ereignisse je 15 Minuten), deshalb wurde zusätzlich der **Anteil am Gesamtvolumen** getestet.
- **Probelauf** (Normalwert aus nur etwa einem Tag rollierender Fenster, daher **nicht belastbar**): Absolute Zählung markiert 10 Länder mit Mindestmenge 10 und Abweichung ab 3,5 robusten Streuungen; die Anteilsrechnung markiert **36**. Beispiele (absolut): EK (22 statt Median 1), GZ (34 statt 18), SG (183 statt 72), PL (555 statt 302), AF (428 statt 279). Die Anteilsrechnung markiert kleinere Länder mit Werten von nur etwa 0,02 % mit sehr hohen Kennzahlen (z. B. 199,9), weil die Streuung nahe 0 liegt. Das spricht dafür, dass Anteilsrechnung allein bei kleinen Ländern Fehlalarme erzeugt (Einschätzung).
- **Speicherbedarf der Zählwerte:** Für das Schema `counts` (je Lauf, Land, Thema) wurde keine Schätzung aus echten Daten gemacht, weil die Themen je Land fehlen. Die 235 Länder mit Ereignissen sind eine Obergrenze für die Länderzahl (gemessen). Die Plan-Schätzung (ca. 216.000 Zeilen für 90 Tage) bleibt eine Annahme.

## 9. Datenqualität (gemessen, Prüfung nach dem nächtlichen Ruhezustand des Macs)

Der Mac war zwischendurch im Ruhezustand. Im Protokoll liegen deshalb acht Pausen von mehr als 15 Minuten zwischen Abrufen (zwischen 20 und 120 Minuten, zusammen etwa 7 Stunden). Daher wurde der gesamte Cache geprüft (`scripts/gdelt-test/a-integrity.mjs`, Ergebnis in `data/gdelt-test/integrity.json`):

| Prüfung | Ergebnis |
|---|---|
| Ereignis- und Erwähnungsdateien (288 Zeitpunkte × 2) | **576 von 576 vorhanden**, 0 fehlend |
| Dateien mit Größe 0 | **0** |
| Zip-Integritätsprüfung (`unzip -t`) | **0 Fehler** in allen 605 geprüften Dateien |
| Abweichung zwischen gespeicherter und tatsächlicher Dateigröße | **0** |
| Entpackter Text leer | **0** |
| Letzte Zeile ohne Zeilenumbruch (Hinweis auf Abschneiden) | **0** |
| Zeilen `export` | 296.447, davon **0 mit falscher Spaltenzahl** (erwartet 61) |
| Zeilen `mentions` | 791.314, davon **0 mit falscher Spaltenzahl** (erwartet 16) |
| gkg-Hauptzeitpunkte (gkg + translation.gkg, 5 × 2) | **10 von 10** in Ordnung |
| gkg-Dateien für die Auslöser-Stichprobe | **19 von 19** in Ordnung |
| Lücken im 15-Minuten-Raster der 288 Zeitpunkte | **0** |
| Auffällig kleine Zeitpunkte (unter 25 % des Medians von 1.000 Ereignissen) | **0** (kleinster Zeitpunkt: 342 Ereignisse) |
| Zeitpunkte ohne Ereignisse oder ohne Erwähnungen | **0** |
| Fehlgeschlagene Abrufe auf `data.gdeltproject.org` laut Protokoll | **0** (0 `http`-Fallbacks) |
| Fehlgeschlagene Abrufe der DOC-API | 15 Fehlschläge (HTTP 429 bzw. Zeitüberschreitung), siehe Abschnitt 1 |

**Lücken in den Auswertungen (gemessen bzw. erklärt):**
- Durch den Ruhezustand sind **keine Datenlücken** entstanden, weil die Skripte nur nicht vorhandene Dateien laden und jede Datei einzeln geprüft wurde. Voraussetzung (Annahme): GDELT ändert veröffentlichte 15-Minuten-Dateien nachträglich nicht.
- Die Auslöser-Auswertung lässt **178 Ereignisse am rechten Fensterrand** weg, weil dort die 60 Minuten nach der ersten Erwähnung nicht mehr in den Daten liegen. Das ist Absicht, keine Datenlücke.
- Der Ausreißer-Probelauf hat nur **24 Stunden mit vollem 24-Stunden-Fenster** als Basis (3 Tage Daten insgesamt). Das ist eine Grenze der Datenmenge, keine Lücke.
- Nicht geprüft (nicht erhoben): Dateien außerhalb des 3-Tage-Fensters, `translation.export`/`translation.mentions` (Ereignisse aus übersetzten Quellen), die DOC- und GEO-Daten.

## 10. Nachtrag: Verfügbarkeit neuer Dateien auf dem Server

Messung (gemessen, 01.11.2026 13:30–15:20 UTC): 50 Abfragen der Aktualisierungsdatei `lastupdate.txt`, etwa im Minutentakt. Gemessen wurde, wann ein neuer Zeitstempel (Dateiname) dort zum ersten Mal erscheint, verglichen mit der Uhrzeit im Dateinamen. Negativer Wert = Datei erscheint **vor** der Uhrzeit im Namen.

| Zeitpunkt im Dateinamen (UTC) | zuerst gesehen (UTC) | Abstand (Min.) |
|---|---|---|
| 13:45 | 13:35:27 | -9,6 |
| 14:00 | 13:50:30 | -9,5 |
| 14:15 | 14:07:04 | -7,9 |
| 14:30 | 14:22:50 | -7,2 |
| 14:45 | 14:38:35 | -6,4 |
| 15:00 | 14:58:01 | -2,0 |
| 15:15 | 15:05:31 | -9,5 |

- **Anzahl auswertbarer Messungen: 7.** Der Zeitpunkt 13:30 zählt nicht, weil er gleich bei der ersten Abfrage sichtbar war (kein echtes Erstauftreten).
- **Median: -7,9 Minuten. 90. Perzentil (Rang 7 von 7, also faktisch der größte Wert): -2,0 Minuten.** Bei nur 7 Werten sind beide Zahlen grob. Ein früherer Zufallsfund (04:05 lokale Zeit, Zeitpunkt 04:15 schon sichtbar) passt dazu (ca. -9 Minuten).
- Einschätzung: Der Zeitstempel im Dateinamen liegt später als der Zeitpunkt, an dem die Datei erscheint; es gibt in diesem Test keine Verzögerung nach dem Zeitstempel. Die Streuung (-9,6 bis -2,0) ist größer als die Abfrage-Genauigkeit (1 Minute). Ob die Datei zum Zeitpunkt des Eintrags in `lastupdate.txt` auch schon vollständig abrufbar ist, wurde nicht getrennt geprüft (Annahme: ja).
- Die Uhr dieses Macs wich bei diesen Abfragen höchstens 1 Sekunde von der Serverzeit ab (gemessen).

## 11. Was offen oder unsicher ist

- DOC-API und GEO-API: nicht getestet (HTTP 429, womöglich Netz). **Aus anderem Netz wiederholen.** Das betrifft: Themenfilter Variante A/B, Verlauf über 3 Monate, Ortsqualität der GEO-Daten, den Vergleich von DOC mit gkg.
- Ortsqualität aus den Ereignisdateien wurde nicht von Hand geprüft (keine 20er-Stichprobe), nur im Beispieltabelle fiel auf: Ort und Land passen nicht immer zur Geschichte (z. B. Nr. 1 „Patriot-Verkauf an die Ukraine" mit Land Russland, Nr. 4 „Saudi-Arabien fängt Houthi-Drohne ab" mit Land Jemen; Einschätzung).
- Länder-Gewichtung: Slowakei (`LO`) und Palästina (`GZ`, `WE`) sind Annahmen bei der Zuordnung (siehe `config/weights.json`).
- **Sprachen der Ereignisdateien:** Alle verbundenen Artikel lagen im unübersetzten Strom (gemessen). Ereignisse aus deutschsprachigen Quellen stecken vermutlich in den separaten Übersetzungsdateien (`translation.export`/`translation.mentions`), die **nicht geladen** wurden (Annahme). Die Auslöser- und Rang-Zahlen gelten also nur für den unübersetzten Strom.
- Dubletten: Gleiche Geschichten wurden hier nicht gruppiert. Das beeinflusst die Zahlen der Themenabschnitte und der Auslöser (827 verschiedene Adressen unter 1.647 Auslösern).
- Stichproben (20 je Thema, 20 Auslöser) sind klein, meine Urteile nur nach Titel.
- Aus diesem Test **folgt keine Entscheidung**. Themenfilter, Takt, Ranking-Variante, Schwellen und Codes für Eilmeldungen sind weiter offen.

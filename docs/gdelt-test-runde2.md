# GDELT-Test Runde 2: Bericht

Stand: 01.11.2026. Grundlage sind dieselben öffentlichen GDELT-Dateien von `data.gdeltproject.org` (nur `https`/`http` dieser Domain, mindestens 5 s Pause). DOC-API und GEO-API blieben pausiert. Es wurde **nichts entschieden**.

- **gemessen** = aus den Daten gezählt oder berechnet.
- **Einschätzung** = mein Urteil (Modell), meist nur nach Titel, nicht belastbar wie eine Messung.
- **Annahme** = vermutet oder nicht geprüft.

## Zusammenfassung (≤10 Zeilen)

1. **Besser:** Zusammenfassen nach Artikel-Adresse löst das größte Rangproblem: Die alte Top 20 bestand nur aus 7 bis 13 verschiedenen Geschichten, jetzt sind es immer 20 (gemessen).
2. **Nicht gelöst:** Gleiche Geschichten mit anderem Wortlaut bleiben getrennt (z. B. „Frankreich-Proteste" 3-mal in einer Liste). Die Titelschwelle 0,8 reicht nicht (gemessen, siehe 2).
3. **Ranking:** Die Länderfaktoren 1,0/1,5/2,0 geben Basisländern im Schnitt 1,5 bis 2,5 von 20 Plätzen, mit „Regionaler Spitze" 4 bis 4,5 (gemessen). „Erhöht" kommt in keiner der 32 Listen vor.
4. **Eilmeldung:** Ereignisregel auf Geschichten statt Ereignissen halbiert die Zahl (551 → 277/Tag), bleibt aber zu breit. Beste Kombination (D1: Waffencodes plus bewaffnete Akteure, ≥2 Medien) liegt bei 17/Tag, Fehlalarm 36 % (n=11, sehr klein).
5. **Themen:** Kürzel allein ist schlecht (Fehler 60 bis 75 %). Kürzel plus Stichwort im Titel oder mindestens 3 Vorkommen sind deutlich besser. Ereigniscodes sind bei Konflikte/Diplomatie schlecht (70 %), bei Sanktionen sehr schlecht (90 %).
6. **Ereignisland:** Das Aktionsland passt bei ca. 15 % der Stichprobe nicht zur Geschichte; das häufigste gkg-Land nur bei ca. 4 % (n=27, Einschätzung).
7. **Übersetzungsdateien:** 59 von 96 Zeitpunkten geladen (Anfragenlimit 800 erreicht). Brasilien erscheint mit 902 Ereignissen, aber in keinem Auslöser unter den Top 12 (gemessen).
8. **Verfügbarkeit neuer Dateien:** Median −7,9 Minuten (Datei erscheint vor dem Zeitstempel), n=7 (gemessen).
9. **Lagen:** Länderpaar-Filter funktioniert bei Iran, Russland/Ukraine, Israel gut, bei China/Taiwan und USA/China nur mit Stichwort. Die Konflikt-Kooperations-Skala taugt nur als Tagesmittel, nicht stündlich.
10. **Offen:** DOC-API, Titelzusammenfassung, Schwellen, Zielwerte, Grundgesamtheit der Titel (nur ca. 9 bis 22 % der Geschichten haben gkg-Titel im Test).

---

## 0. Rahmen, Entscheidungen, Grenzen

| Punkt | Wert |
|---|---|
| Stichproben-Zeitpunkte mit Titeln | 5 Haupt-Zeitpunkte, 19 Zeitpunkte aus der Auslöser-Auswahl, 36 Zufalls-Zeitpunkte (Zufall mit fester Zahl) mit gkg-Titeln (gemessen) |
| Anfragen | **800 erreicht** (die Obergrenze hatte ich selbst im Skript `lib.mjs` eingebaut, nicht vom Nutzer vorgegeben). Der Download der Übersetzungsdateien brach deshalb nach 59 von 96 Zeitpunkten ab. Vorsichtige Entscheidung: nicht erhöhen, im Bericht vermerken. |
| Rohdaten im Cache | ca. 439 MB (gemessen, `du`), Grenze 1 GB nicht berührt |
| Fehler | keine HTTP-Fehler in dieser Runde; DOC-API nicht angefragt |
| Netzwerk | nur nacheinander, ein Prozess |

Entscheidungen bei Unklarheiten (jeweils vorsichtigere Variante): Geschichten per Adresse, danach Titelähnlichkeit Wortüberlappung ≥ 0,8 (mind. 4 Wörter); Länderfaktor einer Geschichte = höchster Faktor der beteiligten Länder (Annahme); Regionen aus `scripts/gdelt-test/regions.json` (Annahme: Türkei → Naher Osten, Russland → Europa, Sudan → Afrika, Kaukasus und Zentralasien → Asien); Urteile „unklar" werden nie als „passt" gezählt.

## 0b. Nachtrag Verfügbarkeit neuer Dateien

Siehe `docs/gdelt-test.md` Abschnitt 10: 7 auswertbare Messungen, Median −7,9 Minuten, größter Wert −2,0 (gemessen).

## 1. Geschichten zusammenfassen

Gleiche normierte Adresse = eine Geschichte (ein Artikel mit mehreren Ländern = eine Geschichte mit mehreren Ländern). Danach Titel-Ähnlichkeit unter den Kandidaten.

| Zeitpunkt (Ende) | Top 20 alt (Ereignisse): verschiedene Adressen roh / log | Top 20 neu (Geschichten): verschiedene |
|---|---|---|
| 04:15 (01.11.) | 7 / 8 | 20 / 20 |
| 22:15 (31.10.) | 7 / 11 | 20 / 20 |
| 16:15 (31.10.) | 7 / 8 | 20 / 20 |
| 10:15 (31.10.) | 13 / 10 | 20 / 20 |

Gemessen. Aber: Geschichten mit anderem Wortlaut und anderer Adresse bleiben getrennt. Im verdeckten Blatt 2 (04:15) stehen z. B. „France heads into third weekend of protests" dreimal (327, 201, 179 Mentions), „Oleshky" zweimal, „Trump gegen Wall Street Journal" zweimal, „Palestine Action" dreimal. Die Zahl „20 verschiedene" meint also nur verschiedene Adresse und Titel mit Schwelle 0,8, **nicht** verschiedene Ereignisse im Sinne eines Lesers (Einschätzung). Die Zahl „Quellen" im Blatt ist die Summe der Erwähnungen (Mentions), nicht verschiedene Medien (Annahme: kann mehrfach dasselbe Medium zählen).

## 2. Ranking-Varianten

Varianten: Wert M roh oder log(1+M); Länderfaktoren „weit" 1,0/1,5/2,0 oder „eng" 1,0/1,25/1,5; jeweils ohne oder mit „Regionaler Spitze". Regionale Spitze = je Weltregion die Geschichte mit dem höchsten M ohne Länderfaktor, immer in die Liste aufgenommen (7 Regionen, damit 7 Plätze der 20, Annahme).

Basisländer in der Top 20 (gemessen, 4 Zeitpunkte):

| Variante | 04:15 | 22:15 | 16:15 | 10:15 | Mittel |
|---|---|---|---|---|---|
| roh, weit, ohne | 1 | 1 | 3 | 2 | 1,75 |
| roh, weit, mit | 3 | 4 | 5 | 4 | 4,0 |
| roh, eng, ohne | 2 | 2 | 3 | 3 | 2,5 |
| roh, eng, mit | 4 | 4 | 5 | 5 | 4,5 |
| log, weit, ohne | 1 | 2 | 2 | 1 | 1,5 |
| log, weit, mit | 3 | 4 | 5 | 4 | 4,0 |
| log, eng, ohne | 1 | 2 | 2 | 1 | 1,5 |
| log, eng, mit | 3 | 4 | 5 | 4 | 4,0 |

Länder der Stufe „erhöht" kamen in **allen 32 Listen 0-mal** vor, Länder „hoch" 13 bis 19-mal (gemessen). Alle Listen enthalten 20 verschiedene Geschichten. 9 Geschichten stehen in beiden Blättern (Überlappung roh/log, gemessen).

Beste Geschichte je Region (M, gemessen; Zeitpunkt 04:15, Titel aus gkg):

| Region | Titel | M | Länder |
|---|---|---|---|
| Europa | France heads into third weekend of protests as youth-led rallies sweep Europe | 327 | DE, FR, IT |
| Lateinamerika und Karibik | King Charles Arrives In Guyana As Political Protest And Reparations Demands Shadow Visit | 236 | Guyana, UK |
| Nordamerika | Appeals court rejects Justice Department request for California to set aside disputed ballots | 185 | USA |
| Naher Osten/Nordafrika | Met Police make first arrests of pro-Palestine Action demonstrators … outside US Embassy | 162 | Israel |
| Asien | Xi calls for new model of Sino-German cooperation | 124 | China, Deutschland |
| Afrika | Congo's Ebola deaths top 5,000 as fear of continent-wide spread mounts | 96 | Kongo, Ruanda, Nigeria |
| Ozeanien | Liberals surge in polls as leader signs up for debate | 68 | Australien |

Einschätzung: Mehrere regionale Spitzen sind Randthemen (Guyana-Besuch, Palestine Action in London zählt mit Land Israel zu „Naher Osten"). Ein Land-Eintrag ist hier das Land der Ereignisse, nicht das der Geschichte. **Verdecktes Blatt 2:** `docs/gdelt-test-ranking-blind-2.md` (Zeitpunkt 04:15, Liste A = roh, Liste B = log, je 15 verschiedene Geschichten, echte Titel). Der Schlüssel liegt in `data/gdelt-test/ranking-key-2.json`; bitte erst nach Ihrem Urteil öffnen.

## 3. Eilmeldungs-Regel auf Geschichten

Universum: gesamte 3 Tage, Geschichten per Adresse; „Medien" = verschiedene Web-Quellen binnen 60 Minuten nach erster Nennung. Die Variantendefinitionen stehen in `scripts/gdelt-test/triggers2.mjs`.

**Welche Codes (gemessen):** Unter den schweren Hauptgruppen 18 bis 20 sind die häufigsten Einzelcodes 190 (9.313, „Einsatz konventioneller Gewalt, ohne Angabe"), 193 (2.601, Kampf mit Handfeuerwaffen), 180 (1.899), 192 (1.401), 181 (478), 194 (468, Artillerie/Panzer), 182 (429), 1821 (407), 186 (321), 195 (290, Luftwaffen), 191 (183), 1822 (170), 203 (58), 183 (35, Selbstmordanschlag), 202 (29), 196 (20). **Variante B** nimmt die Waffen-/Luftangriff-/Massengewalt-Codes 183, 1831–1834, 193, 194, 195, 196, 200–204 (Annahme über die Bedeutung nach CAMEO-Handbuch; die Bedeutung 193 = Handfeuerwaffen wurde an Stichproben bestätigt, zeigt aber Fehlcodierungen, z. B. „Hackerangriff auf US-Heimatschutz" mit 193).
**Akteursarten (Variante C):** Typen MIL, REB, UAF, INS, SEP, GOV (UAF = „bewaffnete Kräfte ohne Zuordnung", Annahme). In ca. 6.500 von ca. 18.000 schweren Ereignissen sind die Akteursfelder leer (gemessen).

| Variante | Geschichten | pro Tag | davon hoch / erhöht / Basis / ohne Land | Stichprobe n | Treffer (P) | unklar (U) | falsch (N) | Fehlalarm N | N+U |
|---|---|---|---|---|---|---|---|---|---|
| V0 Codes 18–20, ≥2 Medien | 827 | 276,6 | 498 / 58 / 219 / 52 | 20 | 4 | 1 | 15 | 75 % | 80 % |
| A5 18–20, ≥5 Medien | 169 | 56,5 | 110 / 10 / 46 / 3 | 20 | 4 | 2 | 14 | 70 % | 80 % |
| A10 18–20, ≥10 Medien | 65 | 21,7 | 38 / 4 / 23 / 0 | 18 | 3 | 2 | 13 | 72 % | 83 % |
| B Waffencodes, ≥2 | 221 | 73,9 | 144 / 10 / 51 / 16 | 20 | 4 | 3 | 13 | 65 % | 80 % |
| C bewaffnete Akteure, ≥2 | 191 | 63,9 | 93 / 13 / 71 / 14 | 20 | 7 | 5 | 8 | 40 % | 65 % |
| **D1 B und C, ≥2** | 51 | 17,1 | 26 / 2 / 17 / 6 | 11 | 5 | 2 | 4 | 36 % | 55 % |
| D2 B, ≥5 | 51 | 17,1 | 36 / 1 / 12 / 2 | 12 | 1 | 2 | 9 | 75 % | 92 % |
| D3 B und C, ≥5 | 12 | 4,0 | 7 / 0 / 5 / 0 | 3 | 1 | 1 | 1 | 33 % | 67 % |
| D4 B, ≥10 | 13 | 4,3 | 12 / 0 / 1 / 0 | 2 | 0 | 0 | 2 | 100 % | 100 % |

Anzahlen: gemessen. P/U/N: **Einschätzung** nach Titel, „P" = echte Konflikt-/Gewaltlage mit außenpolitischer Relevanz. Die Stichprobe zog nur Geschichten aus Zeitpunkten mit gkg-Titeln (z. B. D1: 11 von 51, D3: 3 von 12), **n ist bei D1 bis D4 viel zu klein für belastbare Aussagen**. Die Varianten teilen sich überlappende Geschichten (82 verschiedene Geschichten in allen Stichproben). Vergleich mit Runde 1 (Ereignisebene, 551/Tag, Fehlalarm 70 %): Die Geschichten-Ebene allein reduziert die Zahl auf die Hälfte, nicht den Fehlalarm.

**Beste Variante nach dieser Stichprobe:** D1 mit 17,1 Geschichten pro Tag, davon in Basisländern 17 in 3 Tagen (≈ 5,7/Tag) (gemessen). Einschätzung, keine Empfehlung: Der Fehlalarm bleibt mit 36 % (N) bis 55 % (N+U) hoch; C ohne B ist ähnlich gut bei 4-mal mehr Treffern.

**5 Beispiele D1 (Titel · Land · Medien binnen 60 Min · Code):**
1. North Korea fires missile barrage toward the sea as tensions with South rise · Nordkorea (Basis) · 6 · 194
2. Saudi Arabia reports interception of Houthi drone targeting Mecca · Jemen (Basis) · 3 · 193
3. Houthi missiles strike near presidential palace in Yemen's Aden · Jemen (Basis) · 2 · 194
4. Ukraine pauses refinery strikes after Trump pressure as Russian attacks kill at least 20 · Ukraine (hoch) · 2 · 194
5. US approves $2.1 billion Patriot missile sale to Ukraine · Russland (hoch) · 2 · 194 (**Fehlalarm**: Waffenverkauf, nicht Gewalt)

Zwei weitere Fehlalarme aus D1: „Hackers claim leak of sensitive details on thousands of DHS workers" (Kanada, 7 Medien, 193) und „West End theatres to dim lights in memory of Sir Patrick Stewart" (USA, 3 Medien, 193).

## 4. Themen: Methoden im Vergleich

Grundgesamtheit: 5 Haupt-Zeitpunkte, Deutsch und Englisch, nach Entfernung von Dubletten (Ereignismethode M4: 60 Zeitpunkte, 67.639 Ereignisse, nach Dublettenentfernung 12.606). Je Methode und Thema 20 zufällige Treffer nach Titel (Einschätzung, fester Zufall). Methoden: **M1** nur Themenkürzel; **M2** Kürzel plus Stichwort im Titel; **M3** Kürzel mit mindestens 3 Vorkommen im Artikel; **M4** Ereigniscodes über die Verbindung Ereignis → Artikel (Konflikte: Hauptgruppen 18–20; Diplomatie: 04 und 05; Sanktionen: Codes ab 163 und 172; Annahme zur Wahl der Codes).

Fehlerquote = Anteil „passt nicht (N)" von 20 (Einschätzung). Kleine n sind markiert.

| Thema | M1 Kürzel | M2 Kürzel+Titelwort | M3 ≥3 Vorkommen | M4 Ereigniscodes |
|---|---|---|---|---|
| Konflikte | 60 % (P1/U7/N12) | **25 %** (P10/U5/N5) | 40 % (P2/U10/N8) | 70 % (P5/U1/N14) |
| Diplomatie | 70 % | **27 %** (n=15) | 53 % (n=19) | 70 % (P2/U4/N14) |
| Sanktionen | 75 % | n=1 (P1, kaum Treffer) | n=4 (0/3/1) | **90 %** (P0/U2/N18) |
| Wahlen | 40 % | **5 %** | **5 %** (n=19) | nicht getestet |
| Energie | 70 % | **5 %** | 50 % | nicht getestet |
| Märkte | 20 % | **5 %** | **5 %** (n=19) | nicht getestet |

Mehrfach-Zuordnung (gemessen, Anteil der Artikel mit mindestens einem Thema, die mehr als einem Thema zugeordnet sind): M1 25 % (1.105 Artikel, 212 mit zwei, 64 mit drei oder mehr), M2 3 %, M3 6 %. Die M4-Methode wurde nicht auf Mehrfachzuordnung gemessen.

Einschätzung: Wo es genug Treffer gibt (Wahlen, Energie, Märkte, teilweise Konflikte, Diplomatie), verbessert das Titelwort die Qualität stark. Für Sanktionen gibt es mit Titelwort fast keine Treffer in dieser Stichprobe (n=1), mit Ereigniscodes fast nur Fehler (Code 172 enthält u. a. Bußgelder und Verwaltungsmaßnahmen, Annahme). **Sanktionen bleiben offen.** Ereigniscodes schneiden bei Konflikten und Diplomatie nicht besser ab als Kürzel+Titelwort; sie liefern aber Treffer ohne Titelwort.

**Je 5 Beispiele (Methode M2, Titel):**
- Konflikte: „Trump weighs options for next move in Iran war after Election Day"; „Evacuated Oleshky residents begin the long journey out of the war-ravaged region"; „Ein Präsident der Tat: Bukele droht Haitis Gangstern mit Krieg"; „Trump cancels midterm rallies, Vance skips 'War on Fraud' event as US weighs fresh Iran strikes"; „Israeli Forces Launch Interceptor Missiles Amid Suspected Aerial Threat". Gegenbeispiel: „Why is the Cheesecake Factory at the center of the latest culture war?"
- Diplomatie: „G20 Diplomats Meet In Atlanta Amid Divisions Over Russia, Ukraine"; „Difficult negotiations lie ahead in Israel after Netanyahu's bloc lost its parliament"; „Iranian envoys meet Qatar mediators as US strike threat looms post-midterms"; „Canada and EU Conclude Digital Trade Agreement Talks"; „US delegation expected in Doha for direct Iran talks after reported breakthrough". Gegenbeispiel: „SEIU-West files unfair labour complaint over contract negotiations"
- Sanktionen: Nur ein Treffer (M2): „G20 Foreign Ministers' Meeting: Russia's top diplomat arrives in US …" (**kein** Sanktionsthema, Einschätzung „unklar"). **Kein belastbares Beispiel.** Mit M4 u. a. „Russia Designates Opposition Delegation at PACE as 'Undesirable'" (unklar).
- Wahlen: „Venezuelan Opposition Leader Machado Says Presidential Elections Likely in 2027"; „U.S. midterms: Early voting spiking in American senate races"; „Nevadans Consider Measure To Add Verification For Mail-In Voting"; „LA mayoral candidates campaign on weekend before Election Day"; „Minnesota secretary of state candidates spar over voter security".
- Energie: „Oil Traders Brace for a Wild Week as Brent Approaches $120"; „CPC to leave domestic gasoline, diesel prices unchanged next week"; „U.S. Oil, Gas Drillers Still on Hold"; „US oil industry profit over $130B during Iran war"; „ENERGY CRISIS: Iran Faces Winter Blackouts After U.S.-Israeli Strikes Cripple Gas Production".
- Märkte: „Bank of Japan says inflation hit 2 percent target after 13 years"; „The Price of Gold Today, Oct. 30, 2026"; „Taiwan Stocks Fall 2.49% as AI Spending Draws Fresh Scrutiny"; „Regeneron Q3 Revenue Rises 36%"; „ServiceNow Stock: Difficult Print …" (**Einschätzung:** Märkte-Stichwörter treffen viele Einzelaktien-Artikel, ob das gewünscht ist, ist offen).

Die Judgments liegen in `scripts/gdelt-test/topics2-labels.json` (Einschätzung des Modells).

## 5. Ereignisland: Stimmt das Land?

Test an 30 Stichproben-Geschichten (fester Zufall, Titel aus gkg). Verglichen: **Aktionsland** (ActionGeo, bisher genutzt), **Land von Akteur 1**, **erstes Land in gkg-Orten**, **häufigstes Land in gkg-Orten**. Urteil: „Land passt offensichtlich nicht zum Titel" (Einschätzung, 3 Stichproben mit unklarem Titel ausgenommen, n=27).

| Variante | offensichtlich falsch | Anteil | Bemerkung |
|---|---|---|---|
| Aktionsland | 4 von 27 | **15 %** | z. B. „Russia extends oil export ban" → USA (Washington), „The Pope takes over Buenos Aires" → Peru, „Helping Dems Win …" → Iran, „Romania-Bulgaria-Turkey Trilateral" → Belgien |
| Land Akteur 1 | 2 von 22 mit Wert, 5 leer | 9 % falsch, 19 % leer | leer bei 5 der 27 |
| gkg: erstes Land | 4 von 27 | 15 % | z. B. „N.S. AI data centre" → USA, „Jaishankar's Atlanta diplomacy" → Mexiko |
| gkg: häufigstes Land | **1 von 27** | **4 %** | falsch bei „N.S. AI data centre: Houston resists…" (US statt Kanada) |

Einschätzung, **keine Entscheidung**: In dieser Stichprobe war das häufigste gkg-Land am treffendsten. Für Auslöser und Ranking verwendet der Test bisher das Aktionsland. Mit n=27 sind die Unterschiede nicht abgesichert. Ob „erste Nennung" oder „häufigste Nennung" für Länder besser ist, ist weiter offen. Auch das Verfahren „häufigstes Land" funktioniert nur für Geschichten mit gkg-Eintrag.

## 6. Übersetzungsdateien

- **Größe (gemessen):** Ein Paar `translation.export` + `translation.mentions` um 14:00 UTC (30.10.): 0,09 + 0,11 MB gezippt (198.933 Bytes laut Schätzung), um 03:00 UTC (01.11.): 0,02 + 0,02 MB (37.225 Bytes). Hochrechnung für einen Tag (96 Zeitpunkte, größeres Paar × 96): **ca. 19 MB** (oberste Grenze), Mittel ca. 11 MB. Die Regel (Obergrenze < 300 MB und Gesamtmenge < 1 GB) war erfüllt, also wurde geladen.
- **Geladen:** 59 von 96 Zeitpunkten (30.10. 14:00 bis 01.11. 03:00 UTC, einschließlich der zwei Probepaare), dann Abbruch durch die Anfragen-Obergrenze (800). Der Rest fehlt. Die Zahlen unten gelten für diese 59 Zeitpunkte (ca. 14,75 Stunden zusammenhängend plus 2 Einzelpunkte), **nicht** für einen vollen Tag.
- **Inhalt (gemessen):** 33.970 Ereignisse, 61.595 Erwähnungen. Quellsprachen der Erwähnungen: Spanisch 11.774, Russisch 6.511, Griechisch 4.954, Italienisch 4.385, Arabisch 3.699, Ukrainisch 2.857, Türkisch 2.779, **Portugiesisch 2.377**, Französisch 2.238, Rumänisch 1.914, Deutsch 1.834, Albanisch 1.812.
- **Länder der Ereignisse:** Russland 2.934, Ukraine 2.657, USA 2.033, Italien 1.345, ohne Land 1.307, Polen 1.253, Türkei 1.180, Spanien 1.009, Frankreich 943, Iran 934, **Brasilien 902**, Deutschland 880, Indien 877, Israel 866, Mexiko 702. Portugal 166.
- **Schwere Ereignisse (Hauptgruppen 18–20): 2.770**, am häufigsten in Ukraine 300, Russland 269, Israel 184, Iran 169, USA 156.
- **Auslöser (V0-Regel: schwere Codes, ≥2 verschiedene Medien binnen 60 Minuten) nur im Übersetzungsstrom: 155** in den 59 Zeitpunkten. Nach Land (gemessen): Iran 21, Ukraine 20, Russland 18, ohne Land 11, Israel 10, Deutschland 7, Frankreich 6, Polen 5, USA 4, Schweden 4, Saudi-Arabien 3, Spanien 3. **Brasilien erscheint nicht unter den ersten 12.**
- **Antwort auf Ihre Frage:** Frühe Meldungen nicht-englischer Medien (Spanisch, Portugiesisch, Russisch u. a.) sind vorhanden und stellen einen großen Teil der Ereignisse (Einschätzung: dieser Strom ist ähnlich groß wie der unübersetzte Strom: 33.970 Ereignisse hier gegenüber ca. 296.447/288 × 59 ≈ 60.700 dort). Länder wie Brasilien kommen reichlich in den Ereignissen vor, aber nicht in den Auslösern. Ein Vergleich mit dem Top-20-Ranking (kombinierte Ströme) wurde nicht gemacht; die Top-Geschichten nach M im Übersetzungsstrom stammen häufig aus kleinen Ländermedien (z. B. Nordmazedonien/Türkei, Israel in Russisch, Ukraine, Mexiko) und wirken ohne Gewichtung nach Quellenzahl teilweise zufällig (Einschätzung, nicht systematisch geprüft).
- Skripte: `t6-translation.mjs` (Laden), `t6-analyse.mjs` (Auswertung). Hinweis: Ein Fehler im ersten Auswertungsdurchlauf (falsche Spalte für die Ereignisnummer) ergab 0 Auslöser; korrigiert (gemessen: 155).

## 7. DOC-API-Wiederholung

`scripts/gdelt-test/doc-retest.mjs` ist geschrieben (≤12 Anfragen, 15 Sekunden Pause), **nicht ausgeführt**. Start und Voraussetzungen: `docs/gdelt-test-status.md`.

## 8. Lagen (Ergänzung, Aufgabe 9)

Nur vorhandene Daten (3 Tage, 296.447 Ereignisse), Skript `scripts/gdelt-test/lagen.mjs`.

### 8.1 Felder und Länderpaar-Filter (gemessen)

- Beide beteiligten Akteure und ihre Länder stehen in den Ereignisdateien in Spalte 37 (Akteur 1: Land des Orts) und 45 (Akteur 2: Land des Orts); Namen in Spalte 6 und 16, Typen in 12 und 22; ActionGeo in 52–53. Von 296.447 Ereignissen haben **260.383 ein Land für Akteur 1, 201.720 für Akteur 2, 173.539 beide**, davon 43.238 mit verschiedenen Ländern. Der Paar-Filter greift also nur bei ca. 15 % aller Ereignisse (beide Länder verschieden).
- Gefiltert wurde nach FIPS-Länderpaar in beiden Richtungen (Akteur 1 = A und Akteur 2 = B oder umgekehrt). Geschichten = verschiedene normierte Adressen. Zeit = Eingangszeit des Ereignisses (DATEADDED).

| Lage | Länderpaar (FIPS) | Ereignisse (3 Tage) | pro Tag | Geschichten (3 Tage) | pro Tag | davon mit gkg-Titel | davon Titel-/Adress-Stichwort-Treffer |
|---|---|---|---|---|---|---|---|
| USA–Iran | US–IR | 1.327 | 442,3 | 511 | 170,3 | 92 | 232 |
| Russland–Ukraine | RS–UP | 2.305 | 768,3 | 722 | 240,7 | 162 | 482 |
| China–Taiwan | CH–TW | 96 | 32,0 | 53 | 17,7 | 5 | 29 |
| Israel–Gaza/Libanon | IS–GZ, IS–WE, IS–LE | 493 | 164,3 | 183 | 61,0 | 23 | 101 |
| USA–China | US–CH | 640 | 213,3 | 246 | 82,0 | 38 | 80 |

Gemessen. „Stichwort" siehe unten; wo kein gkg-Titel vorliegt, wurde das Stichwort in der Adresse (Text der URL) gesucht, das ist ein schwächeres Kriterium. **Nur 9 bis 22 % der Geschichten haben im Test einen Titel (gemessen)**, weil gkg nur für wenige Zeitpunkte geladen wurde. Ob bei vollem gkg-Zugriff mehr Titel vorliegen, ist offen (Annahme: ja, gkg hat zu fast jedem Artikel einen Titel).

### 8.2 Qualität: 20 zufällige Geschichten je Lage (Einschätzung)

G = gehört zur Lage, N = gehört nicht, U = unklar (auch: Text nicht lesbar, z. B. leere Adresse). Stichwörter (Auswahl, Annahme): USA–Iran: iran, tehran, hormuz, vance, irgc; Russland–Ukraine: russia, ukrain, kyiv, moscow, zelensk, putin, donbas, oleshky …; China–Taiwan: taiwan, taipei, china, beijing, strait; Israel: israel, gaza, hamas, hezbollah, lebanon, west bank, palestin…; USA–China: china, beijing, xi, tariff, nvidia, trade.

| Lage | nur Länderpaar G / U / N | Länderpaar + Stichwort G / U / N |
|---|---|---|
| USA–Iran | 7 / 6 / 7 | **16 / 4 / 0** |
| Russland–Ukraine | 8 / 6 / 6 | 13 / 6 / 1 |
| China–Taiwan | 5 / 8 / 7 | 14 / 1 / 5 |
| Israel–Gaza/Libanon | 14 / 5 / 1 | 19 / 1 / 0 |
| USA–China | 6 / 6 / 8 | 15 / 2 / 3 |

Beobachtungen (Einschätzung): Nur mit Länderpaar landen viele Meldungen aus innenpolitischen US-Themen (Midterm-Wahlen, Pentagon-Personal, Alaska-Senat), Foxconn/iPhone (China–Taiwan) und Nvidia-Spionage (USA–China) in der Lage. Das Paar-Feld meint teils Orte der Berichterstattung, nicht Beteiligte. Mit Stichwort steigt die Trefferquote deutlich; China–Taiwan und USA–China bleiben wegen Fremdthemen (Nvidia-Spion, Pakistan-Luftraum) am schwächsten. Bei Russland–Ukraine bleiben auch mit Stichwort Randthemen (Putin/Musk, Lavrov-Besuch). Wichtig: Ca. 30 % der nur-Paar-Stichproben (31 von 100) sind unklar (U), meist Adressen ohne lesbaren Text.

**5 Beispiele je Lage (Länderpaar + Stichwort, höchster M bzw. aus der Stichprobe):**
- USA–Iran: „US-Iran Deal Nears as Envoy Credits Qatar, Pakistan for Mediation Efforts"; „Iranian delegation arrives in Qatar for talks: Report"; „Iran warns US, Israel against new attacks"; „Rare White House visit by top US commander puts Trump's Iran strike options in focus"; „Vance outreach to Iran related to medical supplies, says Trump" (höchste M mit 156).
- Russland–Ukraine: „Evacuated Oleshky residents begin long journey out of Russian-occupied region" (M 323); „Evacuees from occupied Oleshky arrive in Belarus en route to Ukraine" (270); „Zelensky demands intl action after 'horrific' Russian railway strike"; „Ukraine pauses refinery strikes after Trump pressure …"; „Hundreds evacuate Ukrainian city of Oleshky under Melania Trump-brokered ceasefire".
- China–Taiwan: „Pakistan's airspace U-turn: Bans Taiwanese airlines in support of 'One-China' policy, then reverses"; „Taiwan flags obvious threat from over 30 Chinese ships"; „Taiwan suspects China behind Pakistan's brief airspace ban"; „MAC details stark Taiwan-China divide"; „China military buildup: Taiwan warns of major threat as … Chinese vessels deploy across Pacific".
- Israel–Gaza/Libanon: „Border Police, IDF seize several weapons caches in West Bank raids"; „Palestinian president says hopes for peace talks with new Israeli government"; „A week of Israel's lockdown in Hebron"; „Lebanon bets on diplomacy to avert another war amid reports of Hezbollah preparing for battle"; „Israel demolishes gunmen's homes in West Bank operation".
- USA–China: „Nvidia chief seen as target of Chinese spy plot" (M 70); „US bans imports from Chinese genomics companies over forced labour concerns"; „2 Chinese Nationals Get Prison Terms for Spying"; „US plans to ban Chinese telecom firms from direct access"; „China playing hardball with its rare earth monopoly".

(Schreibweise der Titel: gkg-Titel, bei Adressen aus dem Text der URL, daher teilweise klein und ohne Satzzeichen; hier nur lesbar umgeschrieben, nicht inhaltlich geändert.)

### 8.3 Verlauf über 3 Tage und Konflikt-Kooperations-Skala

Verlauf = Geschichten pro Stunde (Zeitpunkt der ersten Nennung, 73 Stunden):

| Lage | Stunden mit mindestens einer Geschichte | Mittel pro Stunde | Streuung (Standardabweichung) | Spanne pro Stunde |
|---|---|---|---|---|
| USA–Iran | 73 von 73 | 7,0 | 3,1 | 1 bis 18 |
| Russland–Ukraine | 73 von 73 | 9,9 | 4,9 | 1 bis 28 |
| China–Taiwan | 30 von 73 | 1,8 | 1,1 | 1 bis 5 |
| Israel–Gaza/Libanon | 61 von 73 | 3,0 | 2,2 | 1 bis 10 |
| USA–China | 67 von 73 | 3,7 | 2,1 | 1 bis 8 |

Einschätzung: Ein Stundenverlauf ist bei USA–Iran und Russland–Ukraine sinnvoll (jede Stunde belegt, mehrere Geschichten), bei Israel und USA–China mit Lücken brauchbar, bei China–Taiwan nicht (nur 30 von 73 Stunden belegt, höchstens 5 Geschichten). Dort wären Tageswerte oder gleitende Summen sinnvoller. Der Test nutzt die ungefilterte Geschichtenzahl (inklusive der Fremdthemen aus 8.2). Mit Stichwortfilter wären die Kurven kleiner und weniger rauschig, aber im Test wurde der Verlauf nur ohne Stichwort berechnet (Stichwort wäre bei Adressen ohne Titel unvollständig).

**Konflikt-Kooperations-Skala (GDELT-Goldstein-Skala, −10 bis +10, maschinell berechnet, pro Ereignis nach CAMEO-Code vergeben):**

| Lage | Mittel aller Ereignisse | Streuung | Stundenmittel, niedrigster / höchster Wert | häufigste Hauptgruppen (Ereignisse) |
|---|---|---|---|---|
| USA–Iran | 0,16 | 4,59 | −3,19 / 7,0 | 04 Beraten 424, 01 Aussagen 212, 11 Missbilligen 102 |
| Russland–Ukraine | 0,07 | 5,54 | −8,55 / 4,28 | 04 Beraten 708, 19 Kampf 313, 01 Aussagen 212 |
| China–Taiwan | −0,48 | 3,38 | −10 / 7 | 01 Aussagen 22, 04 Beraten 22 |
| Israel–Gaza/Libanon | −2,61 | 6,46 | −10 / 7,4 | 19 Kampf 139, 04 Beraten 88 |
| USA–China | 0,98 | 4,09 | −5 / 7 | 04 Beraten 208, 01 Aussagen 87 |

Einschätzung: **Als Stundenverlauf nicht tauglich** (Streuung 3 bis 6 Punkte, Stundenmittel schwanken bei dünn besetzten Lagen von −10 bis +7). Als Tagesmittel allenfalls grobe Tendenz (**maschinell berechnet, nicht redaktionell, nicht validiert**). Das Mittel für Russland–Ukraine (0,07) bildet die tatsächliche Kriegslage kaum ab, weil Konsultations- und Aussagen-Codes (positiv oder neutral) häufig sind. Die Skala taugt nach diesem Test höchstens als zusätzliche, klar als „maschinell berechnet" gekennzeichnete Kennzahl. Eine Entscheidung ist das nicht.

### 8.4 Plan-Vorschlag

Siehe `docs/plan-vorschlaege.md` (Abschnitt „Lagen"). PLAN.md wurde nicht geändert.

## 9. Was offen oder unsicher ist

- DOC- und GEO-API weiter ungetestet (Netz wechseln, `doc-retest.mjs`).
- Titelabdeckung: gkg nur für ca. 60 Zeitpunkte, dort ca. 9 bis 22 % der Geschichten (je Lage) mit Titel; Stichproben darauf beschränkt. Vollständige gkg-Abdeckung würde mehr Titel liefern (Annahme), kostet aber Datenvolumen (ca. 3 bis 7 MB gezippt je Zeitpunkt).
- Zusammenfassen: Schwelle 0,8 trennt gleiche Geschichten mit anderem Wortlaut nicht; Alternativen (Schwelle 0,5, Schlüsselwörter, Namen) nicht getestet.
- Länderfaktor „erhöht" wirkt in der Rangliste nie (0 Plätze in allen Listen). Ob die Stufe gebraucht wird, ist offen (Einschätzung: Länder dieser Stufe haben selten Geschichten mit hoher Erwähnungszahl).
- Eilmeldungs-Stichproben sehr klein (n=2 bis 20), keine belastbare Fehlalarmrate; „P" ist mein Urteil.
- Sanktionen-Thema ist mit keiner Methode sauber erfasst.
- Ereignisland: Stichprobe n=27.
- Übersetzungsstrom: nur 59 von 96 Zeitpunkten, kein Vergleich mit Top 20 kombiniert.
- Lagen: Stichproben nach Titel/Adresse, ein Teil nicht lesbar; Konflikt-Kooperations-Skala nicht validiert.
- Aus diesem Test **folgt keine Entscheidung**. Themenfilter, Takt, Ranking-Variante, Schwellen und Codes für Eilmeldungen sind weiter offen.

# GDELT-Test Runde 4: Schnell wachsende Geschichten

Stand: 01.11.2026. Offline auf vorhandenen Daten (`data/`), keine Downloads. Rechenzeit des Skripts 44 Sekunden. Es wurde nichts entschieden. **gemessen** = gezählt/berechnet, **Einschätzung** = mein Urteil, **Annahme** = vermutet.

## Zusammenfassung (Teil 1)
(Teil 2 mit Noten, Regel-Entwurf und Länderseiten steht ab der Überschrift „Teil 2".)

1. **gemessen:** Wachstum allein ist **kein enger Filter**: W1 (≥ 5 Medien nach 120 Min.) ergibt ca. **574 Geschichten/Tag**, W2 (≥ 10) ca. 252, W3 (≥ 3 nach 30 und ≥ 8 nach 120) ca. 283. Zum Vergleich D1: ca. 11–17/Tag.
2. **gemessen:** Mit lesbarem Titel bleiben 158 (W1), 74 (W2) und 81 (W3) pro Tag; nur 28 % der Geschichten haben einen lesbaren Titel (gkg liegt nicht für alle Zeitpunkte vor), das begrenzt jede Anzeige-Aussage.
3. **gemessen:** Überschneidung mit D1 gering (W1: 18 von 1.668 Geschichten), mit der Top 20 der rohen Medienzahl 7–14 %. Wachstum findet also **andere** Geschichten als Gewaltcodes und als die Rangliste.
4. **gemessen:** Brasilien kommt vor (W1: 12 Geschichten), aber im Wesentlichen als eine einzige Nachricht (Bolsonaro-Flucht, Rubio) plus Fremdtreffer; der Test enthält nur den unübersetzten Strom.
5. **Annahme:** Die Medienzahl enthält Agentur- und Netzwerk-Verbreitung (Beispiel: eine lokale Meldung aus Armagh mit 85 Medien in 120 Minuten); Wachstum misst deshalb auch Verteilung, nicht nur Bedeutung.
6. **offen:** Qualität (Ihre Beurteilung der 20 Geschichten steht aus), Schwelle, Mehrfachzählung gleicher Geschichten, nur 3 Tage (Do–So).

## 1. Wachstumsmaß (gemessen)

Je Geschichte (gleiche Adresse; danach Titel-Ähnlichkeit ≥ 0,8 mit mindestens 4 Wörtern, **nur unter Kandidaten mit ≥ 2 Medien nach 120 Minuten**, Annahme: der Rest kann die Schwellen nicht erreichen, bleibt unverändert) verschiedene Medien (Domains aus `mentions`, nur Web) kumulativ nach 30, 60 und 120 Minuten ab der ersten Nennung. Berücksichtigt: erste Nennung im Datenfenster und mindestens 120 Minuten Beobachtung (Fenster 2,91 Tage).

| Größe | Zahl |
|---|---|
| Geschichten im Fenster mit ≥ 120 Min. Beobachtung (nach Adresse) | 57.287 |
| Kandidaten (≥ 2 Medien nach 120 Min.) | 9.583 |
| nach Zusammenfassen nach Titel | 8.805 |

Skript `scripts/gdelt-test/w1-wachstum.mjs`; die 60-Minuten-Zahlen sind berechnet, aber nicht in den Varianten benutzt.

## 2. Varianten (gemessen, pro Tag; Land = häufigstes gkg-Land, sonst Aktionsland)

| Variante | Geschichten | pro Tag | hoch / erhöht / Basis / ohne Land | Land aus gkg / Aktionsland / keins | davon auch D1 | davon in Top 20 (roh) |
|---|---|---|---|---|---|---|
| W1 ≥ 5 nach 120 | 1.668 | 573,9 | 1.082 / 151 / 350 / 85 | 418 / 1.165 / 85 | 18 | 111 (6,7 %) |
| W2 ≥ 10 nach 120 | 732 | 251,9 | 496 / 49 / 159 / 28 | 201 / 503 / 28 | 9 | 100 (13,7 %) |
| W3 ≥ 3 nach 30 und ≥ 8 nach 120 | 823 | 283,2 | 555 / 61 / 170 / 37 | 219 / 567 / 37 | 12 | 94 (11,4 %) |

Anteil Basisländer: W1 21 %, W2 22 %, W3 21 %. „Überschneidung D1" = Geschichten, deren Adresse in der D1-Menge (51 Geschichten über 3 Tage, Runde 3) liegt. „Top 20 roh" = Geschichte stand an mindestens einem von 24 Zeitpunkten (alle 3 Stunden) in der Top 20 nach Medienzahl mit Alterungsabschlag; **Einschränkung:** Zwischen den Zeitpunkten kann eine Geschichte ebenfalls in der Top 20 gewesen sein, die Überschneidung ist eine Untergrenze. Die Land-Klasse „gkg" gilt nur für Geschichten mit gkg-Eintrag (25 % bei W1).

Einschätzung: Die Schwellen sind so niedrig, dass viele Alltagsmeldungen (Lokalnachrichten, Sport, Wetter) durchkommen; höhere Schwellen (W2) halbieren die Zahl, bleiben aber bei 250/Tag. Eine Anzeige „Oben in Version 1" bräuchte eine Rangfolge innerhalb der Treffer, nicht nur eine Schwelle (offen).

## 3. Nur Geschichten mit lesbarem Titel (gemessen)

Regeln: Titelbereinigung (Seitenname weg, HTML dekodiert); ausgeschlossen: leer, „article", „p", nur Adresse, zu kurz (< 3 Wörter oder < 15 Zeichen), allgemeine Seiten.

| Variante | mit lesbarem Titel | pro Tag | Anteil an der Variante | hoch / erhöht / Basis / ohne Land |
|---|---|---|---|---|
| W1 | 460 | 158,3 | 28 % | 305 / 41 / 75 / 39 |
| W2 | 214 | 73,6 | 29 % | 148 / 13 / 42 / 11 |
| W3 | 235 | 80,9 | 29 % | 161 / 17 / 43 / 14 |

**Begrenzung durch fehlende Titel (Einschätzung):** Rund 70 % der Treffer haben im Test keinen lesbaren Titel, weil gkg nur für einen Teil der Zeitpunkte vorliegt (Annahme für die Produktion: mit gkg aller 4 Zeitpunkte pro Stunde gäbe es für fast alle Geschichten einen Titel, nicht gemessen). Die Zahlen mit Titel sind daher eine **Untergrenze**; alle Aussagen zur Qualität gelten nur für die titelhaltigen Geschichten. Basisländer sind unter den titelhaltigen Geschichten seltener (16 %) als insgesamt (21 %).

## 4. Brasilien (gemessen)

Geschichten mit Aktionsland oder gkg-Land Brasilien: W1 **12**, W2 **5**, W3 **6**. Beispiele (Titel/Adresstext · Medien nach 30 / 120 Minuten):
1. Brazil summons Argentina's representative after Bolsonaro flees to the US via Argentina · 6 / 14 (Titel)
2. Rubio says the US government did not facilitate Bolsonaro's flight to US · 5 / 10 (Titel)
3. 'We didn't facilitate anything': Marco Rubio denies US role in Flavio Bolsonaro's … · 5 / 11 (Titel)
4. trump not planning to back bolsonaro s claim to be brazil s leader sources say · 2 / 5 (Adresse)
5. Fugitive illegal immigrant from Brazil arrested in Massachusetts: ICE Boston · 10 / 29 (Titel; **kein** Brasilien-Thema, nur Herkunftsland)

Einschätzung: Die Treffer drehen sich fast alle um **eine** Nachricht (Bolsonaro/Flucht), die in mehreren Geschichten auftaucht; weitere Treffer sind Fremdtreffer (z. B. „womans dry skin", Rechtsstreit in Olyphant mit gkg-Land Brasilien). Ein Brasilien-Treffer ohne Bezug zur Weltpolitik kommt also durch, ein „echtes" Brasilien-Ereignis erscheint wegen der Nur-Englisch-Quellen nur, wenn es englisch berichtet wird (Annahme; Übersetzungsstrom nicht einbezogen).

## 5. Unabhängige Beurteilung

20 zufällige Geschichten aus W1 mit lesbarem Titel (Seed 7, Pool 460) liegen in `data/gdelt-test/w1-sample20.json`. Das verdeckte Urteil des Modells liegt in `data/gdelt-test/w1-judgment-claude.json`. Die Auswertung steht unten in **Teil 2, Abschnitt 1**.

## Offene Punkte und Grenzen
- Zusammenfassen nur unter Kandidaten (Annahme), Titel-Merge bei 0,8; verschiedene Wortlaute bleiben getrennt (siehe Runde 3, Abschnitt 3), die Zahlen sind daher eher zu hoch.
- Medien = Domains im Mentions-Feld; Netzwerke/Agenturen zählen mehrfach (Annahme, nicht gemessen).
- Land-Zuordnung gemischt (gkg-Land nur für 25 %).
- Nur Do–So, keine Wochentagswirkung; nur unübersetzter Strom.


---

# Teil 2: Nutzernoten, Merkmale, Regel-Entwurf, Länder-/Regionenseiten

Stand: 01.11.2026, offline, keine Downloads, Rechenzeit der Skripte je unter 1 Minute. **gemessen** / **Einschätzung** / **Annahme** wie oben. Es wurde nichts entschieden.

## Zusammenfassung (Teil 2)

1. **gemessen:** Meine Einschätzung und die Noten des Nutzers stimmen bei 19 Geschichten in der Dreier-Einteilung zu 10 von 19 (53 %) überein, bei „wichtig oder nicht" zu 16 von 19 (84 %); Rangkorrelation 0,47. Der Nutzer war bei Lokalkrimi/-politik großzügiger (Noten 5), ich bei Diplomatie/Medienfreiheit (Nr. 3, 20).
2. **gemessen (n = 19, nur beschreibend):** Höhere Noten gehen mit mehr Medien nach 30 Minuten einher (Mittel 8,0 gegen 5,1 bei Note ≤ 2); die Domain-Endungen trennen **nicht** (Korrelation −0,17). Das Kürzel ARMEDCONFLICT steht bei 4 von 4 hohen, aber auch bei 4 von 8 niedrigen Noten; MILITARY nur bei hohen.
3. **Regel-Entwurf v0** (Positivthemen/-wörter, Negativliste, ≥ 5 Medien nach 120 Minuten): hält 3 von 7 Geschichten mit Note ≥ 5 und lässt 6 von 8 mit Note ≤ 2 wegfallen; Pool 460 → 195 (158 → 67 pro Tag). **Nicht belegt:** Die Negativwörter habe ich teils aus den 19 Beispielen abgeleitet (siehe Abschnitt 3), das Ergebnis auf den 19 ist deshalb zu günstig.
4. **Liste 2** (40 Geschichten, Seed 11) liegt in `docs/bewertung-liste-2.md`, mein Urteil und das Regelergebnis verdeckt in `data/gdelt-test/liste2-verdeckt.json`.
5. **Länderseiten gemessen machbar:** pro Tag mit lesbarem Titel Iran 96, Israel 107, Russland 130, Ukraine 86, China 94, Südkorea 26, Nordkorea 21, Brasilien 17, Taiwan 15 (USA 1.282, braucht Rangfolge). Partnerländer aus den Akteursfeldern plausibel (Iran: USA 1.327, Israel 575, Katar 386).
6. **Lagen-Paare:** Nordkorea–Südkorea 19 von 20 passend (nur Adresstexte), Iran–Israel–USA 15 von 20 (Titel, 5 unklar). **Städte:** 58 % der Artikel haben eine Stadt, aber 2 von 5 Beispielen sind falsch/mehrdeutig (Einschätzung).
7. **Grenzen:** Alle Stichproben klein, Noten eines Nutzers, Titelabdeckung begrenzt, nur Do–So.

## 1. Vergleich mit den Noten des Nutzers

Noten in `data/gdelt-test/user-ratings.json` gespeichert (nicht im Git; Nr. 7 ohne Note, Bereiche als Mittelwert). Umrechnung: ≥ 6 = P, 3 bis < 6 = U, < 3 = N. Mein Urteil (zuvor verdeckt, breite Definition) aus `w1-judgment-claude.json` freigegeben.

| Verteilung (n = 19) | P | U | N |
|---|---|---|---|
| Noten des Nutzers (umgerechnet) | 4 | 7 | 8 |
| mein Urteil | 5 | 6 | 8 |

**Übereinstimmung (gemessen):** Dreier-Einteilung **10 von 19 = 53 %**; „passt" gegen „nicht passt" **16 von 19 = 84 %**; Spearman-Korrelation zwischen Noten und meinem Urteil (N = 0, U = 1, P = 2) **0,47**.

**Abweichungen (9):**
1. Nr. 1 „Labor doubles free dentist pledge to ease poll pain": Note 5 (U), ich N.
2. Nr. 2 „Met Police make first arrests of pro-Palestine Action demonstrators …": Note 6 (P), ich U.
3. Nr. 3 „Carney, EU official push Canada associate membership, wider alliance": Note 3 (U), ich P.
4. Nr. 4 „Alaska's governor orders probe into Democratic candidate over Dan Sullivan ballot controversy": Note 2 (N), ich U.
5. Nr. 8 „An ICE officer is charged with assault for striking a man with a car in Houston": Note 5 (U), ich N.
6. Nr. 11 „Shooting at Spirit Halloween store in California …": Note 5 (U), ich N.
7. Nr. 14 „Pickering nuclear shutdown: Will Ontario energy prices rise?": Note 1 (N), ich U.
8. Nr. 17 „Alaska governor orders investigation into 'Dan Sullivan' ballot controversy": Note 1 (N), ich U.
9. Nr. 20 „Russia's top independent newspaper shuts down …": Note 4,5 (U), ich P.

Einschätzung: Der Nutzer bewertet Lokalkrimi und lokale Politik mit 5 (Nr. 1, 8, 11), die ich als „passt nicht" geführt hatte; die Unterschiede betreffen die Mitte der Skala („unklar"), nicht die Spitze. Die Nr. 4 und 17 sind dieselbe Nachricht und bekamen Note 2 und 1; das zeigt die Schwankung der Noten von ±1. Bei „P" stimmen wir bei Nr. 6, 10, 15 überein; Nr. 2 sieht der Nutzer als wichtiger (6), Nr. 3 und 20 sieht er als weniger wichtig (3 und 4,5) als ich.

**Belastbarkeit:** gering. n = 19; die Noten sind die eines Nutzers; die Grenzen (3 und 6) sind festgelegt, nicht gemessen; kleine Unterschiede in den Noten (5 gegen 6) kippen die Einteilung.

## 2. Welche Merkmale hängen mit den Noten zusammen? (nur beschreibend, n = 19)

Merkmale je Geschichte: Medien nach 30 und 120 Minuten, Zahl verschiedener Domains (alle Mentions), Zahl verschiedener Domain-Endungen (letzter Teil der Domain, grobe Näherung für internationale Streuung, **Annahme, nicht geprüft**; `.co.uk` zählt als `uk`), gkg-Themenkürzel, Ereignisland.

| Gruppe | n | Mittel Medien 30 Min. | Medien 120 Min. | Domains | Endungen |
|---|---|---|---|---|---|
| Note ≥ 6 | 4 | 8,0 | 32,3 | 75,0 | 2,3 |
| Note 3 bis < 6 | 7 | 4,7 | 20,4 | 68,0 | 2,7 |
| Note ≤ 2 | 8 | 5,1 | 17,9 | 29,1 | 2,6 |

Pearson-Korrelation mit der Note (n = 19): Medien 30 Min. 0,38; Medien 120 Min. 0,23 (logarithmiert 0,45); Domains 0,24; **Endungen −0,17**. Einschätzung: Wachstum hängt schwach mit der Note zusammen; die Endungen haben in dieser Stichprobe keinen erkennbaren Nutzen (die irische Lokalmeldung Nr. 19, Note 1, hat 85 Medien und 4 Endungen, wahrscheinlich Agenturverteilung, Annahme).

**Themenkürzel (ohne TAX_FNCACT/WB/EPU/UNGP):** bei Note ≥ 6 (4 Geschichten): ARMEDCONFLICT 4, MILITARY 3, GENERAL_GOVERNMENT 3, CRISISLEX_C07_SAFETY 3. Bei Note ≤ 2 (8 Geschichten): MEDIA_SOCIAL 5, USPEC_POLITICS_GENERAL1 4, EDUCATION 4, ARMEDCONFLICT 4, ELECTION 4, CRISISLEX_C07_SAFETY 4. Einschätzung: ARMEDCONFLICT trennt nicht (steht auch bei der Hälfte der niedrig bewerteten, z. B. Wahlkampf- und Lokalmeldungen); MILITARY kommt nur bei den hohen Noten vor (die Liste der Kürzel je Geschichte war auf 14 begrenzt, daher knapp belegt). EDUCATION, ELECTION und USPEC_POLITICS_GENERAL1 stehen eher bei niedrigen Noten. Ereignisland bei Note ≥ 6: China, Afghanistan, Nordkorea, Israel; bei Note ≤ 2: USA (3-mal), Türkei, Kanada, Indien, Irland, ohne Land.
Nur beschreibend, **keine Aussage über Ursachen**; die Gruppe „Note ≥ 6" hat nur 4 Geschichten (3 verschiedene Ereignisse).

## 3. Regel-Entwurf v0 „wichtig"

**Welche Themenkürzel es gibt (gemessen, 20 unübersetzte gkg-Zeitpunkte, 23.459 Artikel, 6.144 verschiedene Kürzel):** Es gibt **kein** Kürzel für Sport oder Unterhaltung (nur Personenrollen wie `TAX_FNCACT_SPORTSMAN`, 2 Treffer). Kriminalität gibt es als `SOC_GENERALCRIME` (1.954), `ARREST` (1.747), `KILL` (3.537), `CRIME_ILLEGAL_DRUGS` (262), `KIDNAP` (192), `CRIME_COMMON_ROBBERY` (155), `CRIME_CARTELS` (87), `UNGP_CRIME_VIOLENCE` (1.798). Positive Kürzel mit Zahlen: `ARMEDCONFLICT` 2.548, `WB_698_TRADE` 1.914, `ECON_STOCKMARKET` 1.119, `MILITARY` 953, `ECON_INFLATION` 716, `NEGOTIATIONS` 599, `TERROR` 596, `ECON_INTEREST_RATES` 512, `CYBER_ATTACK` 463, `BORDER` 447, `SANCTIONS` 327, `ECON_OILPRICE` 271, `ECON_CENTRALBANK` 257, `CEASEFIRE` 194. Sport, Lifestyle, Unterhaltung und lokale US-Politik lassen sich daher **nur über Titelwörter** ausschließen.

**Regel v0 (Skript `w1-regel.mjs`, erklärbar):**
1. Wachstum: mindestens 5 Medien nach 120 Minuten (W1).
2. **Ausschluss** bei Negativwort im Titel (u. a. arrest(ed), charged, murder, shoot*, police, trial, lawsuit, sentenced, crash, dies, nhl/nfl/football/tennis/…, wins, season, movie, actor, singer, celebrity, theatre, halloween, deal(s), sale, recipe, skin, beauty, fashion, travel, wedding, sandwich, dentist, school, teacher, mayor, governor, county, ballot, candidate, campaign, poll, pledge, midterm) **außer** der Titel enthält zugleich ein starkes Positivwort (war, missile, drone, air strike, ceasefire, nuclear, sanctions, tariff, NATO, military, invasion, coup, embargo); ebenso bei Negativthema (`SOC_GENERALCRIME`, `ARREST`, `CRIME_*`, `KIDNAP`, `TOURISM`, `SOC_SUSPICIOUSACTIVITY`) ohne Positivthema/-wort.
3. **Aufnahme** nur bei Positivthema (u. a. `NEGOTIATIONS`, `CEASEFIRE`, `SANCTIONS`, `ALLIANCE`, `ECON_TRADE_DISPUTE`, `WB_698_TRADE`, `ECON_STOCKMARKET`, `ECON_CENTRALBANK`, `ECON_INTEREST_RATES`, `ECON_INFLATION`, `ECON_OILPRICE`, `TERROR`, `MILITARY`, `BORDER`, `CYBER_ATTACK`, `POLITICAL_TURMOIL`, `ENV_OIL`, `ENV_NATURALGAS`; `ARMEDCONFLICT` nur zusammen mit `MILITARY`) oder Positivwort im Titel (u. a. war, missile, drone, talks, summit, treaty, sanctions, tariff, NATO, foreign minister, diplomat, ambassador, G20, OPEC, central bank, ECB, Fed, inflation, interest rate, Wall Street, stock market, GDP, trade deal, military, troops, Hormuz, Pentagon, Kremlin; deutsch: Krieg, Waffenruhe, Gipfel, Sanktion, Zölle, Notenbank, Börse).
4. Variante „+ Endungen": zusätzlich mindestens 3 verschiedene Domain-Endungen.

**Wichtig:** Das ist ein **Entwurf**, nicht auf die 19 Noten optimiert. **Aber:** Einige Negativwörter (dentist, sandwich, pledge, poll, halloween, ICE-/Polizeibegriffe) habe ich gewählt, nachdem ich die 19 Titel gesehen hatte. Das Ergebnis auf den 19 ist deshalb **zu günstig**; die Prüfung muss an Liste 2 erfolgen.

**a) Auf den 19 bewerteten Geschichten (gemessen):**

| Regel | Note ≥ 5: bleiben | Note ≤ 2: fallen weg |
|---|---|---|
| v0 | 3 von 7 (Nr. 6, 10, 15) | 6 von 8 (es bleiben Nr. 14 Pickering und Nr. 16 BJP) |
| v0 + Endungen ≥ 3 | 1 von 7 (Nr. 10) | 7 von 8 (es bleibt Nr. 16) |

Fallen weggelassen bei Note ≥ 5: Nr. 1 (Labor/poll), 2 (Police), 8 (charged), 11 (shooting), jeweils durch Negativwort. Mittlere Note der 7 behaltenen Geschichten: 4,5 (alle 19: 3,7). Die Endungen-Bedingung verschlechtert das Ergebnis (verliert Nr. 6 und 15, hohe Noten, mit 1 bis 2 Endungen).

**b) Auf den ganzen W1-Pool mit lesbarem Titel (460, 158 pro Tag; gemessen):**

| Stand | Geschichten | pro Tag | hoch / erhöht / Basis / ohne Land |
|---|---|---|---|
| vorher (W1, lesbar) | 460 | 158 | 305 / 41 / 75 / 39 |
| nach v0 | 195 | 67,0 | 131 / 16 / 44 / 4 |
| nach v0 + Endungen ≥ 3 | 105 | 36,1 | 69 / 14 / 20 / 2 |

Ausschlussgründe bei v0 (460 → 195): Negativwort 114, kein Positivthema/-wort 114, Negativthema ohne Positiv 37. Einschätzung: Die Regel halbiert den Pool, 67 pro Tag sind für eine Startseite noch viel; Basisländer bleiben mit 23 % repräsentiert. Qualität der behaltenen Geschichten wurde **nicht** an einer unabhängigen Stichprobe geprüft (das ist Zweck von Liste 2).

## 4. Bewertungsliste 2

`docs/bewertung-liste-2.md`: 40 zufällige Geschichten aus dem W1-Pool (Pool 440 ohne die 20 aus Liste 1, lesbarer Titel, gleiche Geschichten zusammengefasst, Seed 11), mit Titel, Land, Medien nach 30/120 Minuten, ohne Urteil und ohne Regelergebnis. Mein Urteil (Note 0 bis 10) und das Regelergebnis liegen verdeckt in `data/gdelt-test/liste2-verdeckt.json` (nicht im Git). Die Bewertung durch den Nutzer und der Vergleich stehen aus.

## 5. Länder- und Regionenseiten: Machbarkeit

**a) Geschichten pro Tag** (Geschichten nach Adresse, 2,99 Tage; „lesbar" = gkg-Titel vorhanden und lesbar; Filter nach Ereignisland, in Klammern nach beteiligten Akteursländern; gemessen):

| Land | Geschichten pro Tag (Ereignisland) | davon mit lesbarem Titel | Akteursland: pro Tag / lesbar |
|---|---|---|---|
| Iran | 541 | 96 | 596 / 108 |
| Israel | 669 | 107 | 710 / 115 |
| USA | 7.382 | 1.282 | 7.554 / 1.305 |
| Russland | 658 | 130 | 723 / 146 |
| Ukraine | 417 | 86 | 470 / 99 |
| China | 618 | 94 | 669 / 101 |
| Taiwan | 66 | 15 | 72 / 15 |
| Nordkorea | 119 | 21 | 126 / 23 |
| Südkorea | 170 | 26 | 189 / 29 |
| Brasilien | 126 | 17 | 138 / 18 |

Einschätzung: Der Filter nach Akteursland bringt nur 7 bis 13 % mehr Geschichten als das Ereignisland. Für Iran, Israel, Russland, Ukraine, China reichen die Zahlen für eine Länderseite (90 bis 130 pro Tag mit Titel), aber die Seite braucht eine Rangfolge (nicht jede Meldung ist wichtig). Für die USA sind es über 1.000 pro Tag, ohne Rangfolge nicht darstellbar. Taiwan, Nordkorea, Südkorea und Brasilien haben nur 15 bis 26 Geschichten mit Titel pro Tag; der Titelanteil beträgt überall nur etwa 17 bis 19 % (gkg-Abdeckung im Test, Annahme für die Produktion: höher).

**b) Häufigste Partnerländer** (aus Akteur 1 und Akteur 2 mit Land; Zahl = Ereignisse in 3 Tagen, gemessen; nur Ereignisse mit zwei verschiedenen Ländern):

| Land | Top 5 Partner |
|---|---|
| Iran | USA 1.327, Israel 575, Katar 386, Saudi-Arabien 278, Pakistan 206 |
| Israel | USA 729, Iran 575, Vereinigtes Königreich 343, Westjordanland 263, Katar 232 |
| USA | Iran 1.327, Russland 1.019, Israel 729, China 640, Ukraine 548 |
| Russland | Ukraine 2.305, USA 1.019, China 263, Iran 144, Japan 139 |
| Ukraine | Russland 2.305, USA 548, Türkei 144, Belarus 123, Iran 118 |
| China | USA 640, Russland 263, Deutschland 247, Philippinen 177, Japan 101 |
| Taiwan | China 96, USA 53, Pakistan 30, Japan 24, St. Lucia 16 |
| Nordkorea | Südkorea 270, Russland 87, China 80, USA 67, Schweiz 63 |
| Südkorea | Nordkorea 270, Japan 175, USA 125, China 74, Deutschland 61 |
| Brasilien | USA 470, Argentinien 195, Ecuador 25, El Salvador 16, Indien 15 |

Einschätzung: Die Paare sind inhaltlich plausibel; einzelne Partner sind Einzelereignisse (Schweiz bei Nordkorea: Besuch des Schweizer Außenministers; St. Lucia bei Taiwan: Besuch eines Premierministers). Die Zahlen zählen Ereignisse (nicht verschiedene Geschichten); nur ca. 58 % der Ereignisse haben beide Länder.

**c) Lagen-Paare mit Stichwortliste (je 20 zufällige, Einschätzung nach Titel; G = gehört zur Lage, U = unklar, N = gehört nicht):**
- **Nordkorea–Südkorea** (Länderpaar KN–KS und Stichwort north/south korea, pyongyang, seoul, kim jong, dmz, korean …): 50 Geschichten (16,7 pro Tag), davon nur 9 mit lesbarem Titel. Stichprobe aus allen (großteils Adresstext): **G 19, U 1, N 0** (Unklar: „Swiss foreign minister completes North Korea diplomatic trip"). Mehrere Einträge sind dieselbe Nachricht (Raketenstart, Drohnen-Ausstellung).
- **Iran–Israel–USA** (Länderpaare IR–IS oder IR–US und Stichwort iran*, tehran, hormuz, khamenei, irgc, „israel strike/attack/forces", „us-israel"): 296 Geschichten (99 pro Tag), davon 67 mit lesbarem Titel. Stichprobe aus den lesbaren: **G 15, U 5, N 0** (Unklar: Iran–Europa-Warnung, israelische Wahl mit Iran-Bezug, Zivilschutz, „Carrot-and-stick").
Belastbarkeit: n = 20 je Lage; Titel nur für einen Teil; Einschätzung von mir.

**d) Städte in gkg (V2Locations; gemessen an 5 gkg-Zeitpunkten, 4.194 Artikel):** 2.445 Artikel (**58,3 %**) nennen mindestens eine Stadt (Typ 3 US-Stadt, Typ 4 Weltstadt); von 39.019 Ortsangaben sind 11.697 Städte (**30,0 %**; Typen: Länder 21.005, US-Bundesstaaten 5.822, US-Städte 4.539, Weltstädte 7.158, Bundesländer/Regionen 490). Bei 86,4 % der Stadtnennungen liegt die Stadt im häufigsten Land des Artikels (Plausibilitätsmaß, kein Beweis).
5 Beispiele (zufällig, Einschätzung):
1. „Relatives of missing Laventille woman accuse Tobago cops …" → Port-of-Spain, Trinidad und Tobago: passt.
2. „ICE Arrests in Salinas, Seaside Spark Monterey Concern" → Sonoma, Monterey County, Kalifornien: Monterey passt, **Sonoma** ist Fehler.
3. „Arab News | Incoming: Big-screen winter wonders" → Chani, Chabarowsk, Russland: **falsch** (Treffer aus Namen).
4. „Alphabet shares suffer worst-ever single-day fall …" → Washington, Washington, USA: **mehrdeutig/vermutlich falsch** (Bundesstaat statt Hauptstadt oder Börse).
5. „Vilakazi's confidence grows as Soweto Derby beckons" → Soweto, Südafrika: passt.
Einschätzung: Städte sind in gkg vorhanden, aber mit Verwechslungen (Namen, Mehrdeutigkeit). Eine Stadtseite ohne Prüfung wäre in 2 von 5 Beispielen fehlerhaft; ein Filter müsste mehrere Nennungen verlangen. Orte der Ereignisse (ActionGeo) mit Stadt wurden hier nicht ausgewertet.

**Was nicht geht (ehrlich):** Regionenseiten wurden nicht getestet (nur Länder); Städte sind unsauber; für Brasilien fehlen Portugiesisch-Quellen im Test (nur unübersetzter Strom); Titelabdeckung (ca. 17–19 %) begrenzt alle Titelzahlen; die USA brauchen eine Rangfolge; Iran–Israel–USA ist eine Lage mit Stichwortliste, deren Pflege offen ist.

## Offene Punkte (Teil 2)
- Bewertung der Liste 2 durch den Nutzer und Vergleich mit Regel und mit meinem Urteil.
- Regel v0 nicht an unabhängiger Stichprobe geprüft; Negativwörter teils aus den 19 Beispielen.
- Noten eines Nutzers, n = 19 bzw. 40; Schwankung ±1 bei gleichen Nachrichten.
- Nur Do–So, nur unübersetzter Strom, begrenzte Titelabdeckung.

---

# Teil 3: Nachtlauf, gkg eines vollen Tages (Titelabdeckung)

Stand: 02.11.2026. **gemessen** / **Einschätzung** / **Annahme** wie oben. Es wurde nichts entschieden, die Liste 2 des Nutzers wurde nicht bewertet.

## Zusammenfassung (Teil 3)

1. **gemessen:** Für die 96 Zeitpunkte des letzten vollen Tages (31.10. 04:30 bis 01.11. 04:15 UTC) wurden 54 fehlende gkg-Dateien nachgeladen (ohne translation.gkg); 0 Fehler, 0 Wiederholungen nötig, kein http-Fallback. Der Tag ist jetzt vollständig (96 von 96).
2. **gemessen:** Die **Titelabdeckung** der Geschichten dieses Tages steigt von 34 % (Titel aus 56 gkg-Zeitpunkten, so wurde in den früheren Auswertungen gerechnet) über 45 % (alle 92 vorhandenen) auf **99 %** (alle 146).
3. **gemessen:** Mit Titeln pro Tag: W1 337 (von 339), W2 147 (von 148), W3 163 (von 164), D1 8,4 (von 8,4) statt zuvor 183 / 93 / 97 / 2,1.
4. **gemessen:** Die Top 20 der rohen Medienzahl hat 75 % lesbare Titel; die fehlenden 25 % sind Geschichten, die vor dem Tag begannen (deren gkg liegt am Vortag).
5. **gemessen:** Lagen pro Tag mit Titel: USA–Iran 123, Russland–Ukraine 131, Israel–Gaza/Libanon 32, Nordkorea–Südkorea 12, USA–China 9, China–Taiwan 4, Iran–Israel–USA 146 (jeweils fast 100 % der Lage).
6. **Korrektur (gemessen):** Die früheren Titelzahlen (9–25 %) waren zu niedrig, weil mein Titel-Lader nur 56 der 92 damals vorhandenen gkg-Zeitpunkte nutzte (Liste aus dem Protokoll). Mit allen 92 hätte der Tag 45 % gehabt.
7. **Einschränkung:** Der Tag ist ein Samstag (Sonntag früh), also ein ruhiger Tag; die Tageszahlen sind niedriger als die Drei-Tages-Mittel aus Teil 1 und 2.

## 1. Download (gemessen)

Skript `scripts/gdelt-test/w2-gkg-tag.mjs`. Vorher: 47 GB frei (Grenze 5 GB), Rohdaten 440 MB. Geladen: 54 gkg-Dateien von data.gdeltproject.org (https), mindestens 5 Sekunden Pause, nacheinander, Dauer ca. 6 Minuten (04:35 bis 04:41 UTC). Fehlschläge: keine; übersprungene Dateien: keine. Rohdaten danach **570 MB** (Grenze 1,3 GB); Anfragezähler im Skript-Zähler 854 (die eigene Obergrenze 800 habe ich für diesen Lauf auf 920 gesetzt). Keine Übersetzungsdateien, keine DOC- oder GEO-API.

## 2. Titelabdeckung des letzten vollen Tages (gemessen)

Geschichten nach Adresse mit erster Nennung im Tag (12.586); „lesbarer Titel" = gkg-Titel vorhanden, nach Bereinigung mindestens 3 Wörter und nicht „article"/„p"/allgemeine Seite.

| Stand der gkg-Zeitpunkte | gkg-Zeitpunkte im Tag | alle Geschichten mit Titel | Geschichten mit ≥ 3 Medien mit Titel |
|---|---|---|---|
| frühere Auswertungen (Protokoll-Liste, 56 im Datenfenster) | 31 von 96 | 4.288 = **34,1 %** | 646 von 1.658 = 39,0 % |
| vor dem Nachtlauf, alle vorhandenen (92) | 42 von 96 | 5.683 = **45,2 %** | 769 = 46,4 % |
| **nach dem Nachtlauf (146)** | **96 von 96** | 12.466 = **99,0 %** | 1.648 = **99,4 %** |

Einschätzung: Das Ergebnis bestätigt die Annahme aus der Planung, dass mit gkg aller Zeitpunkte fast jede Geschichte einen Titel hat. Die verbleibenden ca. 1 % sind Geschichten ohne gkg-Zeile oder mit unlesbarem Titel. **Annahme:** Das gilt für den unübersetzten Strom; für nicht-englische Quellen (translation.gkg) wurde es nicht gemessen.

## 3. Zählungen pro Tag mit lesbarem Titel (gemessen, letzter Tag)

Wachstumsvarianten wie in Teil 1 (Geschichten nach Adresse, Titel-Zusammenfassung ≥ 0,8 unter Kandidaten, erste Nennung bis 2 Stunden vor Tagesende); Tageszahlen auf den Zeitraum des Tages umgerechnet (22 Stunden Fenster für W, 23 für D1).

| Variante | Geschichten pro Tag | davon mit Titel: frühere Auswertung | vor Nachtlauf | **nach Nachtlauf** |
|---|---|---|---|---|
| W1 (≥ 5 Medien nach 120 Min.) | 339 | 183 (50,9 %) | 210 (58,6 %) | **337 (99,3 %)** |
| W2 (≥ 10 nach 120) | 148 | 93 (58,3 %) | 105 (66,0 %) | **147 (99,3 %)** |
| W3 (≥ 3 nach 30 und ≥ 8 nach 120) | 164 | 97 (54,7 %) | 109 (62,3 %) | **163 (99,3 %)** |
| D1 (Gewaltcodes, Runde 3) | 8,4 | 2,1 | 2,1 | **8,4** |
| Top 20 der rohen Medienzahl (8 Zeitpunkte, 160 Einträge) | 20 je Zeitpunkt | 72,5 % mit Titel | 74,4 % | **75,0 %** |

Zu den Top 20: Von den 160 Einträgen hatten 34 keinen gkg-Titel, **alle 34** sind Geschichten mit erster Nennung **vor** dem Tagesbeginn (gemessen, deren gkg liegt am Vortag); weitere 6 Titel sind nach der Bereinigung unlesbar. Würde man den Vortag ebenfalls laden, stiege der Anteil weiter (nicht gemessen).

Einschätzung: **Die Titelbegrenzung aus Teil 1 war ein Messartefakt.** Mit vollständigem gkg bleiben die Wachstums-Varianten bei ca. 337 (W1), 147 (W2), 163 (W3) Geschichten pro Tag, also weiter viele; D1 hat an diesem Tag nur 8,4 Auslöser, alle mit Titel (3 Tage Mittel in Runde 3: ca. 17). Die Tageszahlen von Samstag sind niedriger als die Drei-Tages-Mittel (W1 574 pro Tag in Teil 1, Do–So); der Unterschied kann Wochenende sein (Annahme, ein einzelner Tag). Die Regel v0 (Teil 2) und die Qualität der Treffer wurden hier **nicht** neu bewertet.

## 4. Lagen: Geschichten pro Tag mit Titel (gemessen, Paar und Stichwort wie in Teil 2)

| Lage | Geschichten pro Tag (Tag) | davon mit Titel: frühere Auswertung | vor Nachtlauf | **nach Nachtlauf** |
|---|---|---|---|---|
| USA–Iran | 124,3 | 42,4 (40,4 %) | 61,6 (55,0 %) | **123,3 (99,2 %)** |
| Russland–Ukraine | 131,4 | 58,6 (51,8 %) | 75,8 (65,8 %) | **131,4 (100 %)** |
| China–Taiwan | 4,0 | 1,0 | 2,0 | **4,0 (100 %)** |
| Israel–Gaza/Libanon | 32,3 | 8,1 (32,0 %) | 10,1 (38,5 %) | **32,3 (100 %)** |
| USA–China | 9,1 | 3,0 (42,9 %) | 5,1 (62,5 %) | **9,1 (100 %)** |
| Nordkorea–Südkorea | 12,1 | 5,1 (45,5 %) | 5,1 (45,5 %) | **12,1 (100 %)** |
| Iran–Israel–USA | 146,5 | 49,5 (41,2 %) | 70,7 (55,1 %) | **145,5 (99,3 %)** |

„Pro Tag" = Geschichten nach Adresse mit erster Nennung im Tag (Länderpaar in den Akteursfeldern und Stichwort im Titel; ohne Titel im Adresstext; mit vollständigem gkg werden die Stichwörter fast nur noch im Titel geprüft, deshalb steigen die Gesamtzahlen von 104 auf 123 bei USA–Iran). Die Zahlen sind **Geschichten nach Adresse, nicht zusammengefasste Ereignisse**: Gleiche Nachrichten mit anderem Wortlaut (z. B. mehrere Nordkorea-Raketenmeldungen) zählen mehrfach. Verschiedene Ereignisse pro Tag sind kleiner (nicht gemessen). **China–Taiwan** hat an diesem Tag nur 4 Geschichten, die Lage ist auch mit Titeln dünn (Einschätzung: die Lage braucht Tageswerte). Die Qualität der Titel-Stichwort-Treffer (Teil 2) wurde nicht neu beurteilt.

## 5. Grenzen und offene Punkte
- Ein einzelner Tag (Samstag/Sonntag früh), nicht repräsentativ für die Woche.
- Nur unübersetzter Strom; Brasilien u. a. nicht-englische Quellen bleiben ungeprüft.
- Titel sind gkg-Titel; die Qualität der Titel (Seitennamen, Kürzungen) ist in Teil 2/Runde 3 behandelt, hier nur die Abdeckung.
- Die früheren Auswertungen (Runde 3, Teil 1 und 2 von Runde 4) bleiben mit den damaligen Titelzahlen stehen; sie waren durch die Titel-Liste (56 Zeitpunkte) zu niedrig, die Aussagen über Anteile „mit Titel" sind überholt, die Aussagen über Auslöser- und Wachstumszahlen ohne Titelbedingung nicht.

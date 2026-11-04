# GDELT-Test Runde 3: Bericht

Stand: 01.11.2026. **Komplett offline** auf den bereits vorhandenen Daten (kein Download, keine Anfrage an einen Server). Es wurde **nichts entschieden**, `PLAN.md` und `DESIGN.md` sind unverändert.

- **gemessen** = aus den Daten gezählt oder berechnet.
- **Einschätzung** = mein Urteil (Modell), meist nur nach Titel oder Adresse-Text, nicht belastbar wie eine Messung.
- **Annahme** = vermutet oder nicht geprüft.

## Zusammenfassung (≤10 Zeilen)

1. **Eilmeldung (gemessen, Urteile Einschätzung):** Eine Ausschlusswortliste, in einer Entwicklungsmenge abgeleitet und unverändert auf eine getrennte Prüfmenge angewendet, senkt den Fehlalarm („passt nicht") in allen drei Varianten von 35–43 % auf 15–19 %, ohne echte Treffer zu verlieren (0 von 31). Die Zahl der Auslöser sinkt um 19–36 %.
2. **Nicht belegt:** Die Intervalle vor und nach dem Filter überlappen sich in allen drei Varianten, der Rückgang ist allein nicht statistisch abgesichert. Der Anteil „unklar" bleibt hoch (55–65 % „unklar oder falsch" nach Filter), weil viele Geschichten nur eine Adresse ohne lesbaren Text haben. Die Konfidenzintervalle sind breit (z. B. 8–37 %). D1 hat je Menge nur 24–27 Geschichten, die geforderten 40 sind nicht erreichbar.
3. **Titel:** 10,3 % der gkg-Titel tragen einen Seitennamen, 1,9 % würde ich verwerfen (gemessen). HTML-Reste sind kaum noch vorhanden (2 von 57.252).
4. **Zusammenfassen:** Schwellen 0,5 bis 0,8 erzeugen in der Stichprobe 0 falsche Zusammenführungen von 40 beurteilten (Intervall bis 9 %), 0,5 fasst mehr zusammen (37 statt 22 Zusammenführungen im Pool). Doppelungen in der Top 20 bleiben auch bei 0,5 (ca. 5 überzählige Einträge).
5. **Sanktionen/Märkte:** Stichwortliste für Sanktionen trifft ca. 145 Geschichten/Tag, 11 von 20 passend (34–74 %). Märkte: 29 % der Treffer sind per Muster Einzelaktien, in Wirklichkeit ca. 50 % (Stichprobe), der Filter senkt das auf 20 %, verliert aber ca. 3 von 20 echte Marktmeldungen.
6. **Länderfaktor:** Faktoren ersetzen im Mittel 3,2 von 20 Plätzen; sie **verdrängen** Basisländer (im Mittel 1,3 mit, 2,2 ohne Faktoren) und „ohne Land"/Irland/Guyana/Australien, zugunsten von UK und USA. Die Stufe „erhöht" ändert höchstens 1 Platz an 3 von 12 Zeitpunkten.
7. **Lagen:** Länderpaar plus verfeinertes Stichwort: 16–20 von 20 passend (China–Taiwan nur 11 Fälle in der Prüfmenge); Stichwort allein 7–13 von 20. Mengenüberlappung nur 21–55 %.
8. **Laufzeit:** Hochrechnung (Annahmen!) ergibt bei 60-Minuten-Takt 1.085–1.440 Min./Monat ohne gkg und ca. 1.440–2.160 mit gkg (Guthaben laut PLAN.md ca. 2.000). Mit Übersetzungs-gkg ca. 2.880.
9. **Offen:** Titelabdeckung (gkg für alle 4 Zeitpunkte je Lauf nötig), DOC-API, Stichproben klein, alle Urteile sind meine.
10. MVP-Entwurf und Datenbankentwurf: `docs/mvp-vorschlag.md` (nur Text).

---

## 0. Rahmen und Entscheidungen

| Punkt | Wert |
|---|---|
| Netz | **keine Anfragen** in dieser Runde (gemessen: kein Zugriff auf einen Server, Zugriff nur auf `data/` im Cache) |
| Zufall | feste Zufallszahlen (Hash der Adresse bzw. fester Seed), Ergebnisse reproduzierbar |
| Beurteilung | P/U/N bzw. G/U/N sind **Einschätzung** des Modells. „unklar" zählt nie als „passt" |
| Titel | echte gkg-Titel, wo vorhanden (nur für ca. 90 gkg-Zeitpunkte, Anteil an den Geschichten je nach Thema 9–25 %); sonst Text der Adresse |

Entscheidungen (jeweils die vorsichtigere Variante): (1) Fehlalarm wird als Anteil „passt nicht" angegeben und zusätzlich „passt nicht + unklar". (2) Wo die verlangte Stichprobengröße nicht erreichbar war (D1 je Menge 24–27, China–Taiwan in der Prüfmenge 11 Treffer „beide"), wurden alle vorhandenen beurteilt und die Größe genannt. (3) Die Ausschlusswortliste wurde **vor** dem Blick auf die Prüfmenge festgelegt und danach nicht mehr verändert (`scripts/gdelt-test/e1-filter.mjs`). (4) Urteile zu Lagen: Zugehörigkeit zur Lage nach Titel/Adresse-Text; unlesbare Adresse = „unklar".

## 1. Eilmeldung ehrlicher testen

**1a. Aufteilung (gemessen).** Alle Auslöser-Geschichten der Varianten B (Waffencodes), C (bewaffnete Akteure), D1 (B und C), je mindestens 2 verschiedene Medien in 60 Minuten, Hauptgruppen 18–20, zufällig nach Hash der Adresse geteilt (feste Zahl):

| Variante | gesamt | Entwicklungsmenge | Prüfmenge | davon mit gkg-Titel |
|---|---|---|---|---|
| B | 221 | 118 | 103 | 50 |
| C | 191 | 91 | 100 | 45 |
| D1 | 51 | 24 | 27 | 9 |

Zeitraum 2,99 Tage. Union der drei Varianten: 357 Geschichten.

**1b. Entwicklungsmenge.** Beurteilt: B 41, C 40, D1 alle 24 (**nicht 40**, mehr gibt es nicht). Ergebnis „passt / unklar / passt nicht" (Einschätzung): B 7/16/18, C 6/17/17, D1 3/10/11. Typische Fehlalarme: US-Kriminalität und Schulschießereien, Halloween-Geschäft, Sport, Hackerangriff, Waffenverkauf, Theater-Gedenken, Gerichtsmeldungen. **Abgeleitete Ausschlusswörter** (festgeschrieben):
`sale, hack*, lawsuit, tribute, theatre(s), dim lights, shooter, shooting, police, arrested, charged, suspect, murder, bond, court, judge, school, teacher, halloween, hockey, scores, study, mayor, election(s), prince, princess, cold case, killing of, disappeared`
(Wörter, die in der Entwicklungsmenge nur 1-mal vorkamen, sind trotzdem enthalten, z. B. `prince`, `study`; das erhöht das Risiko, dass die Liste zu stark an diese Menge angepasst ist (Annahme). Die Liste enthält bewusst allgemeine Wörter wie `police` und `court`.)

**1c. Prüfmenge, Liste unverändert (Einschätzung, Wilson-Intervall 95 %).** Beurteilt: B 40, C 40, D1 alle 27 (**nicht 40**).

| Variante | Fehlalarm „passt nicht" vorher | nachher | „passt nicht + unklar" vorher | nachher | echte Treffer (P) verloren |
|---|---|---|---|---|---|
| B (n=40 → 27 übrig) | 17/40 = 43 % (29–58 %) | 5/27 = 19 % (8–37 %) | 73 % (57–84 %) | 59 % (41–75 %) | 0 von 11 |
| C (n=40 → 31) | 14/40 = 35 % (22–50 %) | 5/31 = 16 % (7–33 %) | 73 % (57–84 %) | 65 % (47–79 %) | 0 von 11 |
| D1 (n=27 → 20) | 10/27 = 37 % (22–56 %) | 3/20 = 15 % (5–36 %) | 67 % (48–81 %) | 55 % (34–74 %) | 0 von 9 |

Zum Vergleich in der Entwicklungsmenge (dort wurde die Liste abgeleitet, also zu optimistisch): Fehlalarm B 44 % → 13 %, C 43 % → 12 %, D1 46 % → 7 %. In der Entwicklungsmenge ging bei B 1 echter Treffer verloren.

**Wie unsicher ist das?** Sehr. Die Intervalle der Fehlalarmquoten nach Filter reichen bis 31–37 %. Die Intervalle vorher und nachher überlappen sich bei **allen drei** Varianten (B: 29–58 % gegen 8–37 %, C: 22–50 % gegen 7–33 %, D1: 22–56 % gegen 5–36 %). Der Rückgang geht in allen drei Varianten in dieselbe Richtung und passt zur Entwicklungsmenge, ist aber mit diesen Stichproben statistisch nicht abgesichert. Der Anteil „unklar" ist mit 30–40 % der Stichprobe so groß, dass die eigentliche Qualität nicht beurteilbar ist: viele Geschichten haben nur eine Adresse, aus der ich keinen Text lesen kann. Echte Titel gibt es für nur 9–25 % der Geschichten. Auch dass „passt" meine Definition ist (Gewalt-/Militärlage mit außenpolitischer Relevanz), gilt: Andere Leser würden anders urteilen.

**1d. Pro Tag (gemessen für die Anzahl; Hochrechnung ×2 der Hälfte auf die ganze Menge, 2,99 Tage; Anteil Basisländer nach Hauptland der Geschichte).**

| Variante | Auslöser/Tag Entwicklungsmenge vorher → nachher | Prüfmenge vorher → nachher | Anteil Basisländer (Prüfmenge) vorher → nachher |
|---|---|---|---|
| B | 78,9 → 46,2 | 68,9 → 44,2 | 26/103 (25 %) → 18/66 (27 %) |
| C | 60,9 → 44,8 | 66,9 → 54,2 | 39/100 (39 %) → 34/81 (42 %) |
| D1 | 16,1 → 9,4 | 18,1 → 13,4 | 8/27 (30 %) → 7/20 (35 %) |

Die Zahlen der beiden Mengen weichen um bis zu 15 % voneinander ab (Zufall, Einschätzung). Die Auslöserzahl nach Filter gilt für **alle** Geschichten, nicht nur die beurteilten.

**5 echte Treffer in Basisländern (Prüfmenge):**
1. Saudi Arabia reports interception of Houthi drone targeting Mecca · Jemen · 3 Medien · Code 195 · Titel
2. north korea fires dozen ballistic missiles toward east sea south korea · Nordkorea · 2 Medien · 194 · Adresse
3. Houthi missiles strike near presidential palace in Yemen's Aden · Jemen · 2 · 195 · Titel
4. 'Absolute superiority': N Korea eyes drone dominance · Nordkorea · 7 · 194 · Titel
5. north korea fires missile barrage toward the sea as tensions with south rise · Nordkorea · 6 · 194 · Adresse

**5 Fehlalarme, die trotz Liste durchkamen (Prüfmenge):**
1. xinhua headlines overseas observers say cpc plenum shows firm resolve … · Malaysia · 3 Medien · 190 · Adresse
2. florida woman accused threatening shoot trump · USA · 10 Medien · 193 · Adresse (das Wort „shoot" steht nicht auf der Liste)
3. trump immigration crackdown midterms · USA · 8 Medien · 193 · Adresse (Code 193 falsch zugeordnet)
4. experts warn of wider spread as ebola outbreak reaches plateau · Uganda · 10 Medien · 193 · Adresse
5. valdosta store employee fatally shoots armed man in self defense · ohne Land · 2 Medien · 193 · Adresse

Auffällig (Einschätzung): Die Basisland-Treffer sind im Wesentlichen Nordkorea und Jemen/Saudi-Arabien, ein sehr schmales Bild. Die Liste löst auch nicht das Problem, dass Code 193 häufig falsch vergeben wird (Beispiel 3 und 4).

Skripte: `e1-split.mjs`, `e1-show.mjs`, `e1-filter.mjs`, `e1-eval.mjs`, Urteile in `scripts/gdelt-test/e1-labels.json`.

## 2. Titelbereinigung

Alle vorhandenen gkg-Zeilen (nach Adresse ohne Dubletten): **57,370**, davon mit Titel 57,252, ohne Titel 118 (gemessen, `scripts/gdelt-test/t2-titel.mjs`).

**Regeln (nachvollziehbar):**
1. HTML-Zeichen: ein weiteres Mal dekodieren (`&amp;`, `&quot;`, `&#…;`, auch Großschreibung wie `&AMP;`). Der Lader dekodiert bereits einmal.
2. Seitenname am Ende oder Anfang entfernen, wenn er durch ` - `, ` – `, ` — `, ` | `, ` • `, ` » `, ` :: ` getrennt ist und entweder ≤ 3 Wörter hat oder dem Domainnamen ähnelt (bis zu 3 Durchgänge, z. B. „… | Politics | News"). Ein Seitenname ohne Trenner, der doppelt am Ende steht („Medicine Hat NewsMedicine Hat News"), wird einmal entfernt.
3. Zu verwerfen: keine Buchstaben; allgemeine Seite („Tag: …", „Home", „Untitled", „404" usw.); zu kurz (< 3 Wörter oder < 15 Zeichen, bei chinesisch/japanisch/koreanisch/thai < 8 Zeichen); gleicher Titel auf ≥ 3 Adressen derselben Domain, wenn er höchstens 6 Wörter hat oder den Domainnamen enthält (Seiten-Slogan); fast nur Großbuchstaben (Latein).

**Gemessen:**

| Messgröße | Zahl | Anteil an Titeln |
|---|---|---|
| Seitenname am Ende | 5,603 | 9.8 % |
| Seitenname am Anfang | 279 | 0.5 % |
| Titel durch Regeln verändert | 6,468 | 11.3 % |
| HTML-Reste nach einmaligem Dekodieren | 2 | 0,003 % |
| Zeichenfehler (Mojibake, `Ã…`) | 45 | 0,08 % |
| **zu verwerfen** | **1,067** | **1.9 %** |

Verwerfungsgründe: zu kurz 379, Seiten-Slogan 466, fast nur Großbuchstaben 121, allgemeine Seite 101.

**15 Beispiele vorher → nachher (Seitenname):**
1. themarketsdaily.com: «Rapid7 (NASDAQ:RPD) Stock Falls 7% – Here's Why» → «Rapid7 (NASDAQ:RPD) Stock Falls 7%»
2. medicinehatnews.com: «Medicine Hat man charged after downtown business break-in - Medicine Hat NewsMedicine Hat News» → «Medicine Hat man charged after downtown business break-in»
3. local3news.com: «New ADA-accessible fishing site at Chickamauga Lake | Local News» → «New ADA-accessible fishing site at Chickamauga Lake»
4. wjtn.com: «National News - Glenora Radio Network - WWSE | WJTN | WHUG | WKSN | WQFX» → «National News - Glenora Radio Network - WWSE - WJTN»
5. indiatimes.com: «Planets Beyond Neptune,सौरमंडल को मिलेगा नया ग्रह! सूर्य का चक्कर लगाती दिखी रहस्यमय चीज के बौन» → «Planets Beyond Neptune,सौरमंडल को मिलेगा नया ग्रह! सूर्य का चक्कर लगाती दिखी रहस»
6. pagosasun.com: «CDOT begins Colo. 151 flood recovery - The Pagosa Springs Sun» → «CDOT begins Colo. 151 flood recovery»
7. express.co.uk: «Rupert Lowe says Andy Burnham risks looking 'even more pathetic' | Politics | News» → «Rupert Lowe says Andy Burnham risks looking 'even more pathetic'»
8. latribunadetoledo.es: «Jorge Martín se retira del Gran Premio de Malasia | Noticias La Tribuna de Toledo» → «Jorge Martín se retira del Gran Premio de Malasia»
9. onenewspage.com: «Shooting at Spirit Halloween store in California kills 1, injures 6 — One News Page» → «Shooting at Spirit Halloween store in California kills 1, injures 6»
10. theguardian.com: «'Was I not enough?': care worker barred from meeting home secretary | UK news» → «'Was I not enough?': care worker barred from meeting home secretary»
11. nporadio2.nl: «Liefs uit Londen - Bløf» → «Liefs uit Londen»
12. lcp.fr: «Violences du 17 octobre: pourquoi Agnès Firmin Le Bodo (Horizons) démissionne de sa fonction de» → «Violences du 17 octobre: pourquoi Agnès Firmin Le Bodo (Horizons) démissionne de»
13. winnipegfreepress.com: «Toronto cyclists protest Ontario's bike lane removals at Queen's Park – Winnipeg Free Press» → «Toronto cyclists protest Ontario's bike lane removals at Queen's Park»
14. medicinehatnews.com: «Ottawa lists Roberts Bank port expansion in B.C. as project of national interest - Medicine Hat» → «Ottawa lists Roberts Bank port expansion in B.C. as project of national interest»
15. tickerreport.com: «Healthcare Stocks To Follow Now – October 30th» → «Healthcare Stocks To Follow Now»

**Beispiele für zu verwerfende Titel (je Grund bis 4):**
- **zu kurz (<3 Wörter oder <15 Zeichen)** (379): mining.com: «Press Release»; diena.lv: «Ķirbju laiks»; nevisradio.co.uk: «Roger Whittaker»; 7newsbelize.com: «7 News Belize»
- **gleicher Titel auf >=3 Adressen der Domain (Seiten-Slogan)** (466): hitsfm.net: «Classic Hits - HITS FM»; nepalnews.com: «Nepal News | Nepal's First Online News Portal»; country1029wkik.com: «Local News - Southern Maryland Country 102.9 WKIK»; dailykesari.com: «News - Daily Kesari»
- **nur Großbuchstaben** (121): tv6tnt.com: «BHARATH: GOVERNMENT BETRAYS CUBA»; wdadradio.com: «TWO CRASHES, TWO AUTOMATIC FIRE ALARMS REPORTED WEDNESDAY»; wdadradio.com: «HOMER-CENTER, RIVER VALLEY PICK UP WINS IN REGULAR SEASON FINALES»; mantecabulletin.com: «STOP SIGNS COMING TO SPRECKELS AT PHOENIX - Manteca Bulletin»
- **allgemeine Seite** (101): newsroomamerica.com: «Tag: lipid_nanoparticles»; newsroomamerica.com: «Tag: arizona_state_university»; newsroomamerica.com: «Tag: jamie_callahan»; newsroomamerica.com: «Tag: infrastructure_investment»

Einschätzung und Grenzen: Rein automatisch nicht erkennbar sind kurze Meinungs-/Köder-Titel (z. B. „Trump lies": 2 Wörter, wird als „zu kurz" erfasst, aber längere Köder-Titel bleiben unerkannt). Die Regel „≤ 3 Wörter am Ende = Seitenname" kann echte Titelenden abschneiden (z. B. „… - again"); das Risiko wurde nicht gemessen. Ein Titel wie „The Guardian … | UK news" verliert korrekt den Rubrik-Zusatz. Abgeschnittene Titel (gkg liefert maximal ca. 95–100 Zeichen in diesen Stichproben) bleiben abgeschnitten. Die Wirkung der Bereinigung auf die Zusammenführung wurde nicht getrennt gemessen.

## 3. Gleiche Geschichten zusammenfassen: Schwellen

Pool: je Zeitpunkt die 150 Geschichten mit der höchsten Zahl verschiedener Medien (Adresse bereits zusammengefasst), Titel aus gkg, sonst Text der Adresse; 6 Zeitpunkte im Abstand von 6 Stunden (gemessen, `r3-merge.mjs`). „mit Eigennamen": zusätzlich mindestens 1 gemeinsamer großgeschriebener Eigenname, **nur wo beide Titel vorliegen**.

Gruppen nach Zusammenfassen und Zusammenführungen im Pool von 150 (Zeitpunkt 01.11. 04:15; die Folgezeitpunkte zeigen weniger Zusammenführungen, weil weniger Daten vorlagen):

| Schwelle | Gruppen | Zusammenführungen | in späteren Zeitpunkten (Zusammenführungen) |
|---|---|---|---|
| 0,5 | 113 | 37 | 24, 14, 11, 10, 10 |
| 0,6 | 122 | 28 | 18, 12, 9, 8, 8 |
| 0,7 | 124 | 26 | 17, 11, 7, 6, 6 |
| 0,8 | 128 | 22 | 14, 9, 6, 5, 6 |

Mit Eigennamen sind alle Zahlen **identisch** (gemessen): Wo beide Titel vorlagen, teilten alle Paare mindestens einen Eigennamen; wo einer fehlte, wurde die Bedingung nicht angewendet. Der Eigennamen-Test hat damit in diesem Datensatz nichts unterschieden.

**Beurteilung der Zusammenführungen** (nur Paare, die erst bei dieser Schwelle zusammengeführt werden, alle verfügbaren bis max. 20; Einschätzung „richtig gleiche Geschichte" / „falsch"):

| Ähnlichkeitsband | beurteilt | falsch | Fehlerquote (Wilson 95 %) |
|---|---|---|---|
| 0,5 bis < 0,6 | 11 (von 11) | 0 | 0 % (0–26 %) |
| 0,6 bis < 0,7 | 4 (von 4) | 0 | 0 % (0–49 %) |
| 0,7 bis < 0,8 | 5 (von 5) | 0 | 0 % (0–43 %) |
| ≥ 0,8 | 20 (von 23) | 0 | 0 % (0–16 %) |

Alle 40 beurteilten Zusammenführungen waren nach meinem Urteil richtig (Gesamt 0 von 40, 0–9 %). **Aber:** Einige Paare im 0,5-Band sind verschiedene Blickwinkel auf dasselbe Ereignis (z. B. „Oleshky-Evakuierte erreichen Belarus" und „… treffen Angehörige in der Ukraine"). Ob der Leser das als eine Geschichte sieht, ist offen. Der Pool ist klein (150) und enthält die großen Geschichten; die Fehlerquote in einem größeren Pool ist nicht gemessen. Ketten-Zusammenführungen (A~B, B~C) sind möglich: bei 0,5 entstand eine Gruppe mit 10 Mitgliedern (Oleshky), die ich als richtig beurteilt habe.

**Doppelungen in der Top 20** (Pool, Zeitpunkt 04:15, Einschätzung nach Titeln): bei 0,5 stehen ca. **5 überzählige Einträge** (3-mal Oleshky, 2-mal Frankreich-Proteste, 2-mal Burnham/Sklaverei, 2-mal Palestine Action). Bei 0,8 ca. **7 überzählige** (4-mal Oleshky, 3-mal Frankreich, 2-mal Burnham, 2-mal Palestine Action). Für 0,6 und 0,7 nicht von Hand ausgezählt. Die automatisch gezählten Paare mit Titelähnlichkeit ≥ 0,4 in der Top 20 sind dagegen 0–3 (Messgröße zu grob, nicht aussagekräftig).

Einschätzung: Die Doppelungen entstehen vor allem durch Geschichten mit anderem Wortlaut und wenigen gemeinsamen Wörtern; niedrigere Schwellen helfen nur teilweise. Entscheidung offen.

## 4. Sanktionen und Märkte

Universum: 41 unverzerrte Zeitpunkte (5 Haupt- + 36 Zufalls-Zeitpunkte) mit gkg, Deutsch und Englisch/unübersetzt, Dubletten (Adresse und gleicher Titel) entfernt: 41.388 Artikel → 29.717 (gemessen; `r3-topics.mjs`). Hochrechnung pro Tag = Treffer × 96/41 (**Annahme:** die 41 Zeitpunkte sind repräsentativ, sie sind zufällig gewählt, aber nur 41 von 288).

### 4a. Sanktionen

Stichwortliste (Titel): `sanction*, embargo*, tariff(s), export ban/control, import ban, blacklist*, asset freeze, frozen assets, price cap, trade war, boycott*, sanktion*, zoll/zölle, strafzoll*, handelskrieg, einfuhrverbot, exportverbot`.

| Methode | Treffer | pro Tag (Hochrechnung) |
|---|---|---|
| nur Stichwort | 62 | 145 |
| Stichwort + Themenkürzel SANCTIONS | 28 | 66 |
| nur Kürzel SANCTIONS | 354 | 829 |
| Stichwort **und** Diplomatie (Kürzel NEGOTIATIONS/CEASEFIRE oder Diplomatiewort) | 9 | 21 |
| Stichwort **ohne** Diplomatie | 53 | 124 |

Urteil an 20 zufälligen Treffern „nur Stichwort" (Einschätzung): passt 11, unklar 3, passt nicht 6 (**30 % falsch**, Intervall der Trefferquote 34–74 %). Falsche Treffer sind v. a. andere Bedeutungen: Strom-/Wassertarife (`power tariff`, `water tariffs`), Boykott von Beerdigungen, Schulstrafen („sanctions" in Uganda). Eine Regel „tariff nicht nach power/water/electricity/load" würde das beheben (nicht getestet).
**Als Unterpunkt von Diplomatie:** alle 9 Treffer beurteilt: 7 passend, 1 unklar, 1 falsch (78 %, Intervall 45–94 %); die 20 „ohne Diplomatie": 10 passend, 5 unklar, 5 falsch (50 %, 30–70 %). Der Unterschied (78 % gegen 50 %) ist wegen n=9 nicht abgesichert; Einschätzung: als Unterpunkt von Diplomatie wirkt es sauberer, aber mit nur 21 Treffern pro Tag.
Beispiele (passend): „Treasury Sanctions Facilitators Of NKorean IT Worker Fraud", „China firmly opposes U.S. blacklisting of Chinese firms", „UN votes to end US embargo on Cuba", „Trump Considers Lifting Sanctions On Putin's 'Slush Fund'", „Zelenskyy … urges tougher western sanctions on Moscow".

### 4b. Märkte

Methode wie Runde 2 (M2: Themenkürzel plus Stichwort im Titel): **491 Treffer (ca. 1.150/Tag)**. Muster für Einzelaktien/Quartalsmeldungen (earnings, Q1–Q4, price target, dividend, Börsenkürzel in Klammern „(NASDAQ:XXX)", „stock falls/rises" u. a.): trifft 142 davon (**28,9 %**), nach Filter 349 (ca. 820/Tag).

Urteil an je 20 Zufallsbeispielen (Einschätzung): vorher Einzelaktie/Firma 10 von 20 (50 %, Intervall 30–70 %), Makro/Markt 10; nachher Einzelaktie 4 von 20 (20 %, 8–42 %), Makro/Markt 15, 1 falscher Treffer („Took stock of our bilateral cooperation"). Das Muster erkennt also weniger, als tatsächlich Einzelaktien sind (28,9 % per Muster gegen ca. 50 % in der Stichprobe). Von 20 ausgeschlossenen Beispielen waren 3 echte Marktmeldungen (z. B. „Stocks Break Winning Streak Dragged by Alphabet's Worst Ever Post-Earnings Performance"), also **ca. 15 % Verlust echter Treffer** (Intervall breit).
Beispiele nach Filter (Markt): „ECB head Lagarde to step down in February", „Canada raises key rate to 2.5% as inflation outlook worsens", „US Stocks Move Sharply Lower As AI Concerns Resurface". Beispiele, die trotz Filter Einzelaktie blieben: „Wüstenrot & Württembergische (ETR:WUW) Shares Climb 0.2%", „Redemption of 2026 ZDP Shares".
Einschätzung: Ein strengeres Muster (generische Börsenkürzel in Klammern, `short interest`, `shares climb`) würde mehr Einzelaktien erfassen (nicht getestet).

## 5. Länderfaktor

12 Zeitpunkte im Abstand von 6 Stunden, Rang = Zahl verschiedener Medien M × Alterungsabschlag (Halbwertszeit 12 Stunden), Geschichten nach Adresse zusammengefasst (`r3-faktor.mjs`). Variante „mit": Faktoren hoch 2,0, erhöht 1,5, Basis 1,0. „ohne": alle 1,0. „ohne erhöht": hoch 2,0, erhöht und Basis 1,0. **Kein Urteil, nur Zahlen.** Der letzte (früheste) Zeitpunkt 29.10. 10:15 hat nur ca. 6 Stunden Vorlauf (kleine Datenbasis).

| Zeitpunkt (UTC) | in beiden Top 20 | ersetzt | Basis mit / ohne | erhöht mit / ohne | hoch mit / ohne | gemeinsam mit „ohne erhöht" |
|---|---|---|---|---|---|---|
| 01.11. 04:15 | 19 | 1 | 1 / 2 | 0 / 0 | 19 / 18 | 20 |
| 31.10. 22:15 | 19 | 1 | 1 / 2 | 0 / 0 | 19 / 18 | 20 |
| 31.10. 16:15 | 17 | 3 | 3 / 5 | 0 / 0 | 17 / 14 | 20 |
| 31.10. 10:15 | 17 | 3 | 2 / 3 | 0 / 0 | 17 / 14 | 20 |
| 31.10. 04:15 | 16 | 4 | 1 / 1 | 0 / 0 | 17 / 13 | 20 |
| 30.10. 22:15 | 16 | 4 | 2 / 1 | 0 / 0 | 16 / 13 | 20 |
| 30.10. 16:15 | 16 | 4 | 1 / 1 | 0 / 3 | 17 / 13 | 20 |
| 30.10. 10:15 | 15 | 5 | 0 / 4 | 1 / 2 | 17 / 12 | 20 |
| 30.10. 04:15 | 17 | 3 | 1 / 1 | 3 / 4 | 16 / 14 | 19 |
| 29.10. 22:15 | 15 | 5 | 1 / 2 | 3 / 5 | 16 / 13 | 19 |
| 29.10. 16:15 | 18 | 2 | 1 / 2 | 1 / 2 | 18 / 16 | 19 |
| 29.10. 10:15 (kleine Basis) | 17 | 3 | 10 / 13 | 0 / 0 | 9 / 6 | 20 |

(gemessen) Im Mittel werden 3,2 von 20 Plätzen ersetzt (5 im Höchstfall). **Wer profitiert** (Hauptland der neu hereinkommenden Geschichten, 38 Fälle): UK 14, USA 11, Russland 2, Israel 2, China 2, je 1 Deutschland, Iran, Frankreich, Cayman-Inseln, Kanada; nach Stufe: hoch 34, erhöht 1, Basis 3. **Wer verdrängt wird** (38 Fälle): „ohne Ereignisland" 13, Irland 7, Guyana 6, Australien 5, Spanien 2, Kambodscha 2, je 1 Grönland, Nordkorea, Südkorea; nach Stufe: Basis 16, erhöht 9, ohne Land 13. Basisländer sind im Mittel mit Faktoren **seltener** (1,3 von 20) als ohne (2,2) über die 11 vollen Zeitpunkte.
**Stufe „erhöht":** Mit Faktoren steht höchstens 3-mal ein „erhöht"-Land in der Top 20 (insgesamt 8 Einträge in 12 Zeitpunkten, ohne Faktoren 16). Setzt man den Faktor von „erhöht" auf 1,0, ändert sich die Top 20 an 3 von 12 Zeitpunkten um 1 Platz, sonst nicht (gemessen). Die Stufe verschiebt also fast nichts.
Annahme/Einschränkung: „Land der Geschichte" ist das häufigste Ereignisland (nur für die Auswertung der Gewinner); die Faktorberechnung nimmt das Maximum aller beteiligten Länder wie bisher. Ob UK als „hoch" (Faktor 2,0) richtig eingestuft ist, ist eine Konfigurationsfrage, die hier nicht getestet wurde.

## 6. Lagen schärfen

Entwicklungsmenge (Hash < 0,5) für die Wortlisten, Prüfmenge (Hash ≥ 0,5) nur zum Beurteilen; neue Zufallsstichprobe je 20 (`lagen2.mjs`). Universum: alle Geschichten nach Adresse (Titel aus gkg, sonst Text der Adresse; Titel nur für einen Teil). Geschichten gesamt: siehe `data/gdelt-test/lagen2.json`.

**Verfeinerte Wortlisten** (aus den Fehlbeispielen in Runde 2): USA–Iran: iran*, tehran, hormuz, khamenei, irgc; Russland–Ukraine: nur noch ukrain*, kyiv, kiev, zelensk*, donbas, oleshky, kharkiv, odesa, dnipro, crimea, pokrovsk, zaporizhzhia, kherson (Wörter `russia`, `putin`, `moscow` entfernt, weil sie Fremdthemen wie Putin/Musk oder Lawrow-Besuche brachten); China–Taiwan: taiwan*, taipei, kinmen, matsu, one-china, huangyan, south china sea (nicht mehr `china`, `beijing`: brachten Nvidia-Spion, ASEAN); Israel–Gaza/Libanon: gaza, hamas, hezbollah, lebanon/lebanese, beirut, west bank, palestin*, idf, „israeli forces/military/army/strike/settler"; USA–China: china/chinese/beijing zusammen mit us/american/washington/trump/tariff/nvidia/export control/rare earth/chip.

| Lage | Länderpaar | Stichwort | beide | nur Stichwort | nur Paar | % der Stichwort-Treffer, die auch Paar sind | % der Paar-Treffer, die auch Stichwort sind |
|---|---|---|---|---|---|---|---|
| USA–Iran | 511 | 879 | 242 | 637 | 269 | 27,5 % | 47,4 % |
| Russland–Ukraine | 722 | 667 | 366 | 301 | 356 | 54,9 % | 50,7 % |
| China–Taiwan | 53 | 76 | 19 | 57 | 34 | 25,0 % | 35,8 % |
| Israel–Gaza/Libanon | 183 | 390 | 83 | 307 | 100 | 21,3 % | 45,4 % |
| USA–China | 246 | 144 | 51 | 93 | 195 | 35,4 % | 20,7 % |

(gemessen, 3 Tage, Geschichten nach Adresse) **Ein Stichwort genügt nicht als Ersatz des Länderpaars**: Die Mengen überlappen sich nur zu 21–55 % (in beide Richtungen).

**Trefferquote an je 20 neuen Zufallsgeschichten der Prüfmenge (G = gehört zur Lage, U = unklar, N = gehört nicht; Einschätzung; Wilson-Intervall für G):**

| Lage | Paar + Stichwort G/U/N | G-Anteil (95 %) | nur Stichwort ohne Paar G/U/N | G-Anteil (95 %) | Runde 2 „Paar + altes Stichwort" G/U/N |
|---|---|---|---|---|---|
| USA–Iran | 18/2/0 | 90 % (70–97 %) | 12/5/3 | 60 % (39–78 %) | 16/4/0 |
| Russland–Ukraine | 20/0/0 | 100 % (84–100 %) | 12/2/6 | 60 % (39–78 %) | 13/6/1 |
| China–Taiwan | 11/0/0 (**nur 11 in der Prüfmenge**) | 100 % (74–100 %) | 7/1/12 | 35 % (18–57 %) | 14/1/5 |
| Israel–Gaza/Libanon | 16/3/1 | 80 % (58–92 %) | 7/10/3 | 35 % (18–57 %) | 19/1/0 |
| USA–China | 18/2/0 | 90 % (70–97 %) | 13/5/2 | 65 % (43–82 %) | 15/2/3 |

Einschätzung: Mit den verfeinerten Listen sind Russland–Ukraine, USA–Iran und USA–China besser als in Runde 2 (die Stichproben sind aber verschieden und klein, die Listen wurden nach den Fehlbeispielen von Runde 2 angepasst, die Prüfmenge ist getrennt). Bei Israel ist die neue Liste nicht besser als die alte (80 % gegen 95 %, Rauschen bei n=20). China–Taiwan: Länderpaar plus Stichwort passt fast immer, aber es sind nur 19 Geschichten in 3 Tagen. Nur-Stichwort-Treffer bei China–Taiwan sind überwiegend allgemeine Taiwan-Meldungen (Pride-Parade, Kommunalwahlkampf, Aktienkurse, Tourist) und gehören nicht zur Lage. Bei Israel sind viele nur-Stichwort-Treffer „unklar" (10 von 20), weil sie teils Palästina-Solidarität im Ausland, teils Innenpolitik sind.

**China–Taiwan: Tagesverlauf statt Stundenverlauf** (Geschichten pro Tag nach Eingangstag, UTC; der 29.10. beginnt erst 04:30, der 01.11. endet 04:15):

| Tag | Paar + Stichwort | nur Stichwort-Treffer (alle, mit und ohne Paar) |
|---|---|---|
| 29.10. | 16 | 32 |
| 30.10. | 2 | 20 |
| 31.10. | 1 | 23 |
| 01.11. (bis 04:15) | 0 | 1 |

(gemessen) Der Tagesverlauf mit Paar plus Stichwort ist praktisch eine einzige Geschichte (Pakistan sperrt kurz den Luftraum für taiwanische Fluglinien am 29.10.). Mit allen Stichwort-Treffern ist der Verlauf ruhiger (20 bis 32 pro Tag), enthält aber Fremdthemen (s. o.). Drei Tage reichen nicht, um zu beurteilen, ob ein Tagesverlauf für diese Lage tragfähig ist (Einschätzung).

## 7. Datenmenge und Laufzeit (Hochrechnung)

Quellen: Dateigrößen im Cache (`r3-volumen.mjs`, gemessen), Protokoll `messages.log`. **Keine aktuellen Preise geprüft**, es gelten die Zahlen aus `PLAN.md`: 12 USD Guthaben pro Monat, 0,006 USD/Minute, rechnerisch ca. 2.000 Minuten; Annahme in PLAN: Aufrundung jedes Laufs auf ganze Minuten.

**Dateigrößen (gezippt, gemessen):**

| Dateityp | Dateien | Mittel | Median | 90 % | Maximum |
|---|---|---|---|---|---|
| export | 288 | 0,065 MB | 0,061 | 0,100 | 0,148 |
| mentions | 288 | 0,091 MB | 0,082 | 0,144 | 0,176 |
| gkg | 92 | 3,94 MB | 3,26 | 6,40 | 7,53 |
| translation.export | 59 | 0,046 MB | 0,046 | 0,057 | 0,085 |
| translation.mentions | 59 | 0,058 MB | 0,063 | 0,075 | 0,114 |
| translation.gkg | 5 | 8,09 MB | 8,03 | 13,21 | 13,21 |

Einschränkung: gkg-Zeitpunkte wurden nicht gleichmäßig über den Tag gezogen (Anteil Trigger-Auswahl), translation.gkg nur 5 Messwerte (Annahme: 8,1 MB ist grob).

**Menge pro Lauf und pro Tag** (96 Zeitpunkte pro Tag, bei stündlichem Abruf 4 Zeitpunkte pro Lauf):

| Typ | MB pro Lauf (4 Zeitpunkte) | MB pro Tag | GB pro Monat (30 Tage) |
|---|---|---|---|
| export | 0,26 | 6 | 0,2 |
| mentions | 0,36 | 9 | 0,3 |
| gkg | 15,8 | 378 | 11,3 |
| translation.export | 0,18 | 4 | 0,1 |
| translation.mentions | 0,23 | 6 | 0,2 |
| translation.gkg | 32,3 | 776 | 23,3 |

**Download-Dauer (gemessen im Protokoll, Heim-/Hotel-Netz, nicht GitHub):** Median 0,62 Sekunden pro MB (90 %: 0,69) bei 52 Paaren aufeinanderfolgender gkg-Dateien (Abstand minus 5 s Pause); kleine Dateien kosten praktisch nur die Pause (Median 5,17 s je Datei). Auf GitHub-Servern wird die Geschwindigkeit anders sein (Annahme: schneller).

**Rechenmodell (Annahmen!):** Laufzeit = (Dateien + 1 für `lastupdate.txt`) × 5 s Pause + MB × 0,62 s + Start-/Schreibzeit. **Start-/Schreibzeit (Checkout, Node, Datenbank) ist nicht gemessen:** ich setze 30, 45 und 60 Sekunden an (PLAN.md schätzt für einen 12-Abfragen-Lauf 1,5–2 Minuten, daraus folgt eine Start-/Schreibzeit von 30–60 Sekunden). Berechnet wird je Lauf auf ganze Minuten aufgerundet (Annahme aus PLAN) und zusätzlich ungerundet. Der Zeitplan-Takt bestimmt die Läufe pro Monat (60 min: 720, 30 min: 1.440, 15 min: 2.880).

Abgerechnete Minuten pro Monat (aufgerundet) bei **60-Minuten-Takt** (4 Zeitpunkte je Lauf):

| Variante | Dateien/Lauf | MB/Lauf | Laufzeit bei 30 / 45 / 60 s Start | Minuten/Monat (30 / 45 / 60 s) | passt in ca. 2.000? |
|---|---|---|---|---|---|
| (a) nur englisch, ohne gkg | 9 | 0,6 | 75 / 90 / 105 s | 1.440 / 1.440 / 1.440 | ja (72 %) |
| (a) nur englisch, mit gkg | 13 | 16,4 | 105 / 120 / 135 s | 1.440 / 2.160 / 2.160 | nur bei kurzer Startzeit (30 s) |
| (b) englisch + Übersetzung, ohne gkg | 17 | 1,0 | 116 / 131 / 146 s | 1.440 / 2.160 / 2.160 | nur bei kurzer Startzeit |
| (b) englisch + Übersetzung, mit gkg + translation.gkg | 25 | 49 | 185 / 200 / 215 s | 2.880 / 2.880 / 2.880 | **nein** (144 %) |

Ungerundet (Summe der Laufzeiten) bei 45 s Startzeit: (a) ohne gkg 1.085, (a) mit gkg 1.442, (b) ohne gkg 1.568, (b) mit gkg 2.406 Minuten pro Monat. Bei **30-Minuten-Takt** (2 Zeitpunkte je Lauf) liegen alle Varianten bei 45 s Startzeit ≥ 2.880 gerundeten Minuten (144 %) außer (a) ohne gkg bei 30 s Startzeit (1.440); bei **15-Minuten-Takt** (1 Zeitpunkt, 2.880 Läufe) mindestens 2.880 Minuten, also über dem Guthaben. (gerechnet, nicht gemessen; Skript `scripts/gdelt-test/r3-rechnung.mjs`, gibt alle Kombinationen aus.)

Hinweis: Der PLAN sieht ein Zeitfenster von 90 Minuten pro Lauf vor (6 statt 4 Zeitpunkte); das erhöht Dateien und Zeit entsprechend (nicht gerechnet). Dass das Gratis-Guthaben in GitHub 12 USD beträgt und ob Läufe aufgerundet werden, wurde nicht geprüft.

**Einschätzung, keine Entscheidung:** Die 5-Sekunden-Pause ist der größte Posten (mehr als der Download). gkg ist mit Abstand der größte Datenposten (ca. 98 % der Menge in Variante a mit gkg) und entscheidet über Titel und Themen. Die Übersetzungs-gkg kostet im Mittel doppelt so viel wie die englische.

## 8. MVP-Vorschlag und Datenbankentwurf

Siehe `docs/mvp-vorschlag.md` (nur Text, nichts angelegt).

## 9. Was belegt, was nicht, was offen ist

**Belegt (gemessen):** Ausschlussliste senkt den Fehlalarm in der Prüfmenge in allen drei Varianten (Richtung gleich, Intervalle überlappen); Titelbereinigung (Anteile); keine falschen Zusammenführungen in der Stichprobe (n=40); Faktoren ändern die Top 20 um im Mittel 3,2 Plätze; Stichwort ersetzt das Länderpaar nicht (Überlappung 21–55 %); Dateigrößen und Download-Dauer.
**Nicht belegt:** Qualität der Eilmeldung insgesamt (viele „unklar", Intervalle breit, D1 klein); ob die Liste über diese 3 Tage hinaus trägt; Eigennamen-Vergleich beim Zusammenfassen (kein Unterschied messbar, kaum Titel); Laufzeit auf GitHub (Startzeit und Geschwindigkeit sind Annahmen).
**Offen:** Titelabdeckung (gkg-Titel nur für Geschichten aus gkg-Zeitpunkten, in Produktion wären alle 4 Zeitpunkte pro Lauf nötig); Wochenverlauf (nur Do–So); DOC-API (Hotspot-Versuch: Verbindungs-Timeout); Zweitbeurteilung durch eine andere Person; Entscheidungen zu Ranking, Themen, Eilmeldung, Takt.

## 10. Zweitbeurteilung (Eilmeldung, 20 Geschichten, Seed 2024)

20 zufällige Geschichten aus den von mir beurteilten Geschichten der Prüfmenge, die nach der Ausschlussliste übrig waren (Pool 38). Der Nutzer hat sie ohne mein Urteil beurteilt. Alles Folgende ist **Einschätzung** (Urteile) bzw. **gemessen** (Zählungen).

**Übereinstimmung (gemessen an den beiden Urteilslisten):**

| Maß | Ergebnis |
|---|---|
| Dreier-Einteilung (passt / unklar / passt nicht) | **17 von 20 = 85 %** (davon beide „unklar" 11, beide „passt" 4, beide „passt nicht" 2) |
| „passt" gegen „nicht passt" (unklar und nicht = zusammen) | **18 von 20 = 90 %** |
| nur Fälle, bei denen mindestens einer von uns entschieden hat (n = 9) | 6 von 9 = 67 % |
| Cohen-Kappa (zufallsbereinigt, grob) | ca. 0,72 (Dreier), ca. 0,74 („passt" gegen nicht) |
| Verteilung P / U / N | mein Urteil 6 / 12 / 2; Nutzer 4 / 13 / 3 |

**Abweichungen einzeln:**
1. Nr. 13 „Evacuees from occupied Oleshky arrive in Belarus en route to Ukraine" (Russland, 48 Medien): ich **passt**, Nutzer unklar.
2. Nr. 16 „Three Kuki-Zo village volunteers killed in Manipur; KIM alleges attack by armed groups" (ohne Ereignisland, 2 Medien): ich **passt**, Nutzer unklar.
3. Nr. 17 „the week in russia tensions talks and terror" (Ukraine, 3 Medien): ich unklar, Nutzer **passt nicht**.

Bei „passt oder nicht" zählen nur Nr. 13 und Nr. 16 als Abweichung (bei Nr. 17 sind beide „nicht passt"). Beide Abweichungen gehen in dieselbe Richtung: Ich war großzügiger („passt") als der Nutzer. Nr. 13 ist eine humanitäre Evakuierung während einer Waffenruhe, nicht ein Gewaltereignis; die Abweichung deutet darauf hin, dass meine Definition („Gewalt-/Militärlage mit außenpolitischer Relevanz") weiter gefasst war als die des Nutzers.

**Wie belastbar ist das? (Einschätzung): gering.**
- **n = 20**, und davon sind **7 Einträge ohne lesbaren Titel** (Nr. 1, 6, 11, 12, 14, 18, 19: Adresse ohne lesbaren Text), bei denen beide „unklar" sagten. Diese 7 erhöhen die Übereinstimmung künstlich: Von 17 Übereinstimmungen sind 11 „beide unklar".
- Nur **4 (Nutzer) bzw. 6 (ich) „passt"**, und diese gehören zu nur 2 bis 4 verschiedenen Ereignissen. Eine Aussage über die Genauigkeit der Treffer lässt sich daraus nicht ableiten; mit n = 9 entschiedenen Fällen ist jede Prozentzahl ein grober Anhaltspunkt.
- **Mögliche Beeinflussung (Annahme):** Der Nutzer hatte meine Einschätzungen zuvor gesehen (Berichte, Beispiellisten). Die Einträge Nr. 4, 9 und 10 standen dort ausdrücklich als „echte Treffer"; Nr. 8 ist inhaltlich fast gleich. Gerade die 4 gemeinsamen „passt" sind also nicht unabhängig. Die Zweitbeurteilung ist deshalb **keine unabhängige Prüfung**, sondern eine Plausibilitätsprobe.
- Beide Urteile beruhen auf kurzen Titeln oder Adresstext, nicht auf den Artikeln.

**Verschiedene Ereignisse (gemessen/Einschätzung).** Fasst man gleiche Geschichten zusammen, sind aus den 20 Einträgen **17 verschiedene Ereignisse**: Nr. 4 und 10 (Nordkorea schießt Raketen aufs Meer) sind ein Ereignis, Nr. 8 und 9 (Huthi-Drohnen über Saudi-Arabien abgefangen) ein Ereignis. Die 7 unlesbaren Einträge können weitere Dubletten verbergen (nicht prüfbar, als getrennte Ereignisse gezählt).
- Echte Treffer nach **meinem Urteil**: 6 Einträge = **4 verschiedene Ereignisse** (Nordkorea, Huthi/Saudi-Arabien, Oleshky, Manipur), also **4 von 17 = 24 %** (Wilson 95 %: 10–47 %).
- Echte Treffer nach **Nutzerurteil**: 4 Einträge = **2 verschiedene Ereignisse** (Nordkorea, Huthi/Saudi-Arabien), also **2 von 17 = 12 %** (3–34 %).
Keine Aufwertung: unklare Einträge zählen nicht als Treffer.

**Auslöser pro Tag, wenn nur Geschichten mit lesbarem Titel zählen** (gemessen; „lesbar" = echter gkg-Titel, mindestens 3 Wörter, nicht „article"/„p"/nur Adresse; 2,99 Tage; ganze Menge Entwicklungs- plus Prüfmenge):

| Variante | alle | nach Ausschlussliste | nur lesbarer Titel | lesbarer Titel und nach Liste (davon Basisländer) |
|---|---|---|---|---|
| **D1 (beste Variante im Test)** | 51 = 17,1/Tag | 34 = 11,4/Tag | 9 = 3,0/Tag | **5 = 1,7/Tag** (3 Basis) |
| B | 221 = 73,9/Tag | 135 = 45,2/Tag | 50 = 16,7/Tag | 28 = 9,4/Tag (7 Basis) |
| C | 191 = 63,9/Tag | 148 = 49,5/Tag | 45 = 15,1/Tag | 36 = 12,0/Tag (14 Basis) |

(D1 in der Prüfmenge allein: 6 von 27 mit lesbarem Titel.) **Einschränkung (Annahme):** Der Titel-Anteil (D1: 9 von 51 = 18 %) hängt daran, dass im Test gkg nur für einen Teil der Zeitpunkte vorliegt. Mit gkg aller Zeitpunkte wären mehr Titel lesbar; wie viel mehr, ist nicht gemessen. Die 1,7 pro Tag sind daher eine **Untergrenze**, die Zahl ist durch die Datenlage und nicht durch die Regel bestimmt.

**Zusammenfassung (Einschätzung):** Die Übereinstimmung ist hoch (85–90 %), aber vor allem, weil viele Einträge für beide nicht beurteilbar sind. Sicher ist nur: Echte Treffer unter den lesbaren Titeln sind wenige (4 Ereignisse nach meinem Urteil, 2 nach dem Urteil des Nutzers, Nordkorea und Huthi/Saudi-Arabien in beiden Fällen). Die bisherige Fehlalarmquote (15 % „passt nicht") sagt wenig über die Brauchbarkeit aus, solange der Anteil „unklar" so hoch ist.

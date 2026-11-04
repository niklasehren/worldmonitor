# WORLDMONITOR – Design (v2, beschlossen am 03.11.2026)

Ersetzt den Entwurf v2 vom 31.10.2026 (Papierweiß/Gold/Serif); die alte Fassung steht unverändert in `docs/design-v1.md`. Referenz für den neuen Look: zwei Mockup-Bilder des Nutzers (lokal in `design/referenz/`, nicht im Git). **Der Text in diesen Bildern ist erfunden und wird nicht übernommen.**

Leitbild: **ruhiges Lagebild auf einem Globus**. Fast schwarzer Grund, ein Satellitenbild der Erde, schwebende Glasflächen am Rand. Kein Neon, keine blinkenden Elemente, keine Dauer-Animationen. Sprache der Oberfläche: Deutsch.

## Was es nicht gibt (bewusst)

- **Kein „LIVE" und kein „Live-Update":** Es gibt keine Live-Daten. Statt dessen „Stand: nicht verfügbar" (später: Zeitpunkt des letzten erfolgreichen Abrufs) und „Beispieldaten"/„Beispiel", solange Platzhalter gezeigt werden.
- **Keine Verbindungslinien zwischen Regionen** (kein Beleg dafür in den Daten).
- **Keine Wolken, keine Tag/Nacht-Grenze:** Nachtlichter gibt es (zweite NASA-Datei, siehe „Karte: Globus"), aber als feste Schicht über der dunklen Erde, **ohne** Tag/Nacht-Grenze: Eine echte Grenze würde eine Aktualität vortäuschen, die es nicht gibt. Wolken fehlen (keine Datei freigegeben).
- **Keine „Briefing-Schicht":** Das Portal läuft vollautomatisch und ist unabhängig vom Morgen-Briefing. Es gibt keinen Datei-Import; die obere Schicht („Heute wichtig") kommt später automatisch aus dem GDELT-Rang (rohe Medienzahl). Alle Inhalte sind bis dahin Platzhalter („Beispiel").
- Kein Hell/Dunkel-Umschalter, keine Serifenschrift, kein Cremeweiß, kein Gold.

## Farben

Alle Werte stehen als Tokens in `design/tokens-v2.css`. Rot und Blau der Stufen sind aus dem Referenz-PDF abgeleitet (Median der kräftig gesättigten Pixel: Rot `#E72A2C`, Blau `#3C7BC3`, gemessen). Grau, Textfarben und Glas sind meine Einschätzung nach der Referenz. Kontraste nach WCAG-Formel nachgerechnet (03.11.2026); „auf `#1B232D`" ist ein Näherungswert für Glas über hellem Bild. **Nachgemessen am 03.11.2026 (B2):** Der hellste Untergrund unter den Panels in 5 Ansichten war RGB 148,148,146 (Blockmittel 24 px, Näherung für den Weichzeichner). Dort hielt Deckkraft 0,68 den roten Text nur mit 4,15:1 (unter 4,5), darum ist die Glasfläche jetzt dunkler (0,76): Haupttext 12,3:1, gedämpft 6,0:1, Top-Text 4,86:1, Wichtig-Text 5,42:1, Grau 5,28:1.

| Rolle | Hex | Kontrast auf `#05080C` | auf `#1B232D` |
|---|---|---|---|
| Hintergrund (fast schwarz) | `#05080C` | – | – |
| Glasfläche | `rgba(10,15,22,0.76)` + Weichzeichner 14 px + `brightness(0.45)` auf dem Untergrund, Rand `rgba(255,255,255,0.14)` | – | – |
| Haupttext | `#F2F5F8` | 18,34:1 | 14,49:1 |
| Gedämpfter Text | `#A3AEBB` | 8,91:1 | 7,04:1 |
| Stufe Top, Fläche/Marker | `#E72A2C` | 4,55:1 | 3,60:1 (Nicht-Text, mind. 3:1) |
| Stufe Top, Text | `#FF6B6B` | 7,23:1 | 5,71:1 |
| Stufe Wichtig, Fläche/Marker | `#3C7BC3` | 4,60:1 | 3,63:1 (Nicht-Text) |
| Stufe Wichtig, Text und Links | `#6FA8E8` | 8,07:1 | 6,37:1 |
| Stufe Am Rande, Fläche und Text | `#9AA3AE` | 7,86:1 | 6,21:1 |
| Fokusrahmen | `#6FA8E8` | 8,07:1 | 6,37:1 |

**Nachgemessen in B3 (Karten, Nachtlichter):** Die Nachtlichter machen den Untergrund unter den Panels stellenweise sehr hell (ungünstigster 24-px-Block ohne Glas: RGB 245,222,186 in der Korea-Ansicht). Mit Deckkraft 0,76 allein fiel dort der rote Text auf 3,7:1. Darum dunkelt das Glas den Untergrund zusätzlich per `brightness(0.45)` ab. Gemessen am fertig gerenderten Bild (Text transparent geschaltet, hellster 24-px-Block unter den Panels in 5 Ansichten: RGB 42,46,55): Titel 12,39:1, gedämpft (Rubrik, Quelle) 6,02:1, Top-Text 4,88:1, Wichtig-Text 5,45:1, Grau 5,31:1. Hover und gewählte Karte verändern deshalb nur den Rand, nicht den Hintergrund (ein Weißanteil von 7 % hätte Top-Text auf 3,9:1 gedrückt).

Regeln: Text mindestens 4,5:1, Bedienelemente und Marker mindestens 3:1. Zahlen in den Markern stehen in `#05080C` (auf Rot 4,55:1, auf Blau 4,60:1, auf Grau 7,86:1; weiße Zahlen würden auf Rot und Blau unter 4,5:1 fallen). **Information nie allein über Farbe:** Die Stufe steht immer auch als Text („Top", „Wichtig", „Am Rande") und über die Größe.

## Stufen

| Stufe | Farbe | Marker-Größe | Zweck |
|---|---|---|---|
| Top | Rot | groß (34 px) mit weichem Leuchten | wichtigste Meldungen |
| Wichtig | Blau | mittel (26 px) | wichtige Meldungen |
| Am Rande | Grau | klein (20 px) | weitere Meldungen |

Die Stufe ist eine Sortierung nach der eigenen Gewichtung, **keine** Bewertung der Quelle und keine Schwere. Im Prototyp sind alle Stufen Beispiele.

## Schriften

| Zweck | Schrift | Lizenz |
|---|---|---|
| Text, Überschriften, Labels | **Inter** (400, 600), eine Grotesk-Schrift | SIL Open Font License 1.1 (`design/fonts/LICENSE-inter.txt`) |
| Zahlen, Uhrzeiten | **JetBrains Mono** (400) | SIL Open Font License 1.1 (`design/fonts/LICENSE-jetbrains-mono.txt`) |

- Lokal eingebunden über `next/font/local` (Dateien in `design/fonts/`, Teilmenge „latin"), kein Nachladen von Drittservern. Die Lizenz erlaubt Einbinden und Weitergabe, solange die Lizenzdatei dabei liegt und der Fontname nicht für abgewandelte Fassungen genutzt wird (Einschätzung nach dem Lizenztext, keine Rechtsberatung).
- Monospace nur für Zahlen und Uhrzeiten. Basisschrift 16 px; Rubriken, Stufenüberschriften, „N Medien"-Zeilen und Fußzeile 12 px (bewusst kleiner, Kontrast unten nachgemessen), sonst mindestens 13 px.
- Source Serif 4 (v1) wird nicht mehr verwendet; die Dateien bleiben vorerst im Ordner, weil das Mockup (`mockup/index.html`, v1) sie noch nutzt.

## Layout Desktop

Der Globus füllt den ganzen Bildschirm. Alle Flächen schweben als Glas darüber:

```
┌──────────────────────────────────────────────────────────────────┐
│ WORLDMONITOR  Di., 03.11.2026        LA  WAS  WIEN  MOS  DXB  PEK  │  Leiste oben
├──────────────┐                                    ┌────────────────┤
│ HEUTE        │            ·  GLOBUS  ·            │ Detailpanel    │
│ WICHTIG      │       (Satellitenbild, Leuchtrand) │ (bei Klick auf │
│  Top 1 2 3   │                                    │ Punkt/Land/    │
│  Wichtig 4–6 │                                    │ Lage)          │
│  Am Rande 7–8│                                    │                │
├──────────────┴────────[ Lagen-Chips ]─────────────┴────────────────┤
│ Stand: nicht verfügbar · … nicht redaktionell geprüft · NASA-Quelle │
└──────────────────────────────────────────────────────────────────┘
```

- **Leiste oben:** Logo, Datum (Mono), sechs Weltuhren von West nach Ost (Los Angeles, Washington, Wien, Moskau, Dubai, Peking; IANA-Zeitzonen `America/Los_Angeles`, `America/New_York`, `Europe/Vienna`, `Europe/Moscow`, `Asia/Dubai`, `Asia/Shanghai`), Hinweis „Beispieldaten".
- **Links „Heute wichtig":** 8 **Karten** in 3 Stufen mit schlanken Überschriften („TOP · 3"). Pro Karte: Nummer mit Stufenpunkt (Rot/Blau/Grau), Rubrik „LAND · REGION" (Mono, 12 px, Versalien, gedämpft), Titel (semibold, höchstens 2 Zeilen), Zeile „N Medien · Quellen". Keine Uhrzeit, kein „LIVE", kein „warum wichtig". Klick dreht den Globus zum Punkt und öffnet das rechte Panel. Die Zahl N ist im Beispiel ein frei gesetzter Platzhalter (31, 24, 19, 14, 11, 9, 6, 4); später ist sie die Medienzahl aus GDELT. Ab 1280 px Breite reicht das Panel bis zum unteren Rand (812 px hoch); bei 1440×900 passen alle 8 Karten ohne Scrollen (gemessen: Inhalt 773 px, sichtbar 773 px).
- **Rechts Detailpanel, standardmäßig eingeklappt:** Der Globus nutzt dann die ganze Breite (Mitte neu berechnet, ganzer Globus bleibt sichtbar). Es öffnet beim Klick auf einen Marker, eine Karte, ein Land oder einen Lagen-Chip und zeigt: Name, Stufe als Text (mit Stufenpunkt), „Beispiel"-Kennzeichnung, **Zugeordnete Meldungen** (Titel, Quelle; bei keiner Meldung „Keine Meldung im Beispiel" bzw. „Im Beispiel keine Meldung"), **Verwandte Regionen** als Chips (Lagen sind anklickbar). Keine Kurzlage. Zuordnung Lagen zu Meldungen (vom Nutzer vorgegeben): Iran · USA · Israel = 2, 4; Russland · Ukraine = 3; China · Taiwan und Nord · Südkorea = keine. Ein Länderklick zeigt nur die Meldungen dieses Landes; die Namen der Länder ohne Beispielmeldung stehen mangels deutscher Namensliste auf Englisch (Kartendaten).
- **Unten Lagen-Chips:** Iran · USA · Israel, Russland · Ukraine, China · Taiwan, Nord · Südkorea. Klick dreht und zoomt den Globus zur Region und öffnet das Detail der Lage.
- **Fußzeile (C1):** einzeilig: „Stand: <Zeitpunkt der Daten>" und ein Link „Quellen". „Quellen" öffnet ein kleines Fenster (Escape und Klick außerhalb schließen) mit GDELT (Zitat und Link, Pflicht laut GDELT-Bedingungen), NASA Earth Observatory (Blue Marble), NASA-Nachtlichter mit der geforderten Nennung, Natural Earth und MapLibre. Kein NASA-Logo, kein NASA-Text in der Fußzeile.
- **Startansicht:** Der ganze Globus liegt mittig im freien Bereich zwischen den Panels (MapLibre-Padding oben 76, unten 112, links 312, rechts 332 px), mit Abstand zur Leiste und zu den Chips. Blick auf Länge 5°, Breite 26°: Europa und Nahost zentral, alle 8 Marker höchstens 69° vom Mittelpunkt (Washington 69°, Caracas 69°).

## Layout Handy (unter 768 px Breite)

- Globus oben (Leiste mit seitlich scrollbaren Uhren), unten ein **Sheet „Heute wichtig"** mit zwei Zuständen: eingeklappt (176 px: Griff, Titel, Lagen-Chips, Quellenzeile) und ausgeklappt (72 % der Höhe, die 8 Karten in 3 Stufen scrollen im Sheet). Umschalten per Tippen oder Ziehen am Griff; der Griff ist ein Knopf (`aria-expanded`).
- **Detailpanel** als eigenes Sheet (340 px) über dem Sheet, mit Schließen-Knopf. Der Globus schiebt sich in den freien Bereich darüber.
- **Lagen-Chips** scrollen waagerecht (im Sheet).
- Quellenzeile mit NASA-Link steht auch eingeklappt sichtbar.
- **Touch:** Ziehen dreht den Globus, Zwei-Finger-Zoom zoomt (Rotation und Kippung per Touch aus); `touch-action: none` auf der Karte, `overscroll-behavior: none` auf der Seite, die Seite scrollt dabei nicht mit.
- **Textur:** unter 768 px die 2048er (`public/globe/erde-nacht-2048.jpg`, 0,37 MB), sonst die 4096er (`erde-nacht-4096.jpg`, 1,15 MB). Auswahl beim Laden der Seite.

## Karte: Globus

- **Kamera:** Klick auf eine Meldung links, einen Marker oder einen Lagen-Chip dreht den Globus in ca. 1,3 s zum Ort (kürzester Weg, Mitte des freien Bereichs). Meldung: Zoomzuschlag +1,3 auf die Startzoomstufe. Lagen (Mittelpunkt Länge/Breite, Zuschlag): Iran · USA · Israel = Nahost (45°, 31°, +1,8), Russland · Ukraine = Osteuropa (34°, 49°, +1,9), China · Taiwan = Ostasien (113°, 32°, +1,5), Nord · Südkorea = Koreanische Halbinsel (127,5°, 37,5°, +2,8). Bei `prefers-reduced-motion` ohne Fahrt.
- **Technik:** maplibre-gl 6.15.0 (BSD-3-Clause), Projektion `globe` (`map.setProjection({ type: "globe" })` nach `style.load`). Keine externen Kartenserver, keine Schriften, keine Beschriftung auf der Karte. Der Stil besteht aus Hintergrund, dem Satellitenbild (Bildquelle), unsichtbaren Länderflächen für Klicks (`world-atlas` 2.0.2, ISC, Daten Natural Earth), Grenzlinien zwischen Ländern (Weiß, 20 % Deckkraft) und HTML-Markern (Knöpfe mit Zahl).
- **Satellitenbild (Tag):** NASA **Blue Marble: Next Generation, Base Map**, Tagesansicht ohne Höhenrelief, Monat April 2004, 5400×2700 (8 km/Pixel). Quelle: `https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/april/world.200404.3x5400x2700.jpg` (1,69 MB), Seite: `https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/`.
- **Nachtlichter:** NASA **Earth at Night / Black Marble 2016**, Farbe, 3 km, 13500×6750. Quelle: `https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_3km.jpg` (8.106.233 Bytes = 7,73 MB, gemessen), Seite: `https://science.nasa.gov/earth/earth-observatory/earth-at-night/`. Beide Rohdateien liegen in `data/blue-marble/` (nicht im Git).
- **Eine Textur aus beiden:** MapLibre legt Bilder in der Web-Mercator-Ebene ab; `scripts/globe-textur.mjs` rechnet beide Bilder nach Mercator um, dunkelt die Tagesansicht ab, entsättigt sie leicht und legt sie ins Bläuliche (damit die Erde nicht matt und braun wirkt) und legt die Nachtlichter als aufgehellte, warm getönte Schicht darüber (Screen-Überblendung, ohne Tag/Nacht-Grenze). Ergebnis `public/globe/erde-nacht-4096.jpg` und `erde-nacht-2048.jpg`. Neu erzeugen: `node scripts/globe-textur.mjs 4096 0.82` und `node scripts/globe-textur.mjs 2048 0.82` (braucht nur Node und den vorhandenen Google Chrome). Das Polargebiet über ±85,05° fehlt (Grenze der Mercator-Ebene) und ist mit der Ozeanfarbe `#101332` gefüllt. Die älteren Texturen `erde-4096.jpg` und `erde-2048.jpg` (nur Tag) werden nicht mehr verwendet.
- **Abdunkeln und Farbton:** in die Textur eingerechnet (Faktoren je Kanal 0,35/0,46/0,62, Sättigung 0,5, Anhebung der Schatten für einen sichtbaren Globusrand gegen den schwarzen Grund); die Ebene selbst hat keine Helligkeitsanpassung mehr.
- **Atmosphärenrand:** MapLibres eigene Atmosphäre (`setSky`/`setLight`) ergab im Test keinen sichtbaren Rand und ist nicht in Farbe und Stärke einstellbar. Statt dessen liegt ein weicher CSS-Verlauf (`.wm-glow`, mehrstufig, hell am Rand und nach außen abfallend, Blau `#6FA8E8`/`#3C7BC3`) über dem Globus. Der Randradius wird aus der Kamera selbst berechnet (zwei Punkte im Abstand 10° und 20° projizieren, daraus Brennweite und Kameraabstand lösen), nicht mehr aus einem festen Faktor. Gemessen bei drei Zoomstufen (2,12 / 2,50 / 2,88): berechneter gegen im Screenshot gemessenen Rand 0,997 / 0,999 / 0,999. Ab Zoom 4 blendet der Rand aus.
- **Bedienung:** Drehen per Ziehen (keine Kippung, keine Rotation per Touch), Zoomen per Mausrad oder Pinch, Klick auf Punkte, Länder und Chips. Marker sind Knöpfe (Tastatur, Screenreader-Beschriftung „Meldung 2, Top: … (Beispiel)"). Kein Auto-Drehen. Bei `prefers-reduced-motion: reduce` springt die Ansicht ohne Fahrt.
- **Rückseite:** Ein Marker ist nur ausgeblendet (Deckkraft 0, nicht anklickbar), wenn MapLibre ihn hinter dem Horizont der Kamera sieht. Wegen der Perspektive liegt dieser Horizont nicht bei 90°, sondern deutlich davor (im Startzoom grob bei 76° vom Mittelpunkt, Einschätzung aus Kamerageometrie). Der frühere Startblick (Länge 30°, Breite 28°) setzte Washington (84,6°) und Caracas (91,1°) dahinter; deshalb waren sie abgedunkelt. Jede Meldung steht zusätzlich in der Liste.

### Nutzungsbedingungen NASA-Bild (gelesen am 03.11.2026)

- Seite Blue Marble: „Anyone using or republishing Blue Marble: Next Generation please credit ‘NASA Earth Observatory.’" → das Quellenfenster nennt „NASA Earth Observatory, Blue Marble: Next Generation" mit Link auf die NASA-Seite.
- Nachtlichter: Die Karten-Seite nennt selbst keine Quellenzeile; die zugehörige Earth-Observatory-Geschichte nennt: „NASA Earth Observatory images by Joshua Stevens, using Suomi NPP VIIRS data from Miguel Román, NASA GSFC." → diese Zeile steht mit Link im Quellenfenster. Es gelten dieselben NASA Images and Media Usage Guidelines.
- NASA Images and Media Usage Guidelines: NASA-Inhalte, auch als Texturen in 3D-Darstellungen, „generally are not subject to copyright in the United States"; „NASA should be acknowledged as the source of the material"; kommerzielle Nutzung darf „not explicitly or implicitly convey NASA's endorsement of commercial goods or services". NASA-Logos und -Embleme sind nicht frei. Eine Pflicht zur URL-Angabe stand in den gelesenen Texten nicht (Annahme: keine), der Link steht trotzdem in der Fußzeile.
- Das Bild trägt **kein** NASA-Logo und keine Aussage, die eine Empfehlung durch NASA nahelegt.

## Layout D1: Länderdaten, Länderpanel, Suche (03.11.2026)

- **Linkes Panel „Heute wichtig"** (Daten aus `public/data/world.json`, sonst `world.sample.json` mit Etikett „Beispiel"/„Beispieldaten"): keine verschachtelten Kästen, Trennlinien. Top 3 groß (Rubrik „Land · Region" in Mono, Titel 16 px kräftig bis 3 Zeilen, schlanker Balken für die Medienzahl relativ zur größten der Top 8, „N Medien · Quellen"), Wichtig 3 als Zeilen (Punkt, Nummer, Titel, Medienzahl rechts), Am Rande 2 kleiner und gedämpft. Ohne Titel steht der Text aus der Adresse, sonst „Titel nicht verfügbar (Domain)". Einklappbar (Knopf „‹"); der Globus bekommt dann die Breite. Auf dem Handy dieselben Zeilen im Sheet.
- **Länderpanel rechts:** deutscher Name (`Intl.DisplayNames`), Stufenpunkt nur, wenn das Land in den Top 8 vorkommt. Reiter „Lage" (Zahl der Geschichten im 48-Stunden-Fenster, „Konfliktberichte erhöht" nur bei Verhältnis zum Median ab 2 und mindestens 100 Ereignissen, Top 3) und „News" (bis 10 Geschichten, Titel als Link in neuem Tab, Quellen, Medienzahl, Alter relativ zum Datenstand). Fehlt die Datei, ist sie leer oder offline: „Wenig Berichterstattung in den letzten 48 Stunden".
- **Suche** in der Kopfzeile („Land suchen"): deutsche Ländernamen, Vorschläge, Pfeiltasten und Eingabe; Landesmittelpunkte aus den lokalen Grenzdaten (`components/centroids.ts`). Die Kopfzeile zeigt den Stand der Daten, nicht das heutige Datum.
- **Test-Schalter** (Adressparameter, standardmäßig aus): `?glas=0` (Panels ohne Weichzeichner, fast deckend; Variable `--wm-blur`), `?rand=0` (ohne Leuchtverlauf), `?textur=2048` (oder `4096`).

## Layout E2: ruhiger, Fakten, Zoomgrenze (03.11.2026)

- **Linkes Panel „Heute wichtig":** höchstens 60 % der Fensterhöhe. Standard nur die Top 3 groß (Rubrik klein in Mono, Titel höchstens 2 Zeilen mit großem Satzanfang, „N Medien · vor X Std." relativ zum Datenstand, schlanker Balken). Die übrigen 5 stehen hinter dem Knopf „Weitere 5" als einzeilige Zeilen. Keine Domainlisten; höchstens 3 Quellennamen nur bei der gewählten Meldung. Einträge ohne lesbaren Text werden nie angezeigt (Absicherung im Frontend zusätzlich zu `build-data.mjs`).
- **Länderpanel:** Reiter Lage, News, Fakten. Lage: Konfliktmarke (nur „erhöht"), „Wenig Berichterstattung" bei dem Merkmal, Top 3 als kompakte Zeilen; keine große Zahl, kein „Stand" im Panel (nur Fußzeile). News: bis 10 kompakte Zeilen („N Medien · vor X Std."), Klick öffnet den Link in neuem Tab. Fakten: Hauptstadt, Einwohner (mit Jahr), Fläche, Sprachen, Währung, Region aus `public/data/facts.json` (Wikidata, CC0, `scripts/build-facts.mjs`); fehlt ein Feld, steht „–". Keine Amtsträger.
- **Zoomgrenze (Rechnung):** Gemessen (Chrome, 3 Läufe, Zoom 2,16 bis 4,16 und 2,16 bis 3,23) gilt in der Mitte des Globus **Bildschirmpixel je Grad = 1,581 · 2^zoom**. Die Textur hat N/360 Texel je Grad Länge (4096: 11,38; 2048: 5,69); auf der Bildschirmbreite eines Längengrades bei Breite φ bleibt davon cos φ. Texel je Gerätepixel = (N/360) / (dpr · 1,581 · 2^zoom · cos φ). Verlangt: mindestens 0,5 Texel je Gerätepixel (höchstens doppelt vergrößert) bei φ = 35°. Daraus Obergrenze: zoom ≤ log2((N/360) / (0,5 · dpr · 1,581 · cos 35°)). Werte: **4096 und dpr 1: 4,14; 4096 und dpr 2 (Laptop-Retina): 3,14; 2048 und dpr 2: 2,14; 2048 und dpr 3 (Handy): 1,55**. Die Grenze wird zur Laufzeit gesetzt (`zoomGrenze` in `Globe.tsx`), nie unter Startzoom + 0,35, und die Kamerafahrt zu Ländern endet dort (`min(Grenze, Start + dz)`).

## Karten-Technik: Worker

Der Worker von maplibre-gl 6 wird vom Bundler nicht selbst gefunden. Er liegt als Kopie in `public/maplibre/` (`maplibre-gl-worker.mjs`, `maplibre-gl-shared.mjs`) und wird in `components/Globe.tsx` per `setWorkerUrl` eingebunden. Nach jeder Versionsänderung von maplibre-gl neu kopieren: `cp node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs public/maplibre/` (`maplibre-gl-shared.mjs` ist im Paket 0 Bytes groß; das ist so gewollt).

## Messwerte (03.11.2026, B3, Entwicklungsrechner, Produktions-Build, Chrome headless, Textur mit Nachtlichtern)

Gemessen mit `performance.mark` im Code (Marken `wm-karte-erzeugt`, `wm-style-geladen`, `wm-globe-sichtbar` = erstes gezeichnetes Bild nach geladener Textur, `wm-laender-fertig`). Zielwert (vom Nutzer gesetzt, nicht gemessen): Globus in unter 3 Sekunden sichtbar.

| Messung | Ergebnis |
|---|---|
| Desktop 1440×900, Grafikkarte (Metal), 3 Läufe mit frischem Profil: Globus sichtbar | 2,67 s, 2,24 s, 2,19 s |
| Handy-Emulation 390×844, DPR 3, 3 Läufe: Globus sichtbar | 1,37 s, 1,89 s, 2,04 s |
| Bildrate beim Ziehen (Desktop, Grafikkarte) | 50,5 Bilder/s |
| Textur übertragen (lokal) | Desktop 1,15 MB, Handy 0,37 MB |
| Zum Vergleich vor B3 (nur Tag, 4096): sichtbar / Bildrate | 1,67–1,83 s / 57–60 Bilder/s |

Die Zahlen hängen stark von Grafikkarte und Kaltstart ab und sind **nicht** auf andere Geräte übertragbar. Nicht gemessen: Netzwerk über das Internet, Handys, Vercel.

## Ruhige Bewegung

- Nur dezente Übergänge; Fahrt zum Punkt oder zur Lage 1 Sekunde, keine Dauer-Animation, kein Pulsieren.
- Sprache: sachlich, kurz, Deutsch. Keine Ausrufezeichen, keine Alarmwörter, die die Quelle nicht selbst verwendet. Zählungen heißen „Medienaufmerksamkeit", nicht Schwere.

## Barrierefreiheit

- Kontraste wie oben, sichtbarer Fokusrahmen (`#6FA8E8`, 2 px), alles per Tastatur bedienbar (Liste, Chips, Marker, Schließen).
- Der Globus ist nie die einzige Informationsquelle: jede Meldung mit Marker steht auch in der Liste „Heute wichtig".

## Spätere Oberflächenteile (nicht in V1)

- Übersetzte Titel mit Etikett „maschinell übersetzt" und Link „Original anzeigen".
- Reiter „Märkte" (jede Zahl mit Quelle, Zeitpunkt, Etikett „verzögert"), Live-Cams (erst nach Klick laden). Beides nur mit echten Quellen.
- Länder- und Lagenseiten mit echten Meldungen (Kern laut `docs/entscheidungen.md`), Städte später.

## Umsetzung

Farben und Schriften als Tailwind-Design-Tokens (`app/globals.css` verweist auf `design/tokens-v2.css`). Bausteine: `components/Briefing.tsx` (Seite), `Globe.tsx` (Karte), `Header.tsx` (Leiste und Uhren), `globe-data.ts` (Beispieldaten), `topo.ts` (Leser für die Länderdaten).

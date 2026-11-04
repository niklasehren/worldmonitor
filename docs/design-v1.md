# WORLDMONITOR – Design (Entwurf v2, wartet auf Freigabe)

Leitbild: **Präsidenten-Briefing**. Ruhig, seriös, lesbar. Kein Neon, keine blinkenden Elemente, keine Dauer-Animationen. Sprache der Oberfläche: Deutsch.

## Farben

Gold als einzige Akzentfarbe, Rot nur für Kritisches. Alle Kontrastwerte unten sind mit der WCAG-Formel nachgerechnet (Stand 31.10.2026). Ziel: **Text mindestens 4,5:1 (AA)**, Bedienelemente und Fokusrahmen mindestens 3:1.

### Grundfarben (Flächen)

| Rolle | Hex |
|---|---|
| Nachtblau (Kopf, Karte) | `#0E1A2B` |
| Nachtblau hell (Panels auf dunklem Grund) | `#16253A` |
| Papierweiß, warm (Lesespalten) | `#F5F1E8` |
| Trennlinie auf Papier (nur dekorativ) | `#D9D2C3` |

### Farben für Text und Bedienelemente, getrennt nach Untergrund

**Auf Papierweiß `#F5F1E8` (helle Spalten):**

| Verwendung | Hex | Kontrast | AA |
|---|---|---|---|
| Haupttext (Tintenblau) | `#14202E` | 14,6:1 | ja |
| Gedämpfter Text (Grau-Blau dunkel) | `#56606F` | 5,65:1 | ja |
| Gold als Text, Links, Fokusrahmen (Gold dunkel) | `#6F5319` | 6,36:1 | ja |
| Gold dunkel, Variante für Fokusrahmen/Unterstreichung | `#7A5C1E` | 5,52:1 | ja (≥ 3:1 nötig) |
| Kritisch (Rot) | `#A63A32` | 5,69:1 | ja |
| Klare UI-Rahmen (z. B. Eingabefelder, falls nötig) | `#8C8473` | 3,29:1 | ja (≥ 3:1) |

**Auf Nachtblau `#0E1A2B` bzw. `#16253A` (dunkle Bereiche):**

| Verwendung | Hex | Kontrast (auf `#0E1A2B` / `#16253A`) | AA |
|---|---|---|---|
| Haupttext (Papierweiß) | `#F5F1E8` | 15,51:1 / 13,70:1 | ja |
| Gedämpfter Text (Grau-Blau hell) | `#A9B3C1` | 8,25:1 / 7,28:1 | ja |
| Gold (Marker, Linien, Text) | `#C9A55C` | 7,51:1 / 6,63:1 | ja |
| Kritisch (Rot, aufgehellt) | `#E0675D` | 5,22:1 / 4,61:1 | ja |

### Korrigierte Werte aus Entwurf v1 (deine Rechnung stimmt)

- Gold `#B08D4A` auf Papier: **2,76:1, nicht ausreichend** → auf Papier nie als Text oder Fokusrahmen; dort `#6F5319` / `#7A5C1E`. Als **reine Dekoration** (kurze Goldlinie unter Überschriften) darf es bleiben, trägt aber keine Information.
- Grau-Blau `#6B7686` auf Papier: **4,08:1, nicht ausreichend** → ersetzt durch `#56606F`.
- Weitere Fehler, die beim Nachrechnen auffielen: `#6B7686` auf Nachtblau nur 3,80:1 und Rot `#A63A32` auf Nachtblau nur 2,72:1. Beide fliegen raus, auf Dunkel gelten `#A9B3C1` und `#E0675D`.
- Gold `#B08D4A` auf Nachtblau (5,62:1) wäre okay, wir nehmen für Text trotzdem das hellere `#C9A55C` und `#B08D4A` nur für Flächenmarker auf der Karte (dort reicht 3:1).

Regeln:
- Gold nur für: Marker, aktive Auswahl, Linien unter Überschriften, Links (auf Papier in der dunklen Variante).
- Rot nur für wirklich Kritisches, und nur wenn es dafür eine **echte Quelle** gibt. Wir vergeben keine eigenen Schweregrade.
- Information nie allein über Farbe (immer zusätzlich Text oder Symbol).
- Fester Look, kein Dunkel/Hell-Umschalter in V1.
- Vor dem Bau werden alle Werte nochmals automatisiert getestet (kleines Skript, das bei Unterschreitung warnt).

## Schriften

| Zweck | Schrift (frei, lokal über `next/font`) |
|---|---|
| Überschriften | Serif, Vorschlag **Source Serif 4** (Alternative: Newsreader) |
| Text, Labels | Sans-Serif, Vorschlag **Inter** (Alternative: Source Sans 3) |
| Zahlen, Uhrzeiten | Monospace, Vorschlag **JetBrains Mono** oder **IBM Plex Mono** |

- Monospace **nur** für Zahlen und Uhrzeiten.
- Rubrikenlabels („LAGE HEUTE") in kleinen Versalien mit leichtem Buchstabenabstand.
- Basisschrift 16 px, Zeilenhöhe ca. 1,5. Kleinster Text 13 px und nur in den Kontrastfarben oben.
- Lokale Auslieferung der Schriften, kein Nachladen von Drittservern.

## Layout (Desktop): Dunkel – Hell – Dunkel – Hell

```
┌──────────────────────────────────────────────────────────────┐
│ ▓ Samstag, 31. Oktober 2026   Los Angeles · Washington · Wien │  Nachtblau
│ ▓                  · Moskau · Dubai · Peking   (Uhren, W→O)   │
├───────────────┬──────────────────────────────┬───────────────┤
│ ░ LAGE HEUTE  │ ▓                            │ ░ FEED        │
│ ░ 3–5 Einträge│ ▓          KARTE             │ ░ Meldungen   │  links/rechts Papier
│ ░             │ ▓   wenige weiche Marker     │ ░ neueste oben│  Mitte Nachtblau
│ ░ SEIT DEINEM │ ▓                            │ ░ Quelle·Zeit │
│ ░ LETZTEN BES.│ ▓                            │ ░             │
└───────────────┴──────────────────────────────┴───────────────┘
 ▓ = nachtblau   ░ = papierweiß      Fußzeile: „Stand: …" + Datenhinweis
```

- **Kopfzeile (nachtblau):** links Datum (Serif), rechts **sechs Uhren von West nach Ost** (Stadt klein, Uhrzeit Monospace): Los Angeles, Washington, Wien, Moskau, Dubai, Peking. Zeitzonen per IANA-Namen: `America/Los_Angeles`, `America/New_York`, `Europe/Vienna`, `Europe/Moscow`, `Asia/Dubai`, `Asia/Shanghai`. So stimmen Sommer-/Winterzeit automatisch (Brüssel entfällt). Minutenanzeige reicht. **Mobil:** die Uhren stehen in einer Reihe und sind **seitlich scrollbar** (kein Umbruch, kein Abschneiden ohne Hinweis; ein leichter Randverlauf zeigt, dass mehr kommt).
- **Links (ca. 25 %, Papier):** „Lage heute" (3–5 Einträge, Serif-Titel, Zahl und Zeitraum in Monospace, Quelle). Unter der Rubrik steht **„Sortiert nach deiner Gewichtung · Wie entsteht das?"** (klappt Formel, Gewichte und Zahlen auf; nie „objektiv wichtig"). Die rohe Zahl heißt „Medienaufmerksamkeit". Der erste Eintrag ist als Titelgeschichte größer. **Ausreißer** (Dichte weit über dem Normalwert) erscheinen unabhängig von der Gewichtung mit Marke „Ausreißer" (Text + Symbol, nicht rot) und der Angabe „5,2-fach über dem Normalwert (Median der letzten 28 Tage: XX)". Fehlt Verlauf: „nicht verfügbar – Verlauf wird aufgebaut". Darunter „Seit deinem letzten Besuch".
- **Mitte (ca. 45 %, nachtblau):** ruhige Karte, dunkle entsättigte Flächen, feine hellere Ländergrenzen, kaum Beschriftung. Wenige weiche goldene Marker (halbtransparent, weicher Rand, kein Pulsieren). Klick öffnet Detail mit Titel, Quelle, Zeitpunkt, Link.
- **Rechts (ca. 30 %, Papier):** Feed, scrollbar, **sortiert nach deiner Gewichtung** (mit derselben Kennzeichnung und „Wie entsteht das?"; Umschalter „Neueste zuerst" ergänzend möglich). Meldung: Titel (Sans, halbfett), Medium und Zeitpunkt (Monospace, gedämpft), „Original öffnen". Gruppierte Geschichten: „+ N weitere Medien" aufklappbar. Dünne Trennlinien statt Kästen.
- **Fußzeile:** „Stand: <letzter erfolgreicher Abruf>". Ab 2 Std. Verzug ein sichtbarer Hinweis „Daten möglicherweise veraltet" (Text + Symbol, nicht nur Farbe). Dazu „Automatisch aus GDELT erfasst, nicht redaktionell geprüft."
- **Leerzustände:** „nicht verfügbar" in gedämpftem Text.

## Layout (Tablet/Handy)

Einspaltig: Kopfzeile (sechs Uhren in einer Reihe, seitlich scrollbar) → Lage heute → Karte (feste Höhe) → Feed. „Seit deinem letzten Besuch" als aufklappbare Hinweiszeile oben.

## Statisches HTML-Mockup (vor dem Bau, Punkt h)

- Eine einzelne Datei `mockup/index.html` (reines HTML/CSS, kein Next.js, kein Server, kein Datenabruf), die du im Browser öffnest.
- Zeigt das Hell-Dunkel-Hell-Layout, Schriften, Farben und Highlights aus diesem Dokument.
- **Alle Inhalte sind Platzhalter und tragen sichtbar die Kennzeichnung „Beispiel"** (Banner „BEISPIELINHALTE – keine echten Daten", jede Meldung und Zahl mit Badge „Beispiel"). Keine echten Namen, Länder- oder Ereigniszahlen, damit nichts mit echten Meldungen verwechselt wird. Die Karte ist eine einfache Skizze mit Beispielmarkern.
- Entstehung erst nach deiner Freigabe (Schritt 2 im Plan). Du entscheidest dann, ob der Look passt oder Farben/Aufteilung geändert werden.

## Ruhige Highlights (Punkt i)

Vorschlag, alle **einmalig** und ohne Dauer-Animation. Zusammen höchstens 2 Sekunden:

1. **Karten-Einflug beim Laden:** Die Karte startet leicht herausgezoomt und gleitet in ca. 1,5 Sekunden sanft in den Ausschnitt. Danach stehen die Marker ruhig; sie blenden einmal gestaffelt ein (je ~150 ms). Nur beim ersten Laden einer Sitzung, nicht bei jedem Neuladen.
2. **„Seit deinem letzten Besuch" sichtbar machen:** Meldungen, die seit dem letzten Besuch neu sind, tragen im Feed eine **dünne goldene Linie am linken Rand** (auf Papier in der dunklen Goldvariante). Nach „Als gelesen markieren" bzw. nach Ablauf der 10 Sekunden blendet die Linie einmal weich aus. Kein Blinken. Zusätzlich zur Linie steht „neu" als Text.
3. **Briefkopf-Typografie:** Kopfzeile wie ein Briefkopf: großes Serif-Datum, darunter eine feine **doppelte Haarlinie** in Gold und die Zeile „Briefing für <Datum> · Stand <Uhrzeit>". Dazu kleine Versalien für Rubriken. Rein statisch, wirkt aber sofort wie ein Dokument statt wie ein Dashboard.

**Alternative bei `prefers-reduced-motion: reduce`** (Systemeinstellung „Bewegung reduzieren"):
1. Karte steht sofort im Zielausschnitt, Marker sind sofort sichtbar (keine Fahrt, kein gestaffeltes Einblenden).
2. Die goldene Randlinie neuer Meldungen bleibt stehen, bis „Als gelesen markieren" geklickt wird, und verschwindet dann ohne Überblendung.
3. Der Briefkopf ist ohnehin statisch, keine Änderung.

Die Standardvariante ist dabei immer die ruhige ohne Bewegung; die Bewegung wird nur zugeschaltet, wenn der Browser `prefers-reduced-motion: no-preference` meldet.

## Spätere Oberflächenteile (nicht in V1)

- **Übersetzte Titel:** Kennzeichnung „maschinell übersetzt" als kleines Etikett neben dem Titel (Text, nicht nur Farbe), Link „Original anzeigen". Der Originaltitel bleibt jederzeit erreichbar.
- **Reiter „Märkte":** jede Zahl mit Quelle, Zeitpunkt und Etikett „verzögert"; fehlende Werte als „nicht verfügbar". Keine Farbcodierung nach „gut/schlecht", Rot bleibt Kritischem vorbehalten.
- **Live-Cams:** Karte mit Name und Region, **erst nach Klick** wird der Player geladen. Bis dahin ein ruhiger Platzhalter. Bei Ausfall: „Stream derzeit nicht verfügbar oder nicht einbettbar – auf der Originalseite öffnen" mit Link.

## Bewegung & Ton

- Ansonsten nur dezente Übergänge (150–200 ms).
- Sprache: sachlich, kurz, Deutsch. Keine Ausrufezeichen, keine Alarmwörter, die die Quelle nicht selbst verwendet. Zählungen heißen „Medienaufmerksamkeit", nicht Schwere.

## Barrierefreiheit

- Kontraste wie oben, sichtbarer Fokusrahmen (auf Papier `#7A5C1E`, auf Nachtblau `#C9A55C`, mindestens 2 px), alles per Tastatur bedienbar.
- Die Karte ist nie die einzige Informationsquelle: jede Meldung mit Marker steht auch im Feed.

## Umsetzung

Farben und Schriften als Tailwind-Design-Tokens (zentrale Variablen), getrennt nach „auf Papier" und „auf Nachtblau", damit die Kontrastregeln im Code nicht versehentlich verletzt werden.

## Karte: Globus

Entscheidung (03.11.2026, Prototyp): Die Karte in der Mitte ist ein **3D-Globus** statt einer flachen Karte (Entwurf bleibt sonst unverändert: Layout, Farben und Schriften wie oben).

- **Technik:** maplibre-gl 6.15.0 (BSD-3-Clause), Projektion `globe` (`map.setProjection({ type: "globe" })` nach `style.load`). Ländergrenzen lokal aus `world-atlas` 2.0.2 (ISC, Daten Natural Earth), **keine externen Kartenserver**, keine Schriften, keine Beschriftung auf der Karte. Der Stil besteht nur aus Hintergrund (Meer), Länderflächen, Grenzlinien zwischen Ländern und den Punkten.
- **Bedienung:** Drehen per Ziehen (nur um Länge/Breite, keine Kippung und keine Rotation per Touch), Zoomen per Mausrad, Pinch oder Plus/Minus-Knöpfen, alles auch per Tastatur über die nummerierten Knöpfe unter dem Globus. Kein Auto-Drehen. Bei `prefers-reduced-motion: reduce` springt die Ansicht ohne Fahrt zum gewählten Punkt.
- **Farben (nur Tokens oben):** Meer `#0E1A2B` (Nachtblau), Länderflächen `#16253A` (Nachtblau hell), Grenzlinien `#A9B3C1` bei 40 % Deckkraft (nur dekorativ), Punkte Gold `#B08D4A` halbtransparent mit Rand `#C9A55C`, Auswahl: dicker Goldrand `#C9A55C`. **Kein Rot**, kein Hell/Dunkel-Umschalter.
- **Stufen nur über die Größe:** Top (Radius 15 px), Wichtig (10 px), Am Rande (6 px) bei Zoom 1; bei stärkerem Zoom wachsen die Punkte mit. Zusätzlich steht die Stufe immer als Text im Detail (Information nie nur über Größe oder Farbe). Die Stufen im Prototyp sind **Beispiel**, keine Auswertung.
- **Detail:** Klick auf einen Punkt (oder den Knopf mit seiner Nummer) öffnet eine Papierweiß-Spalte mit Nummer, Stufe, Titel, Ort und Platzhaltertext, auf dem Desktop **neben** dem Globus, auf dem Handy **darunter**. Alle Inhalte sind sichtbar als „Beispiel" gekennzeichnet.
- **Offen (nicht geprüft):** Verhalten auf schwachen Geräten ohne WebGL (heute erscheint dann „Karte nicht verfügbar" mit Fehlertext, die nummerierten Knöpfe bleiben); Anbindung echter Daten; Städte-Ebene; ob die Punkte beim Drehen auf die Rückseite einen Hinweis brauchen.
- **Technischer Hinweis:** Der Worker von maplibre-gl 6 wird vom Bundler nicht selbst gefunden. Er liegt als Kopie in `public/maplibre/` (`maplibre-gl-worker.mjs`, `maplibre-gl-shared.mjs`) und wird in `components/Globe.tsx` per `setWorkerUrl` eingebunden. Nach jeder Versionsänderung von maplibre-gl neu kopieren: `cp node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs public/maplibre/`.

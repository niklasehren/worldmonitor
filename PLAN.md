# WORLDMONITOR – Plan (v6; Schritt 2 bis 4 freigegeben, Schritt 1 zurückgestellt, ab Schritt 5 warte ich auf den Nutzer)

Persönliches Geopolitik-Dashboard im Stil eines Präsidenten-Briefings. Rein privat, Hobby. Version 1: nur echte Daten, keine KI. Oberfläche auf Deutsch (Meldungen bleiben in V1 in der Originalsprache der Quelle).

## Grundregeln

- Nur echte Daten. Fehlt etwas, steht dort **„nicht verfügbar"**.
- Jede Meldung zeigt **Quelle** und **Zeitpunkt**.
- Keine erfundenen Kennzahlen (kein DEFCON, keine „Bedrohungsstufe"). Sortierung und Rang sind **erklärt und anpassbar** (siehe Ranking).
- Geheimnisse (API-Schlüssel, Supabase-Service-Key) nur in `.env.local`, die in `.gitignore` steht. In Git liegt nur `.env.example` mit leeren Platzhaltern. Für das Holer-Skript liegen die Schlüssel als GitHub-Secrets.
- Alles kostenlos. Ich sage vorher Bescheid, wenn etwas Geld kosten könnte (oder eine Zahlungskarte verlangt wird).

## Architektur (einfach erklärt)

1. **Holer (GitHub Actions, Zeitplan):** Ein kleines Skript fragt zunächst stündlich (60 Min.) GDELT ab und schreibt die Ergebnisse in die Datenbank. Besucher lösen nie eine GDELT-Anfrage aus.
2. **Datenbank (Supabase, Postgres):** Speichert Meldungen, Zählwerte und das Protokoll.
3. **Webseite (Next.js auf Vercel Hobby):** Liest nur aus der Datenbank.

```
GDELT --(Zeitplan)--> Holer-Skript --> Supabase <-- Next.js-Seite <-- Browser
```

Begriffe: *Cron* = Zeitplan für automatische Aufgaben. *API* = Schnittstelle, über die Programme Daten abrufen. *Postgres* = die Art Datenbank, die Supabase nutzt.

## Stack

Next.js (App Router) + TypeScript + Tailwind + MapLibre + Supabase, wie gewünscht. Ergänzungen mit Begründung:
- **Karte ohne Kachel-Anbieter:** Ländergrenzen aus freien Geodaten (z. B. Natural Earth, als GeoJSON) statt Kartenkacheln. Kein Schlüssel, keine Kosten, passt zum ruhigen Look.
- **Holer in TypeScript** (Node in GitHub Actions): eine Sprache für alles.
- **Einstellungen als Dateien im Repo** (`config/…`, JSON): Gewichtung, Themen, später Live-Cams. Änderbar ohne Programmierkenntnisse, nachvollziehbar in der Git-Historie.

## Geprüfte Rahmenbedingungen (Stand 31.10.2026, aus Dokumentation)

**GitHub Actions (privates Repo):**
- Quelle: [GitHub Docs, Abrechnung](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions). Das Free-Konto enthält **12 USD Nutzungsguthaben pro Monat**, nicht eine feste Minutenzahl. Bei 0,006 USD/Min. (Linux, 2 Kerne) sind das rechnerisch **ca. 2.000 Minuten** (meine Umrechnung). Öffentliche Repos sind kostenlos, aber wir bleiben bei privat.
- **Start mit 60 Min. Takt** = 24 Läufe/Tag ≈ **720 Läufe/Monat**. Ob pro Lauf auf ganze Minuten aufgerundet wird, steht in der Doku nicht. **Annahme: Aufrundung auf 1 Min.** Dann sind es ca. 720 Min. (~36 % des Guthabens). Auf **30 Min. (≈ 1.440 Min./Monat, ~72 %) gehen wir nur, wenn die gemessene Laufzeit klar unter einer Minute liegt** (Messung über mehrere Läufe, Kontrolle im GitHub-Abrechnungs-Dashboard).
- **Laufzeit-Warnung:** Bei GDELT sind mindestens 5 Sekunden Pause zwischen Abfragen nötig. 6 Themen × 2 Sprachen = 12 Abfragen ≈ 60 Sekunden **allein an Wartezeit**. Ein Lauf dauert damit eher 1,5–2 Minuten (= 2 abgerechnete Minuten, ca. 1.440 Min./Monat bei 60 Min. Takt, ~72 %). Maßnahmen, im Test zu prüfen: Sprachen in einer Abfrage zusammenfassen, Themen bündeln, oder Läufe nach Themen verteilen. **30 Min. Takt ist damit wahrscheinlich nicht drin** (würde ~2.900 Min. kosten und das Guthaben sprengen).
- Zeitpläne: kleinstes Intervall 5 Min.; Läufe können **bei hoher Last verspätet** starten oder ausfallen, vor allem **zur vollen Stunde**. Darum legen wir die Läufe auf „krumme" Minuten (z. B. Minute 7). Zeitpläne laufen nur auf dem Standard-Branch und in UTC. ([Doku](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows))
- Ausgabenlimit auf 0 USD (Teil von Schritt 1, jetzt zurückgestellt; spätestens vor Schritt 9, dem ersten Zeitplan-Lauf), damit nichts abgebucht werden kann.

**Abschaltung bei Inaktivität:**
- Laut Doku werden Zeitpläne **in öffentlichen Repos nach 60 Tagen ohne Repo-Aktivität automatisch abgeschaltet**. Für **private Repos** sagt die Doku dazu nichts, ich kann also weder bestätigen noch ausschließen, dass es dort gilt.
- Vorsorge: (1) Die Seite zeigt immer „Stand: <Zeitpunkt des letzten erfolgreichen Abrufs>" und ab 2 Stunden Verzug einen sichtbaren Hinweis „Daten möglicherweise veraltet". (2) Fehlgeschlagene Läufe melden GitHub per E-Mail (Standardeinstellung, wir prüfen sie). (3) Kalendererinnerung alle 6 Wochen („Actions-Zeitplan noch aktiv?"). (4) Falls abgeschaltet: ein Klick auf „Enable workflow". Keine Dummy-Commits, solange sie nicht nötig sind.

**Supabase Free:** Laut [Supabase-Preisseite und Übersichten](https://supabase.io/pricing) werden Free-Projekte nach 1 Woche Inaktivität pausiert, maximal 2 aktive Projekte, 500 MB Datenbank je Projekt. Dein neues Projekt wäre dein **zweites**. Annahme: Der Holer-Schreibzugriff zählt als Aktivität. Zahlen teils aus Drittquellen, wir prüfen sie beim Anlegen im Dashboard.

**Vercel Hobby:** kostenlos für private, nicht-kommerzielle Nutzung, passt zu deinem Projekt.

Für Phase 1 (GDELT, Vercel, Supabase, GitHub) braucht nichts eine Kreditkarte. Für spätere Phasen siehe unten (DeepL!).

## Datenquelle Phase 1: GDELT – Testen vor Bauen

GDELT (kostenlos, kein Schlüssel) bietet drei Zugänge. Laut Dokumentation:

| Zugang | Was liefert er | Für uns wahrscheinlich |
|---|---|---|
| **DOC 2.0 API** (Artikel) | Artikelliste (`ArtList`), max. 250 Treffer pro Abfrage (Standard 75), Zeitfenster ab 15 Min., Filter nach Sprache und Medienland, Ausgabe u. a. JSON. Laut Doku **keine Ortsangaben pro Artikel**, nur Medienland | Feed |
| **GEO 2.0 API** (Orte) | Orte, die in Texten rund um einen Suchbegriff erwähnt werden, als GeoJSON, 1–1.000 Punkte, je Punkt bis zu 5 Artikel; Aktualisierung alle 15 Min.; Zeitfenster 15 Min. bis 7 Tage. Ortszuordnung kann Fehler enthalten (gleiche Städtenamen) | Karte (Kandidat) |
| **15-Minuten-Dateien** (`export`, `mentions`, `gkg` unter `data.gdeltproject.org/gdeltv2/`) | Ereignisse (Event-Datei) mit Ereignisort und Koordinaten, Quell-URL, Zahl der Erwähnungen | Karte (Kandidat) und Zählung |

Das ist Stand der Doku. **Was wirklich geliefert wird, zeigt erst der Test.** (Die Event-Datei hat laut GDELT-Handbuch u. a. Felder für Ereignisland/-koordinaten und Zahl der Erwähnungen, aber vermutlich keine Artikeltitel. Das prüfen wir.)

### Test (Schritt 5), Vorgehen

Ein kleines Test-Skript (läuft einmal von Hand, schreibt nichts in eine Datenbank) holt je Zugang eine Stichprobe und erzeugt einen Bericht `docs/gdelt-test.md`:
- Welche Felder gibt es wirklich, wie oft fehlen Koordinaten, Titel, Sprache?
- Wie viele Treffer pro Stunde? Wie groß sind die Dateien? Wie lange dauert ein kompletter Lauf (Pausen eingerechnet)?
- Wie viele Dubletten (gleiche URL, gleiche Geschichte)? Wie viele **unabhängige Medien** (verschiedene Domains) pro Geschichte?
- Wie gut passen Orte zu den Artikeln (Stichprobe von 20 von Hand geprüft)? Was bedeutet das Länderfeld je Zugang (Medienland oder Ereignisland)?
- **Themenfilter (neu):** Für jedes der sechs Themen (siehe unten) prüfen wir, welche Filter brauchbar sind: GDELTs Themenkürzel (GKG-Themen) und/oder Suchbegriffe. Pro Thema Stichprobe von 20 Treffern von Hand: Passt der Treffer zum Thema? Wie viel Unpassendes kommt durch („Rauschen")? Wie viel Wichtiges fehlt? Besonders bei „Märkte und Wirtschaft" (Notenbanken, Gold, Börsen) ist offen, ob GDELT-Themen dafür taugen oder nur Suchbegriffe.
- **Logarithmus-Skala (neu):** Wir bilden aus den Testdaten für mehrere Zeitpunkte die Top-20-Liste mit **roher** Medienzahl und mit **log(1 + M)** (sonst gleiche Formel und gleiche Startgewichte). Verglichen wird: (1) wie stark die Listen übereinstimmen; (2) wie oft eine einzelne Großgeschichte mehr als die Hälfte der Top 10 belegt; (3) eine **verdeckte Handbewertung** (du beurteilst beide Listen, ohne zu wissen, welche welche ist: Welche Reihenfolge wirkt sinnvoller?); (4) wie stabil die Reihenfolge von Lauf zu Lauf ist. Das Ergebnis ist ein Vorschlag, die Entscheidung triffst du (Schalter `medienzahl.skala` in `config/weights.json`).
- **Eilmeldungs-Geschwindigkeit (neu):** Wir messen die realistische **Verzögerung vom Ereignis bis zur Anzeige**, zerlegt in Stufen: (a) Ereignis bzw. früheste Meldung (als Näherung dient die früheste Veröffentlichungszeit eines Artikels, der genaue Ereigniszeitpunkt ist nicht bekannt); (b) bis GDELT den Artikel erfasst und in den 15-Minuten-Dateien bzw. der API zeigt; (c) bis das **zweite unabhängige Medium** erscheint (Auslöserbedingung); (d) bis unser Holer es abruft (mit 60 Min. Takt bis zu 60 Min. Wartezeit; 15 oder 30 Min. werden nur durchgerechnet, nicht gebaut); (e) bis die Seite es anzeigt. Ergebnis: Median und 90-%-Wert der Gesamtverzögerung für 15-, 30- und 60-Minuten-Takt, aus rückwirkend ausgewerteten echten Fällen. Ist 60 Minuten für eine Eilmeldung zu langsam, besprechen wir Optionen (z. B. ein eigener, schlanker Abruf nur für diesen Pfad, mit Kosten- und Laufzeitprüfung). Bis dahin versprechen wir keine Geschwindigkeit.
- **Eilmeldungs-Regel (neu):** Welche GDELT-Ereignisfelder und -codes taugen für „schweres Ereignis"? Wie oft löst die Regel (≥ 2 unabhängige Medien in 60 Min.) rückwirkend über mehrere Tage aus, und wie hoch ist die Fehlalarmquote laut Handprüfung einer Stichprobe?
- **Verlaufsdaten (neu):** Wie viele (Land, Thema)-Kombinationen haben regelmäßig Treffer, wie stark schwanken die Zahlen im Tagesverlauf und über Wochentage? Daraus schätzen wir den Speicherbedarf für die Ausreißererkennung.
- Antwortzeit, Fehlerverhalten bei zu schnellen Anfragen (Pause ≥ 5 Sek.).

**⏸ Zwischenstopp nach Schritt 5** (siehe Schritte).

### Themen (V1)

Sechs feste Themen (Datei `config/topics.json`, jedes mit Anzeigename, Filter und Themengewichtung):
1. Konflikte
2. Diplomatie
3. Sanktionen
4. Wahlen und Regierungswechsel
5. Energie und Rohstoffe
6. Märkte und Wirtschaft (Notenbanken, Gold, Börsen)

Eine Meldung kann mehreren Themen zugeordnet sein. Die Filter werden erst nach dem Test festgelegt.

### Welche Artikel der Holer abruft – Vorschlag, im Test zu bestätigen

- **Auswahl über die sechs Themen** (Filter laut Test).
- **Sprachen:** zunächst Deutsch und Englisch (weitere später).
- **Zeitfenster pro Lauf:** die letzten 90 Minuten (überlappend zum 60-Minuten-Takt, damit bei Verspätungen nichts verloren geht; Dubletten fängt der eindeutige Schlüssel ab).
- **Maximalzahl:** höchstens 75 Treffer je Abfrage und höchstens 300 neue Einträge je Lauf. Pause von mindestens 5 Sekunden zwischen Abfragen. Werden Grenzen erreicht, steht das im Protokoll (`fetch_runs`), nicht still verschluckt.
- **Dubletten:**
  1. *Gleicher Artikel:* normalisierte URL (ohne Tracking-Parameter) als eindeutiger Schlüssel.
  2. *Gleiche Geschichte, mehrere Medien:* Titel werden normalisiert und per Wortüberlappung verglichen (Schwelle im Test festlegen, Startwert 80 %, Zeitfenster 48 Std.). Treffer werden **gruppiert**: ein Leit-Eintrag plus „+ N weitere Medien", alle Quellen einzeln aufklappbar. Nichts wird gelöscht. Kein KI-Einsatz.
  3. *Grenze:* „Unabhängig" heißt hier nur „verschiedene Medien-Domains". Gehören zwei Domains demselben Eigentümer oder übernehmen beide eine Agenturmeldung, erkennen wir das nicht sicher. Das steht offen in „Wie entsteht das?".

## Ranking: „nach deiner Gewichtung"

**Ziel:** Meldungen/Geschichten und „Lage heute" werden nach einem nachvollziehbaren Rang sortiert, nicht nach dem Zufall der Uhrzeit.

**Formel (Vorschlag):**

```
Rang = M × G_Land × G_Thema × A
```

| Faktor | Bedeutung | Startwerte (änderbar) |
|---|---|---|
| **M** | Zahl **unabhängiger Medien** (verschiedene Domains), die über dieselbe Geschichte berichten | gezählt, nicht geschätzt |
| **G_Land** | Gewichtung des Ereignislandes: **Basis / erhöht / hoch** | Faktor 1,0 / 1,5 / 2,0; **nicht gelistete Länder = Basis** |
| **G_Thema** | Gewichtung des Themas, **getrennt** von den Ländern: Stufe 1, 2, 3 | Faktor 1,0 / 1,5 / 2,0 |
| **A** | Aktualität: halbiert sich alle 12 Stunden nach der jüngsten Meldung der Geschichte | `A = 0,5^(Alter in Std. / 12)` |

**Zu prüfende Variante (Logarithmus):** Statt der rohen Medienzahl M könnte `log(1 + M)` verwendet werden. Beispiel in Worten: Bei der rohen Zahl wiegt eine Geschichte mit 40 Medien doppelt so viel wie eine mit 20. Mit dem Logarithmus wiegt sie nur etwas mehr (log(41) ≈ 3,7 gegenüber log(21) ≈ 3,0). Große Geschichten würden kleinere also weniger verdrängen, und die Gewichtung für Land und Thema hätte mehr Einfluss. Welche Variante besser sortiert, entscheidet der Test (siehe dort).

Alle Startwerte sind Vorschläge von mir, keine Fakten. Wir justieren sie nach dem Test und nach einigen Tagen Nutzung.

**Konfiguration:** `config/weights.json` (Länder: Basis / erhöht / hoch mit Faktoren 1,0 / 1,5 / 2,0, nicht gelistete Länder = Basis; Themen: Stufen 1–3; Halbwertszeit; Faktoren je Stufe; Medienzahl roh oder logarithmisch). Die Länderlisten sind eingetragen (Stand 01.11.2026): **hoch** = USA, Russland, China, Ukraine, Israel, Palästina (in GDELT: Gaza-Streifen + Westjordanland, zwei Codes), Iran, Deutschland, Frankreich, Großbritannien, Österreich, Türkei; **erhöht** = übrige EU-Länder, Indien, Japan, Taiwan, Saudi-Arabien, Vereinigte Arabische Emirate, Schweiz; alles andere = Basis. Die Länder stehen mit GDELTs FIPS-Codes in der Datei. Änderung = Datei bearbeiten und committen. Jede Änderung ist in Git nachvollziehbar.

**„Lage heute":** Ein Eintrag ist ein Paar aus (Ereignisland, Thema) über die letzten 24 Std. Sein Rang nutzt die Summe der unabhängigen Medien über alle Geschichten dieses Paares und die Aktualität der jüngsten Meldung. Nur das **Ereignisland** zählt, nie das Land des Mediums (bei der DOC-API ist das Länderfeld laut Doku das Medienland, dort also nicht verwendbar). Ohne verlässliches Ereignisland entsteht kein Eintrag („nicht verfügbar"). 3–5 Einträge, davon bis zu 2 Plätze für Ausreißer und bis zu 2 Plätze für Eilmeldungen (siehe unten), mindestens 1 Platz für den normalen Rang.

**Sprache der Oberfläche:** Die Sortierung heißt **„nach deiner Gewichtung"**, niemals „objektiv wichtig", „Schwere" oder „Gefahr". Daneben immer **„Wie entsteht das?"**: klappt die Formel, die verwendeten Gewichte und die Zahlen auf. Pro Eintrag sind M, Gewichtung (Basis / erhöht / hoch bzw. Themenstufe) und Aktualität einsehbar. Die rohe Zahl der Meldungen steht zusätzlich als „Medienaufmerksamkeit" da.

**Ausnahmeregel „Ausreißer":** Starke Abweichungen der Meldungsdichte vom Normalwert erscheinen **unabhängig von der Gewichtung** und sind klar als „Ausreißer" gekennzeichnet (Text und Symbol, keine Rotfärbung, solange die Quelle nichts Kritisches markiert).
- **Messgröße:** Zahl der Geschichten je (Land, Thema) in rollierenden 24 Std. Ob zusätzlich der Anteil am GDELT-Gesamtvolumen nötig ist (GDELT-Ausfälle oder Wachstum verfälschen sonst), klärt der Test.
- **Normalwert:** Median der letzten 28 Tage derselben Messgröße. Streuung: robuste Streuung (MAD).
- **Ausreißer, wenn:** Abweichung ≥ 3,5 robuste Streuungen (Startwert) **und** Mindestmenge (z. B. ≥ 10 Geschichten von ≥ 3 unabhängigen Medien, Startwert), damit kleine Zahlen keinen Fehlalarm geben. Ist die Streuung 0 (viele Nullen), gilt ersatzweise: ≥ 5-faches des Mittelwerts und Mindestmenge.
- **Anzeige:** „Ausreißer: 5,2-fach über dem Normalwert (Median der letzten 28 Tage: XX)". Echte Zahlen, nichts geschätzt.
- **Ehrlich bei zu wenig Verlauf:** Weniger als 7 Tage Verlauf: „nicht verfügbar – Verlauf wird aufgebaut". Bis 28 Tage: Hinweis „Normalwert noch unsicher".

**Wie viel Verlauf wird gebraucht, reichen 14 Tage?**
- **Meldungen selbst:** 14 Tage Aufbewahrung reichen für Feed, Lage heute und „Seit deinem letzten Besuch".
- **Ausreißer:** 14 Tage reichen **knapp** nicht. Mit 14 Tagen gibt es nur zwei gleiche Wochentage, ein Wochenend-/Werktagsmuster lässt sich nicht sauber herausrechnen, und ein einzelnes langes Ereignis (z. B. 10 Tage Dauerkrise) zieht den „Normalwert" selbst nach oben. Ein Normalwert aus 28 Tagen ist deutlich robuster.
- **Lösung ohne Speicherproblem:** Rohmeldungen weiter nur **14 Tage** speichern, aber die **Zählwerte** (Tabelle `counts`: Zeitpunkt, Land, Thema, Zahl Geschichten, Zahl unabhängiger Medien) **90 Tage** behalten. Das sind nur wenige Zahlen je Lauf. Grobe Schätzung (Annahme, im Test zu prüfen): 24 Läufe/Tag × ca. 100 aktive (Land, Thema)-Paare × 90 Tage ≈ 216.000 Zeilen, klein gegenüber den 500 MB. Mit 90 Tagen können wir später auch 28-Tage-Normalwerte mit Wochentagsbereinigung ermöglichen.
- **Anlaufphase:** Ausreißer gibt es erst ab 7 Tagen Verlauf, stabil ab 28 Tagen. Das sagt die Oberfläche offen.

## Eilmeldungs-Regel: „Erste Meldungen, noch unbestätigt"

**Ziel:** Sehr frische, schwere Ereignisse sollen auch dann oben erscheinen, wenn erst wenige Medien berichten, **in jedem Land, unabhängig von der Gewichtung (Basis, erhöht, hoch oder nicht gelistet)**. Die Länder-Gewichtung darf eine solche Meldung weder verstecken noch verschieben.

**Auslöser (beide Bedingungen müssen erfüllt sein):**
1. **Schwerer Ereignistyp** laut GDELT-Ereigniscodes. Welche Felder dafür taugen, klärt der Test. Kandidaten (aus dem Gedächtnis zum GDELT/CAMEO-Handbuch, noch nicht geprüft): der Ereignis-Hauptcode (z. B. Gewaltanwendung, Angriffe, Massengewalt) und die Konfliktklasse. Die Liste der zählenden Codes liegt in `config/breaking.json` und wird nach dem Test festgelegt.
2. **Mindestens 2 voneinander unabhängige Medien** (verschiedene Domains, wie beim Ranking definiert) berichten **innerhalb von 60 Minuten** über dasselbe Ereignis.

Beide Zahlen (2 Medien, 60 Minuten) sind Startwerte und werden nach dem Test eingestellt.

**Anzeige:**
- Klar sichtbar die Kennzeichnung **„Erste Meldungen, noch unbestätigt"** (Text und Symbol, nicht nur Farbe, nicht rot).
- Darunter **alle beteiligten Quellen** mit Zeitpunkt und Link, dazu der Ereignistyp in Worten und das Ereignisland. Kein Rang, keine Gewichtung, keine eigene Schweregradzahl.
- Keine Formulierung, die Bestätigung nahelegt. Wir zeigen nur, was GDELT erfasst hat, und wer es berichtet.
- Der Eintrag bleibt als Eilmeldung zunächst 6 Stunden stehen (Startwert) und läuft danach in die normale Sortierung. Er verschwindet nicht aus dem Feed.

**Reservierte Plätze in „Lage heute":**
- Von den 3–5 Einträgen sind **bis zu 2 Plätze für Eilmeldungen** reserviert, **unabhängig von der Länder-Gewichtung**. Zusätzlich gelten die bis zu 2 Plätze für Ausreißer. Mindestens 1 Platz bleibt für den normalen Rang.
- Gibt es mehr Auslöser als Plätze, gelten zuerst die frischesten, dann die mit mehr unabhängigen Medien. Die übrigen erscheinen im Feed, ebenfalls mit der Kennzeichnung.
- Ohne Auslöser bleiben die Plätze frei und werden vom normalen Rang belegt. Nichts wird aufgefüllt oder erfunden.

**Fehlalarme (im GDELT-Test, Schritt 5):**
- Der Test rechnet die Regel **rückwirkend über mehrere Tage** nach (soweit die 15-Minuten-Dateien von GDELT zurückreichen) und zählt, wie oft sie auslöst.
- Eine **Stichprobe von Auslösern wird von Hand beurteilt**: Beschreiben die Titel wirklich ein schweres, frisches Ereignis? Oder handelt es sich um Altes, Jahrestage, Übungen, Fehlzuordnungen, Rückblicke oder falsch geortete Orte? Daraus ergibt sich eine **Fehlalarmquote** je Ereignistyp.
- Wir prüfen, wie viele Auslöser pro Tag entstehen. Zu viele wären Rauschen, zu wenige würden die Regel wirkungslos machen.
- Danach **stellen wir gemeinsam ein**: Liste der Ereigniscodes, Mindestzahl unabhängiger Medien, Zeitfenster, Haltedauer, Mindest-Ortsqualität. Vorher gilt die Regel nur als Entwurf.
- Grenze: GDELT-Ereigniscodes werden maschinell vergeben und können falsch sein. Die Kennzeichnung „noch unbestätigt" ist deshalb Pflicht und bleibt auch nach der Einstellung.

## Datenbank (Entwurf, Schema folgt aus dem Test)

Voraussichtlich:
- `items`: Meldung/Artikel (`source`, `source_url`, `external_id` eindeutig, `title`, `publisher`, `domain`, `published_at`, `fetched_at`, `language`, `topics`, `group_id` für „gleiche Geschichte"). Aufbewahrung 14 Tage.
- `events` (falls Ereignisdaten genutzt werden): Ereignisort (`country`, `lat`, `lon`), Zahl der Erwähnungen, Quell-URL, Zeitpunkt.
- `counts`: Zählwerte je Lauf, Land, Thema (für Ausreißer). Aufbewahrung 90 Tage.
- `fetch_runs`: Protokoll jedes Laufs (Zeit, Quelle, neue Einträge, Fehlertext). Basis für „Stand: …".
- Später: `translations` (siehe unten).
- Zeilenschutz (Row Level Security): Webseite nur lesen, Schreiben nur der Holer mit Service-Key.
- Automatisches Aufräumen alter Zeilen.

## „Seit deinem letzten Besuch"

- Der Zeitpunkt des letzten Besuchs liegt im Browser (localStorage), kein Login.
- **Ablauf:** Beim Laden wird der **alte Wert gelesen und im Speicher der Seite festgehalten**. Der **neue Wert wird nicht beim Verlassen geschrieben**, sondern erst, wenn die Seite **mindestens 10 Sekunden sichtbar geöffnet** war oder du auf „Als gelesen markieren" klickst.
- Beim ersten Besuch: „Erster Besuch – noch kein Vergleich möglich". Ist der Browserspeicher blockiert/leer: gleicher Hinweis.
- Gilt pro Browser/Gerät.

## MVP-Schritte

Nach jedem Schritt zeige ich dir das Ergebnis. **Freigegeben sind Schritt 2 bis 4 (Schritt 1 ist zurückgestellt). Bei jedem Installationsbefehl frage ich vorher und erkläre ihn kurz. Bei Schritt 5 und dem Zwischenstopp warte ich auf dich.**

1. **Vorbereitung – zurückgestellt bis nach dem Zwischenstopp** (vorher kein Konto bei Supabase/Vercel und kein Setzen des Limits): Vercel-Konto, neues Supabase-Projekt (dein zweites), GitHub-Actions-Ausgabenlimit 0 USD. Node ist geprüft (v24.21.0). Zeitpunkte: Supabase vor Schritt 7, Ausgabenlimit vor Schritt 9, Vercel vor Schritt 14. Der GDELT-Test (Schritt 5) läuft nur lokal und braucht nichts davon.
2. **Statisches HTML-Mockup** (erledigt, Freigabe erteilt). Es nutzt dieselben Farb- und Schrift-Tokens (`design/tokens.css`). **Anpassungen aus v4 (Uhren: LA, Washington, Wien, Moskau, Dubai, Peking; mobil seitlich scrollbar) fließen mit Schritt 4 ein.**
3. **Projektgerüst:** Next.js + TypeScript + Tailwind, `.gitignore` mit `.env*`, `.env.example`, erster Commit.
4. **Design-Grundlage:** Farben/Schriften als Tailwind-Tokens, leeres Layout mit Kopfzeile und den sechs Uhren (IANA-Zeitzonen).
5. **GDELT-Test:** wie oben (inkl. Themenfilter und Verlaufsdaten), Bericht `docs/gdelt-test.md`. Keine Datenbank. **Hier warte ich auf dich.**
   **⏸ Zwischenstopp nach Schritt 5:** Ich stelle dir den Testbericht vor. **Wir entscheiden gemeinsam, ob und wie wir weitermachen, bevor die Datenbank entsteht.** Mögliche Ergebnisse: weiter wie geplant, andere Quellenaufteilung, Themenfilter ändern, Plan ändern oder GDELT verwerfen. Ohne dein ausdrückliches OK beginnt Schritt 7 nicht.
6. **Entscheidung:** Quelle für Karte, Quelle für Feed, Themenfilter, Abrufregeln, Dublettenregel, Ranking-Startwerte mit echten Zahlen festziehen. `PLAN.md` wird angepasst.
7. **Datenbank:** Schema aus echten Feldern (inkl. `counts`), Zeilenschutz, Aufräumregeln.
8. **Holer lokal:** Abrufen → Speichern ohne Dubletten → Zählwerte → Protokoll.
9. **Zeitplan in GitHub Actions** (60 Min., krumme Minute, Laufzeit über mehrere Läufe messen, Fehlermails prüfen).
10. **Feed (rechts)** mit Quelle, Zeitpunkt, „Stand: …", sortiert „nach deiner Gewichtung".
11. **Karte (Mitte)** nur mit echten Koordinaten.
12. **„Lage heute" (links)** nach Rangformel, Ausreißerplätze, Eilmeldungsplätze („Erste Meldungen, noch unbestätigt"), „Wie entsteht das?".
13. **„Seit deinem letzten Besuch".**
14. **Deployment auf Vercel,** Umgebungsvariablen eintragen, Live-Test.

## Phase 1b: Übersetzung (nach dem Feed, also nach Schritt 10; nicht Teil des MVP)

**Ziel:** Hauptsprache Deutsch. Quellen zunächst Deutsch und Englisch. Später Übersetzung **nur für angezeigte Spitzenmeldungen** (z. B. die Top-Einträge im Feed und „Lage heute"), nicht für alles.
- Ergebnis wird in der Datenbank gespeichert (`translations`: Original-ID, Zielsprache, Text, Anbieter, Zeitpunkt), damit nichts doppelt übersetzt wird.
- Kennzeichnung **„maschinell übersetzt"** an jedem übersetzten Titel; **Original per Klick** sichtbar. Quelle und Zeitpunkt bleiben die der Originalmeldung.
- Nur Titel, keine ganzen Artikel (Urheberrecht, Zeichenbudget).
- **Zeichenbudget selbst begrenzen:** Zähler in der Datenbank, hartes Stopp bei 80 % des Monatskontingents. Ist das Kontingent aufgebraucht, erscheint das Original ohne Übersetzung („Übersetzung nicht verfügbar").

**DeepL API Free (geprüft, mit Lücken):**
- Offiziell: DeepL API Free erlaubt laut [DeepL-Hilfeseite](https://support.deepl.com/hc/en-us/articles/360021200939-DeepL-API-Free) bis zu **500.000 Zeichen pro Monat** kostenlos (so in der Suche angezeigt; die Seite selbst konnte ich nicht abrufen, sie blockte mit 403).
- **Zahlungskarte: sehr wahrscheinlich ja.** Drittquellen (z. B. [MergADO-Forum](https://forum.mergado.com/t/how-to-translate-both-new-and-changed-products-for-free/896)) berichten, dass die Registrierung eine Kredit-/Debitkarte zur Identifikation verlangt. DeepL selbst konnte ich dazu nicht abrufen. **Das ist nicht bestätigt.** Vor der Anmeldung schaust du auf der DeepL-Anmeldeseite nach, ob eine Karte verlangt wird.
- **Kostenrisiko:** Die Karte wäre laut Drittquellen nur zur Identifikation, der Free-Tarif soll bei Erreichen des Limits **stoppen und nicht automatisch Geld berechnen**. Auch das ist nicht aus der offiziellen Quelle bestätigt. Es gibt zudem andere Tarifnamen (Developer, Growth), die kosten. **Du darfst dich nicht versehentlich für einen bezahlten Tarif anmelden.**
- **Meine Empfehlung:** Erst entscheiden, wenn Phase 1b ansteht. Wenn du keine Karte hinterlegen willst, lassen wir die Übersetzung weg: Titel erscheinen dann in der Originalsprache, DE und EN bleiben ja gut lesbar. Ich frage dich vorher.
- **Mengenschätzung (Annahme):** 30 Spitzenmeldungen/Tag × ca. 120 Zeichen Titel × 30 Tage ≈ 108.000 Zeichen/Monat, also grob ein Fünftel des Kontingents. Der echte Wert hängt von der Anzahl der Spitzenmeldungen ab.
- Offen, vor Start zu prüfen: DeepL-Nutzungsbedingungen zum Speichern von Übersetzungen in einer eigenen Datenbank, Verfügbarkeit für Österreich, aktueller Stand der Tarifnamen.

## Phase 2 (nicht im MVP)

### a) Reiter „Märkte" (verzögerte Kurse: Gold, Öl, Indizes)

Noch nicht entschieden. Bisherige Recherche (dünn, bitte nicht als Zusage lesen):
- **Alpha Vantage:** [Support-Seite](https://www.alphavantage.co/support/#support): kostenloser Schlüssel mit **25 Anfragen pro Tag** für die meisten Datensätze. Laut einer Übersichtsseite sind verzögerte/Echtzeit-US-Aktienkurse kostenpflichtig. Ob öffentliche Anzeige erlaubt ist, steht dort nicht, steht ggf. in den Nutzungsbedingungen. **Offen.**
- **FRED (Notenbank St. Louis):** Die Nutzungsbedingungen konnte ich nicht abrufen. Aus dem Gedächtnis (nicht geprüft): kostenloser API-Schlüssel, Tageswerte für einzelne Rohstoff- und Zinsreihen. Nicht für alle Indizes/Gold geeignet.
- **Twelve Data, Stooq:** nicht geprüft.
- **Vorgehen für Phase 2:** Eigener Rechercheschritt mit Kurzvergleich: Limit, Verzögerung, Nutzungsbedingungen für Anzeige, Attribution, Kosten, Karte nötig? Jeder Kurs mit **Quelle, Zeitpunkt und „verzögert"-Kennzeichnung** in der Oberfläche. Wo keine kostenlose, zulässige Quelle existiert, steht „nicht verfügbar". Keine Kurse schätzen oder erfinden.
- Nur Anzeige, keine Prognosen, keine Empfehlungen.

### b) Live-Cams

- **Nur offizielle Einbettungen** (Einbettungscode, den der Betreiber selbst freigibt, z. B. YouTube-Einbettung eines Kanals, der Einbetten erlaubt). Kein Abgreifen von Streams, keine Umgehung.
- **Handverlesene Liste** in `config/webcams.json`: Name, Region, Anbieter, Einbettungs-Adresse, Link zur Originalseite, Datum der letzten Prüfung.
- **Erst bei Klick laden:** Bis dahin nur ein ruhiges Platzhalterbild/Text. Dadurch wird beim Seitenaufruf nichts von Drittanbietern geladen (Datenschutz, Tempo).
- **Hinweis bei Ausfall:** „Stream derzeit nicht verfügbar oder nicht einbettbar – auf der Originalseite öffnen" mit Link.
- **Geprüft (YouTube):** Laut [YouTube-Hilfe/Drittquellen](https://support.google.com/youtube/answer/171780) können Betreiber das Einbetten einzelner Videos/Streams abschalten (dann Fehler 101/150), das lässt sich von unserer Seite nicht umgehen. Laut [YouTube Developer Policies](https://developers.google.com/youtube/terms/developer-policies) darf der Player nicht verändert, Links/Werbung nicht verdeckt oder blockiert werden, Autoplay beim Seitenaufruf ist datenschutzrelevant (daher aus), und der Zugang zum Video darf nicht an etwas anderes als den Klick auf „Abspielen" geknüpft sein. Ob unsere Vorschau-Lösung mit einem Klick zum Laden und Abspielen damit konform ist, **prüfe ich vor dem Bau genauer**. Live-Streams werden in den Richtlinien nicht gesondert erwähnt, die allgemeinen Player-Regeln gelten also vermutlich auch dafür. Die Auswahl der Kameras trifft später gemeinsam mit dir, jede mit geprüfter Einbettungserlaubnis.
- Kosten: keine bekannt.

## Spätere Phasen (offen)

ReliefWeb (braucht freigegebenen `appname`, den du beantragst), weitere Quellen und Sprachen, Filter nach Region/Thema, Verlauf. KI-Funktionen erst nach separater Entscheidung und Kostenprüfung.

## Offene Punkte

- Ergebnis des GDELT-Tests (Schritt 5) bestimmt Karte, Feed, Schema, Themenfilter und Ranking-Startwerte.
- Wahrscheinlich Laufzeit pro Lauf > 1 Minute (viele Abfragen mit 5 Sek. Pause) → Takt bleibt bei 60 Min.
- Ob GitHub private Repos bei Inaktivität abschaltet, ist nicht dokumentiert (Vorsorge siehe oben).
- DeepL: Kartenpflicht und Tarifdetails unbestätigt (nur Phase 1b).
- Märkte: noch keine geprüfte kostenlose, für Anzeige zulässige Quelle.

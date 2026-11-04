# Datenpipeline (GitHub Actions) – Stand 04.11.2026

Kennzeichnung: **gemessen** = lokal nachgemessen, **Schätzung** = Rechnung aus gemessenen Größen, **Annahme** = nicht geprüft. **Die Pipeline wurde noch nie in GitHub Actions ausgeführt** (Repo ist nicht gepusht); getestet ist die Logik im lokalen Trockenlauf mit dem vorhandenen Cache.

## Ablauf eines Laufs (`scripts/pipeline/lauf.mjs --modus netz`)
1. `lastupdate.txt` von `https://data.gdeltproject.org/gdeltv2/` lesen: neuester 15-Minuten-Zeitpunkt.
2. Alle Zeitpunkte nach dem letzten im Zustand holen: je Zeitpunkt `export`, `mentions`, `gkg` (https, nacheinander, **mindestens 5 s Pause** zwischen Anfragen, 3 Versuche, 404 = Zeitpunkt fehlt). Nichts wird als Rohdatei behalten.
3. Je Zeitpunkt eine kleine Zusammenfassung schreiben (`zustand/slot-<ZEIT>.json.gz`): Ereignisse (ID, Adresse, Land, Wurzelcode, NumMentions), Web-Erwähnungen (Ereignis-ID, Minute, Domain) bekannter Ereignisse, Titel (nur zu Adressen bekannter Ereignisse).
4. Zustand aufräumen (Aufbewahrung 72 Stunden: Ereignisse bis 72 h zurück, damit Erwähnungen älterer Ereignisse noch zugeordnet werden; Erwähnungen und Titel zählen nur im 48-Stunden-Fenster).
5. Aus dem Zustand denselben Kontext wie aus dem Cache bauen und `scripts/lib/ausgabe.mjs` ausführen (**dieselbe Logik wie `build-data.mjs`**): Dubletten zusammenfassen, Ernst-Filter, Länderzuordnung, Top 8 mit höchstens 2 je Land, Länderdateien, Konfliktmarke.
6. Ausgabe in `ausgabe/`: `world.json`, `countries/<ISO>.json`, `countries/index.json`, `status.json` (Stand, Lücken, Zahl der Zeitpunkte). Dazu `zustand/verlauf.json` (Schnappschuss je Lauf für die Vorperiode, 8 Tage).
7. Veröffentlichen (`scripts/pipeline/veroeffentlichen.sh`): `ausgabe/` als **einziger Commit** im Zweig `data` (Force-Push, die Historie wächst nicht).
- **Erster Lauf (leerer Zustand):** 48 Stunden Zeitpunkte (192) vollständig plus 24 Stunden **nur Ereignisse** davor (96 Dateien), damit Erwähnungen älterer Ereignisse sofort zugeordnet werden.
- Fehlende Zeitpunkte werden nicht nachgeholt, sondern in `status.json` unter `luecken` gemeldet.
- Zwei Läufe gleichzeitig: ausgeschlossen (`concurrency`, kein Abbruch laufender Läufe).

## Takt: 60 Minuten (beschlossen 04.11.2026; Begründung)
- **Bedingung:** Daten höchstens etwa 90 Minuten alt. Mit 60 Minuten Takt ist der Stand direkt nach einem Lauf wenige Minuten alt und kurz vor dem nächsten ca. 60 bis 75 Minuten alt; GitHub verzögert geplante Läufe bei hoher Last (laut Doku besonders zu Stundenbeginn, daher Start um Minute :23). **Schätzung:** höchstens ca. 90 Minuten, wenn die Verzögerung unter 15 Minuten bleibt (Annahme).
- **120 Minuten** würde das Alter auf bis zu ca. 130 Minuten heben und die Bedingung verfehlen; sie spart nur Laufzeit, die im öffentlichen Repo nichts kostet.
- **Kosten:** GitHub-Doku (gelesen am 04.11.2026): „Standard GitHub-hosted runners in public repositories" sind in der Liste der kostenlosen Nutzung; größere Runner werden dagegen auch bei öffentlichen Repos berechnet (wir nutzen `ubuntu-latest`, Standard).
- Kürzer als 60 Minuten bringt wenig (GDELT-Raster 15 Minuten, Dateien erscheinen im Mittel ca. 8 Minuten vor dem Zeitstempel, gemessen in Runde 3).

## Laufzeit und Datenmenge
| Größe | Wert | Art |
|---|---|---|
| Trockenlauf lokal, 288 Zeitpunkte (72 h) aus dem Cache: Zusammenfassen 8,3 s, Kontext 2,1 s, Ausgabe 7,9 s, gesamt 44 s (davon 25,6 s Dateien lesen und entzippen) | | gemessen (nur 56 gkg-Zeitpunkte im Cache) |
| Stündlicher Lauf lokal simuliert (4 neue Zeitpunkte, 284 im Zustand): 9,4 s (Zustand lesen 1,4 s, Kontext 1,7 s, Ausgabe 5,9 s) ohne Netz | | gemessen |
| Zustand lokal: 11,1 MB gzip für 288 Zeitpunkte (ca. 39 KB je Zeitpunkt) bei nur 56 gkg-Zeitpunkten | | gemessen |
| Zustand in Actions (alle gkg-Dateien, Titel nur zu bekannten Ereignissen): ca. 25 bis 30 MB für 72 h | | Schätzung (Titel ca. +50 KB je Zeitpunkt, Annahme) |
| Ausgabe: 211 Länderdateien zusammen 721 KB (größte 5,2 KB), `world.json` 22,7 KB, `index.json` 8,2 KB, `status.json` unter 1 KB: ca. 0,75 MB | | gemessen |
| **Erster Lauf:** 672 Anfragen (192 × 3 + 96 × 1), davon allein Pausen 672 × 5 s = **56 Minuten**; Download ca. **0,55 GB** (192 gkg-Dateien à 2,5 MB im Mittel (gemessen in Runde 4) plus export/mentions); Verarbeitung einige Minuten | gesamt **ca. 65 bis 90 Minuten** (`timeout-minutes: 180`) | Schätzung |
| **Stündlicher Lauf:** 12 Anfragen (4 × 3) = 60 s Pausen, ca. 11 MB Download, Verarbeitung ca. 10 bis 30 s, dazu `npm ci`, Cache laden und speichern, Veröffentlichen | gesamt **ca. 3 bis 5 Minuten**, ca. 24 Läufe/Tag, also ca. 1,2 bis 2 Stunden Laufzeit/Tag | Schätzung |
- Zeitpunkte mit Datenlücke bei GDELT sind selten, aber nicht auszuschließen (Annahme); die Seite zeigt immer den Stand.

## Zustand und Ausgabe (beschlossen 04.11.2026: Option A Actions-Cache, Ausgabe im Zweig data, Seite liest von raw.githubusercontent.com; Optionen zur Begründung)
**Ausgabe** (klein, ca. 0,75 MB): Zweig `data` mit einem einzigen, jedes Mal ersetzten Commit (Force-Push). Vorteil: kostenlos, keine Konten, Historie wächst nicht (nur unerreichbare Objekte, die GitHub irgendwann entfernt; Annahme). Nachteil: Force-Push auf einen Zweig; der Zweig `data` hat keinen gemeinsamen Verlauf mit `main`.

**Zustand** (ca. 25 bis 30 MB):
- **Option A (empfohlen): Actions-Cache.** `actions/cache` mit neuem Schlüssel je Lauf, alte Einträge werden im Workflow gelöscht (die zwei neuesten bleiben). Vorteile: nichts im Repo, kostenlos, schnell. Nachteile: GitHub löscht Cache-Einträge, die sieben Tage nicht abgerufen wurden (bei stündlichem Abruf nicht der Fall) und bei mehr als 10 GB je Repo die ältesten; **Cache-Verlust = automatische Neuauffüllung** (ca. 65 bis 90 Minuten Daten fehlen dann, danach alles normal). Quelle für die Aufbewahrungsregeln: GitHub-Dokumentation zu Caching (nicht neu abgerufen, aus dem Gedächtnis, **Annahme**).
- **Option B: Zustand zusätzlich im Zweig `data`.** Vorteil: überlebt Cache-Verlust, sichtbar. Nachteil: ca. 25 bis 30 MB werden stündlich neu gepusht (ca. 0,7 GB am Tag als unerreichbare Objekte, bis GitHub aufräumt, Annahme), das Repo könnte groß wirken; nicht empfohlen.
- **Option C: Artefakte/Releases.** Aufwändiger für nichts Besseres; nicht empfohlen.

**Wie die Website liest:**
- **Option 1 (empfohlen für den Start):** Browser lädt die JSON-Dateien direkt von `https://raw.githubusercontent.com/niklasehren/worldmonitor/data/…`. Gebaut: Umgebungsvariable `NEXT_PUBLIC_DATA_BASE` (Standard `/data`, Beispieldatei und Fakten bleiben lokal). Vorteil: keine Konten, kein Deployment pro Datenlauf. Nachteile: `raw.githubusercontent.com` ist kein vertraglich zugesicherter CDN-Dienst (Annahme: Zwischenspeicher ca. 5 Minuten, Ratenbegrenzung bei sehr vielen Abrufen), Abhängigkeit von GitHub.
- **Option 2:** Seite und Daten zusammen auf GitHub Pages/Vercel; der Workflow löst nach jedem Lauf ein neues Deployment aus. Vorteil: eigene Adresse, ein Ursprung, Zwischenspeicher steuerbar. Nachteil: Konto/Konfiguration nötig (Vercel: neues Deployment je Stunde), mehr Teile.
- **Alte Daten:** Die Seite zeigt immer den „Stand" in der Fußzeile, fügt bei Daten älter als 3 Stunden „Daten älter als 3 Std." an und läuft mit den Beispieldaten weiter, wenn `world.json` nicht ladbar ist (Etikett „Beispieldaten").

## Geplante Workflows in öffentlichen Repos (GitHub-Dokumentation, gelesen am 04.11.2026)
- Wörtlich: „In a public repository, scheduled workflows are automatically disabled when no repository activity has occurred in 60 days." (Seiten „Disabling and enabling a workflow" und „Events that trigger workflows"). Ebenfalls dort: Geplante Workflows laufen nur auf dem Standardzweig und mit dem letzten Commit dort; „The shortest interval you can run scheduled workflows is once every 5 minutes"; der Lauf „can be delayed during periods of high loads … High load times include the start of every hour"; Benachrichtigungen gehen an den Nutzer, der die Cron-Zeile zuletzt geändert hat.
- **Was als „Aktivität" zählt, steht in der Doku nicht.** Annahme (nicht belegt): Commits und Pushes zählen; ob Läufe der Pipeline oder Pushes in einen Nebenzweig (`data`) zählen, ist **nicht dokumentiert**. Vorschlag: ab und zu einen Commit auf `main` (z. B. beim Pflegen der Dokumente) und im Reiter „Actions" prüfen, dass der Workflow aktiv ist; bei Deaktivierung genügt „Enable workflow". Ein zusätzlicher Keep-alive-Workflow ist nicht sinnvoll (würde ebenfalls deaktiviert).

## Vorperiode und Konfliktmarke (vorbereitet)
- Jeder Lauf speichert einen Schnappschuss (Geschichten und Konfliktanteil je Land). Findet sich einer von vor 48 Stunden (Toleranz 2 Stunden), steht in jeder Länderdatei `vorfenster` {stand, geschichten, veraenderung, konfliktAnteil}; die Oberfläche zeigt dann „Gegenüber den 48 Stunden davor: ±N %" (nur bei mindestens 10 Geschichten in der Vorperiode). Sonst `null` und keine Anzeige.
- **Getestet (gemessen)** mit einem künstlichen Schnappschuss im Trockenlauf: Iran zeigte `veraenderung` 1,019 bei halbierter Vorperiode. Echte Vorperioden gibt es erst nach 48 Stunden Betrieb.
- Konfliktmarke: bleibt wie bisher (Verhältnis zum Median aller Länder im Fenster, mindestens 100 Ereignisse, Faktor 2). Mit Vorperiode wäre ein Anstieg gegenüber dem eigenen Wert möglich (Konfliktanteil der Vorperiode steht bereit); nicht eingebaut.

## Dateien
`.github/workflows/daten.yml` (Zeitplan und manueller Start mit „Zustand neu aufbauen"), `scripts/pipeline/lauf.mjs` (Ablauf, Modi `netz` und `cache`), `scripts/pipeline/zustand.mjs` (Zusammenfassung je Zeitpunkt, Kontext), `scripts/pipeline/veroeffentlichen.sh`, `scripts/lib/ausgabe.mjs` (gemeinsame Ausgabe), `scripts/lib/pipeline.mjs` (Pipeline), `scripts/lib/pipeline-cache.mjs` (Cache-Kontext), `config/gdelt-laender.txt` (GDELT-Länderliste, damit die Pipeline ohne Cache läuft), `config/anzeige.json`, `config/ausschluss.json`.
Lokaler Trockenlauf: `node scripts/pipeline/lauf.mjs --modus cache` (Zustand in `data/pipeline-state-trocken`, Ausgabe in `data/trockenlauf/out`, beides nicht im Git).
**Nicht getestet:** der Workflow selbst, das Veröffentlichen, die Cache-Schritte und die echten Downloads (kein Netz, kein Push). Vor dem ersten Lauf Action-Versionen (`@v4`) ggf. auf Commit-Kennungen festlegen.

## Beschluss 04.11.2026 und Prüfungen dazu
- **CORS und Cache-Zeit von `raw.githubusercontent.com`:** gemessen (04.11.2026) an einer fremden öffentlichen Datei (Kopfzeilen): `access-control-allow-origin: *` und `cache-control: max-age=300` (5 Minuten). Eine GitHub-Dokumentation dazu habe ich nicht gefunden; Übertragung auf `niklasehren/worldmonitor` ist **Annahme**, erst nach dem ersten Lauf prüfbar (`curl -I https://raw.githubusercontent.com/niklasehren/worldmonitor/data/world.json`). Mit 5 Minuten Zwischenspeicher steigt das Datenalter um bis zu 5 Minuten (Einschätzung: bleibt unter ca. 90 Minuten).
- **Daten nicht erreichbar (gemessen im Test mit unerreichbarer Basisadresse):** Die Seite stürzt nicht ab, zeigt oben den Hinweis „Aktuelle Daten nicht erreichbar. Gezeigt werden Beispieldaten (Stand …)", das Etikett „Beispieldaten", die Top 3 aus der Beispieldatei; Suche und Länderliste kommen aus der mitgelieferten Länderliste; Länder ohne lokale Datei zeigen „Wenig Berichterstattung …". Die Fußzeile nennt den Stand und „Daten älter als 3 Std.".
- **Schreibrecht für den Zweig data:** Der Workflow setzt `permissions: contents: write` (und `actions: write` zum Löschen alter Caches) und schreibt mit `GITHUB_TOKEN` per Force-Push. Dateiinhalt geprüft (gemessen). Ob die Repo-Einstellung „Workflow permissions" das einschränkt, ist **Annahme**: Die im Workflow deklarierten Rechte gelten für den Lauf; falls der Lauf beim Push mit „Permission denied" scheitert, in Settings → Actions → General „Read and write permissions" einschalten.
- Beispiel für die Einstellung der Seite: `.env.example` (nicht geheim).

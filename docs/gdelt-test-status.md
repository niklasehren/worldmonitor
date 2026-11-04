# GDELT-Test: Laufender Stand

Wird fortlaufend aktualisiert (zuletzt: 01.11.2026, Bericht geschrieben, wartet nur noch auf die Verfügbarkeitsmessung). Fortsetzen nach einem Abbruch: Alle geladenen Dateien liegen im Cache `data/gdelt-test/raw/`, die Skripte in `scripts/gdelt-test/` laden nur Fehlendes nach.

## Grenzen (vom Nutzer vorgegeben)
- Nur data.gdeltproject.org, mindestens 5 s Pause. DOC-API und GEO-API pausiert (HTTP 429, womöglich Hotel-WLAN, Test aus anderem Netz wiederholen).
- Rohdaten höchstens 1 GB. Bei HTTP-Fehlern höchstens 3 Wiederholungen, dann auslassen und vermerken.
- Keine Installation, nichts außerhalb von ~/worldmonitor, kein Push, keine Commits der Rohdaten.
- Nichts entscheiden, nur messen. Jedes Ergebnis: „gemessen" oder „Annahme/Einschätzung".

## Ablauf
| Nr | Schritt | Stand |
|---|---|---|
| 0 | Zeitanker, Themen- und Länderliste | fertig |
| 1 | Ein Dateipaar (export/mentions) Größe | fertig |
| 1b | Ein gkg-Paar, Felder | fertig |
| 2 | DOC-Themenabfragen | **pausiert** (429) |
| 3–4 | GEO, Verlauf per DOC | **pausiert** (DOC/GEO-API gesperrt) |
| 5 | Ereignisdateien 3 Tage (576 Dateien) | fertig, 0 fehlende |
| 5b | gkg-Dateien 4 weitere Tageszeiten | fertig (53,8 MB, Etappe unter 100 MB) |
| 6 | Verbindung Ereignis ↔ Artikel, alle Zeitpunkte | fertig (99,8 %) |
| 7 | Themenqualität (20 Treffer je Thema, nach Titel) | fertig |
| 8 | Eilmeldungs-Auslöser, nach hoch/erhöht/Basis, 10 Beispiele | fertig (Verfügbarkeitsmessung s7 läuft noch, Abschnitt 9 im Bericht) |
| 9 | Rang mit/ohne log(1+M) | fertig (verdecktes Blatt: `docs/gdelt-test-ranking-blind.md`) |
| 10 | Ausreißer-Verlauf | fertig (nur Probelauf, 3 Tage Daten) |
| 11 | Bericht docs/gdelt-test.md | geschrieben; Abschnitt 9 (Dateiverfügbarkeit) wird nach s7 ergänzt |

## Fehler und Hinweise
- 429 bei der DOC-API (21 Anfragen insgesamt, fast alle abgelehnt). Lauf gestoppt, Pausen verlängert. Nicht weiter versucht.

## Notizen
- Ereignisdateien-Download (s5) läuft im Hintergrund (Neustart: `node scripts/gdelt-test/s5-files.mjs`, lädt nur Fehlendes nach).
- Auswertungsskripte: `a-link.mjs`, `a-topics.mjs`, `a-topics-judge.mjs`, `analyze-events.mjs` (Auslöser), weitere folgen.
- s7 (Verfügbarkeit neuer Dateien, `node scripts/gdelt-test/s7-lag.mjs 50`, 50 Abfragen im Minutentakt auf `lastupdate.txt`) läuft; Ergebnis in `data/gdelt-test/lag.json`. Danach: Abschnitt 9 im Bericht ergänzen, Status auf „fertig" setzen, committen.
- Protokoll zeigt zeitweise Pausen von Stunden zwischen Abrufen (Mac vermutlich im Ruhezustand), keine Datenverluste.
- Der Mac-Uhr-Vergleich zu Beginn war auffällig (Zeitanker lag in der Zukunft der lokalen Uhr); derzeit stimmen lokale Uhr und Serverzeit überein (gemessen in s7).

## Runde 2 (selbstständige Phase, 01.11.2026)
Bericht: `docs/gdelt-test-runde2.md` (Zusammenfassung oben, Abschnitt 8 = Lagen). Planvorschläge: `docs/plan-vorschlaege.md`.
| Nr | Stand |
|---|---|
| 0 | fertig (Abschnitt 10 in `docs/gdelt-test.md`) |
| 1, 2 | fertig; verdecktes Blatt `docs/gdelt-test-ranking-blind-2.md`, Schlüssel `data/gdelt-test/ranking-key-2.json` (erst nach Ihrem Urteil öffnen) |
| 3, 4, 5 | fertig |
| 6 | 59 von 96 Zeitpunkten geladen (Anfragen-Obergrenze 800 in `lib.mjs` erreicht), ausgewertet |
| 7 | `scripts/gdelt-test/doc-retest.mjs` geschrieben, **nicht ausgeführt** |
| 8 | Bericht fertig |
| 9 | Lagen: fertig (Abschnitt 8 im Bericht, `lagen.mjs`) |

Entscheidung: Die Obergrenze von 800 Anfragen war meine eigene Sicherung im Skript, nicht Ihre Vorgabe. Ich habe sie nicht erhöht. Der Rohdaten-Cache hat ca. 439 MB.

### DOC-API-Wiederholung starten (aus einem anderen Netz, z. B. Handy-Hotspot)
1. Terminal im Projektordner öffnen: `cd ~/worldmonitor`
2. Erst prüfen, dass das Netz ein anderes ist als beim ersten Versuch.
3. Starten: `node scripts/gdelt-test/doc-retest.mjs`
4. Das Skript stellt höchstens 12 Anfragen mit 15 Sekunden Pause, bricht bei HTTP 429 ab und schreibt das Ergebnis nach `data/gdelt-test/`; Hinweise dazu stehen im Kopf des Skripts. Es wurde nicht ausgeführt, nur auf Syntax geprüft.

## Runde 3 (offline, Start 01.11.2026 abends)
Auftrag: Aufgaben 1–9 offline auf vorhandenen Daten; Bericht `docs/gdelt-test-runde3.md`, `docs/mvp-vorschlag.md`. Keine Downloads. (Hinweis: Der DOC-Retest im Handy-Hotspot lief in einen Verbindungs-Timeout, 0 von 12 Anfragen, kein 429.)
| Nr | Stand |
|---|---|
| 1 Eilmeldung Entwicklungs-/Prüfmenge | fertig (e1-*.mjs, Urteile `scripts/gdelt-test/e1-labels.json`) |
| 2 Titelbereinigung | fertig (t2-titel.mjs) |
| 3 Zusammenfassen | fertig (r3-merge.mjs) |
| 4 Sanktionen/Märkte | fertig (r3-topics.mjs) |
| 5 Länderfaktor | fertig (r3-faktor.mjs) |
| 6 Lagen schärfen | fertig (lagen2.mjs) |
| 7 Datenmenge/Laufzeit | fertig (r3-volumen.mjs, r3-rechnung.mjs) |
| 8 MVP-Vorschlag | fertig (`docs/mvp-vorschlag.md`) |
| 9 Bericht | fertig (`docs/gdelt-test-runde3.md`) |

## Nachtlauf Runde 4 (gkg eines vollen Tages, Netz nur hierfür erlaubt)
Erlaubt: gkg (ohne translation.gkg) für die 96 Zeitpunkte des letzten vollen Tages (31.10. 04:30 bis 01.11. 04:15 UTC), https zuerst, ≥5 s Pause, max. 3 Wiederholungen, Rohdaten ≤ 1,3 GB, ≥ 5 GB frei. Fortsetzen nach Abbruch: `WM_MAX_REQUESTS=920 WM_MAX_BYTES=1300000000 node scripts/gdelt-test/w2-gkg-tag.mjs` (lädt nur Fehlendes). Fortschritt steht in `data/gdelt-test/messages.log` (Zeilen „w2:").
Danach offline: Titelabdeckung, Zählung D1/W1–W3/Top 20 mit Titel, Lagen mit Titel, Abschnitt in `docs/gdelt-test-runde4-wachstum.md`.
| Schritt | Stand |
|---|---|
| Download | fertig (54 gkg-Dateien, 0 Fehler, Rohdaten 570 MB) |
| Auswertung offline | fertig (`w2-auswertung.mjs`, `data/gdelt-test/w2-auswertung.json`) |
| Bericht | fertig (Teil 3 in `docs/gdelt-test-runde4-wachstum.md`) |

## DOC-API-Retest 03.11.2026 (Heimnetz)
**Gemessen:**
- 2 Anfragen insgesamt, beide **HTTP 429 Too Many Requests**, keine kam durch.
  1. `doc-retest.mjs` (15:42 UTC): Abbruch nach der ersten Anfrage, wie im Skript vorgesehen. Gespeichert sind nur Status und die ersten 120 Zeichen des Texts (`data/gdelt-test/doc-retest-result.json`).
  2. Einzelne `curl -s -i`-Anfrage (15:44 UTC, gut 2 Minuten später, gleiche URL: „ukraine", 6 Stunden, 5 Treffer). Rohantwort: `data/gdelt-test/doc-single-curl.txt`.
- Header der zweiten Antwort: `Date`, `Server: GDELT Server`, `Content-Length: 444`. **Kein Retry-After**, keine Wartezeit genannt.
- Antworttext wörtlich: „Please limit requests to one every 5 seconds or contact [Kontaktadresse laut GDELT-Antwort] for larger queries. All high-traffic users should switch to our ngrams dataset: https://blog.gdeltproject.org/using-the-new-web-ngrams-dataset-to-find-relevant-coverage/. For trend analysis, please see our daily newsletter briefings: https://blog.gdeltproject.org/announcing-our-new-daily-todays-trends-on-capitol-hill-todays-media-trends-newsletter-briefings/."
- Die Themenfilter (Kürzel englisch, Suchbegriffe deutsch) wurden nicht abgefragt, also keine Treffer.

**Annahme (nicht geprüft):**
- Die 5-Sekunden-Regel allein erklärt die Ablehnung nicht (Abstand gut 2 Minuten). Wahrscheinlich besteht eine Sperre oder Drosselung für Ihre Adresse oder für den Dienst insgesamt. Ob sie für alle gilt, ob und wann sie endet, ist offen.

**Schlussfolgerung:** DOC-/GEO-API kommen nicht in den MVP. Genutzt werden nur die Datei-Downloads von `data.gdeltproject.org`. Keine weitere Anfrage an die DOC-API ohne neuen Auftrag.

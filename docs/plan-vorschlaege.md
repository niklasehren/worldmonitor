# Änderungsvorschläge für PLAN.md (Entwurf, nichts davon ist beschlossen)

Stand: 01.11.2026. PLAN.md wurde nicht verändert. Grundlage: `docs/gdelt-test-runde2.md`. Jeder Punkt ist ein Vorschlag zur Entscheidung durch Sie.

## 1. Ranking und Eilmeldung (aus Runde 2)
- **Geschichten statt Ereignisse:** Ranking und Eilmeldung sollten auf zusammengefassten Geschichten laufen (gleiche Adresse), sonst bestand die Top 20 nur aus 7 bis 13 Geschichten. Titel-Zusammenfassung (Schwelle 0,8) reicht allein nicht; später mit Schwelle oder anderem Verfahren testen.
- **Regionale Spitze** als eigener Block (je Weltregion die Geschichte mit höchster Erwähnungszahl) hebt Basisländer von 1,5 bis 2,5 auf 4 bis 4,5 Plätze der Top 20. Ob das gewünscht ist, ist Ihre Entscheidung; die Regionendefinition steht in `scripts/gdelt-test/regions.json`.
- Länderstufe „erhöht" kam in den Testlisten nie vor; ggf. zusammenlegen oder die Faktoren prüfen.
- **Eilmeldung:** Kandidat zum weiteren Test ist die Kombination aus Waffen-/Gewaltcodes und bewaffneten Akteuren (D1, ca. 17 Geschichten/Tag, Fehlalarm in kleiner Stichprobe 36 %). Messung mit größerer Stichprobe nötig, bevor ein Schwellenwert in den Plan kommt.
- **Themen:** Je Thema Kürzel plus Stichwort im Titel statt Kürzel allein (Fehler in der Stichprobe 5 bis 27 % statt 60 bis 75 %). „Sanktionen" ist mit keiner Methode sauber, im Plan als offen führen.
- **Länderzuordnung:** Statt nur Aktionsland auch das häufigste gkg-Land prüfen (Stichprobe n=27: 4 % statt 15 % offensichtlich falsch).
- **Übersetzungsstrom:** In den Plan als zweite Datenquelle aufnehmen (ca. 11 bis 19 MB pro Tag für Ereignisse und Erwähnungen, Hochrechnung; **hinzu kommt `translation.gkg` für Titel und Themen, gemessen 7 bis 13 MB gezippt je Zeitpunkt**, das wurde in Runde 2 nicht auf einen Tag hochgerechnet). Brasilien u. a. tauchen dort in Ereignissen auf.
- **Dateitakt:** Neue Dateien erscheinen laut Messung vor dem Zeitstempel im Namen (Median −7,9 Minuten, n=7); keine Verzögerung nach dem Zeitstempel.

## 2. Neue Funktion „Lagen"

**Idee:** Je Lage eine eigene Seite (z. B. USA–Iran, Russland–Ukraine, China–Taiwan, Israel–Gaza/Libanon, USA–China) mit Geschichtenliste und Verlauf.

**Datei `config/lagen.json` (Vorschlag):**
```json
{
  "lagen": [
    {
      "id": "usa-iran",
      "name": "USA – Iran",
      "laenderpaare": [["US", "IR"]],
      "stichwoerter": ["iran", "tehran", "hormuz", "vance", "irgc"],
      "regel": "paar_und_stichwort"
    },
    {
      "id": "israel-gaza-libanon",
      "name": "Israel – Gaza/Libanon",
      "laenderpaare": [["IS", "GZ"], ["IS", "WE"], ["IS", "LE"]],
      "stichwoerter": ["israel", "gaza", "hamas", "hezbollah", "lebanon", "west bank", "palestin"],
      "regel": "paar_und_stichwort"
    }
  ]
}
```
- Länder als FIPS-Codes (wie in `config/weights.json`). Länderpaare gelten in beiden Richtungen. `regel` kann `paar` (nur Länderpaar) oder `paar_und_stichwort` sein. Stichwörter sind Englisch, weil gkg-Titel überwiegend englisch sind (Annahme, in Runde 2 nicht systematisch geprüft).
- Die Liste ist von Ihnen zu pflegen; neue Lagen = neuer Eintrag, keine Programmänderung.

**Seite im Plan (Vorschlag):**
- Route `/lagen` (Übersicht, Kachel je Lage mit Geschichten der letzten 24 Stunden) und `/lagen/[id]` (Detailseite).
- Detailseite: Geschichtenliste (neueste/stärkste zuerst, Quelle und Zeit je Eintrag), Kurve „Geschichten pro Stunde" über 3 Tage (bei dünn besetzten Lagen wie China–Taiwan stattdessen Tageswerte), optional die GDELT-Konflikt-Kooperations-Skala nur als Tagesmittel und klar als „maschinell berechnet, nicht validiert" gekennzeichnet.
- Filterregel nach Test: nur Länderpaar ist zu unscharf (USA–Iran 7 von 20 passend, China–Taiwan 5 von 20), mit Stichwort deutlich besser (14 bis 19 von 20, Einschätzung, Stichprobe klein). Vorschlag daher `paar_und_stichwort` als Standard und „nur Länderpaar" als wählbare Ausnahme.
- Datenmenge laut Test: ca. 17 bis 240 Geschichten pro Tag je Lage vor dem Stichwortfilter. Nur die Hälfte aller Ereignisse hat zwei Akteursländer, deshalb sind Lagen-Seiten immer ein Ausschnitt (gemessen: 173.539 von 296.447 Ereignissen mit beiden Ländern).
- Offen: Titelabdeckung (Stichwort in der Adresse ist schwächer als im Titel), Mehrfachzuordnung einer Geschichte zu mehreren Lagen, Platz im Navigationsentwurf.

## 3. Eilmeldung in Version 1 (Optionen, nicht entschieden)

Messlage (Runde 3, `docs/gdelt-test-runde3.md` Abschnitte 1 und 10): Beste Variante D1 (Waffencodes und bewaffnete Akteure, mindestens 2 Medien in 60 Minuten) mit Ausschlussliste: ca. 11 Auslöser/Tag, davon nur ca. 1,7/Tag mit lesbarem Titel (Untergrenze, Titel-Abdeckung im Test begrenzt). Fehlalarm in der Prüfmenge 15 % „passt nicht" (5–36 %, n = 20), aber ca. 40 % „unklar", weil viele Geschichten keinen lesbaren Titel haben. In der Zweitbeurteilung (n = 20) fanden sich 2 bis 4 verschiedene echte Ereignisse. Alle Urteile sind Einschätzung, die Zweitbeurteilung ist nicht unabhängig.

**Option A: In Version 1 weglassen.** Begründung: Die Qualität ist nicht belastbar gemessen. Die Regel läuft trotzdem im Hintergrund („Schattenbetrieb", Ergebnisse speichern, nicht anzeigen), um eine größere Stichprobe zu sammeln. Vorteil: keine falschen Meldungen. Nachteil: Die Funktion fehlt zunächst.

**Option B: Als „experimentell" kennzeichnen** (Text und Symbol, nicht rot; zusätzlich „Erste Meldungen, noch unbestätigt" wie im Plan). Mindestanforderungen, die zu entscheiden wären:
- nur Geschichten **mit lesbarem Titel** (echter gkg-Titel, mindestens 3 Wörter, nach der Titelbereinigung nicht verworfen); Geschichten nur mit Adresse werden nicht angezeigt;
- Variante D1 plus Ausschlussliste (Liste einsehbar und anpassbar in `config/ausschluss.json`);
- mindestens 2 voneinander unabhängige Medien (wie im Plan), optional höhere Schwelle;
- Obergrenze pro Tag (z. B. Anzeige der jüngsten 5), damit Fehlalarme nicht überfluten;
- sichtbarer Hinweis auf die gemessene Unsicherheit und Link auf die Quelle; Möglichkeit, eine Meldung als „falsch" zu markieren (Ihre Einschätzung wird gespeichert und wertet die Regel später aus).
Nachteil: Bei den bisher gemessenen ca. 1,7 Meldungen/Tag mit lesbarem Titel ist unklar, ob die Funktion genug Inhalt liefert, und die Mehrzahl der Treffer betrifft nur wenige Länder (Nordkorea, Jemen/Saudi-Arabien in der Stichprobe).

**Offen für beide Optionen:** Größere Stichprobe mit Titeln aus allen gkg-Zeitpunkten; unabhängige Beurteilung (nicht durch meine Einschätzung beeinflusst); Definition von „passt" (Gewaltlage oder auch humanitäre Lage wie die Oleshky-Evakuierung); Wochenverlauf (bisher nur Do–So).

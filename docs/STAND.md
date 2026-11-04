# Stand (Zusammenfassung der Aktualisierung auf PLAN.md v4)

`PLAN.md` (jetzt v4) und `DESIGN.md` sind mit allen fünf Entscheidungen aktualisiert. Ich habe keinen Code geschrieben und auch das Mockup nicht angefasst.

## Was drinsteht
1. **Uhren:** Brüssel ist gestrichen. Die sechs Uhren stehen in deiner Reihenfolge von West nach Ost (Los Angeles, Washington, Wien, Moskau, Dubai, Peking), mit den IANA-Zeitzonen, die du genannt hast. Mobil sind sie seitlich scrollbar. Im Mockup sind noch die alten fünf Uhren. Ich passe sie mit Schritt 4 an.
2. **Ranking:** Die Formel lautet Rang = unabhängige Medien × Gewicht Land × Gewicht Thema × Aktualität.
   - Die Gewichte (Stufe 1, 2, 3) liegen in `config/weights.json`, Länder und Themen getrennt. Die Zahlenwerte dahinter (1,0 / 1,5 / 2,0, Halbwertszeit 12 Stunden) sind meine Startvorschläge. Wir justieren sie nach dem Test.
   - In der Oberfläche steht „nach deiner Gewichtung" und „Wie entsteht das?", nie „objektiv wichtig".
   - Für die Ausreißer-Ausnahme zählen wir die Geschichten pro Land und Thema in 24 Stunden. Der Normalwert ist der Median der letzten 28 Tage. Dazu kommt eine Mindestmenge gegen Fehlalarme. Bis zu 2 Plätze in „Lage heute" sind dafür reserviert.
3. **Themen:** Alle sechs stehen in `config/topics.json`. Der GDELT-Test prüft pro Thema, welche Filter brauchbar sind, mit je 20 Treffern von Hand geprüft. Bei „Märkte und Wirtschaft" ist offen, ob GDELT-Themen taugen oder nur Suchbegriffe.
4. **Übersetzung:** Sie ist als Phase 1b nach dem Feed eingeplant, nur für Spitzenmeldungen. Gespeichert wird in der Datenbank, mit der Kennzeichnung „maschinell übersetzt" und dem Original per Klick. Dazu gibt es eine eigene Obergrenze von 80 % des Kontingents.
5. **Phase 2:** Märkte und Live-Cams sind beschrieben, Live-Cams mit Konfigurationsdatei, Laden erst bei Klick und Hinweis bei Ausfall.

## Zwei Dinge, die du wissen solltest
- **14 Tage reichen für die Ausreißer nicht.** Mit 14 Tagen gibt es nur zwei gleiche Wochentage, und eine lange Krise zieht den Normalwert selbst nach oben. Mein Vorschlag: Rohmeldungen bleiben 14 Tage, aber die Zählwerte werden 90 Tage gespeichert. Das sind grob 216.000 Zeilen (eine Annahme von mir, der Test prüft sie). Ausreißer gibt es erst ab 7 Tagen Verlauf, stabil ab 28 Tagen. Die Seite sagt das offen.
- **Der Takt bleibt wohl bei 60 Minuten.** Bei 12 Abfragen (6 Themen × 2 Sprachen) und mindestens 5 Sekunden Pause dauert ein Lauf ungefähr 1,5 bis 2 Minuten. Das sind rund 1.440 Minuten pro Monat. Ein 30-Minuten-Takt würde das Guthaben sprengen. Im Test prüfe ich, ob ich Abfragen bündeln kann.

## Was nicht bestätigt ist
- **DeepL:** Die offizielle Seite blockte mit 403. Die 500.000 Zeichen pro Monat stammen aus der Suche. Eine Karte verlangt die Anmeldung laut Drittquellen sehr wahrscheinlich, bestätigt ist das nicht. Außerdem gibt es bezahlte Tarife mit ähnlichen Namen. Bevor es so weit ist, frage ich dich. Ohne Karte lassen wir die Übersetzung weg.
- **Märkte:** Eine geprüfte kostenlose Quelle, deren Bedingungen die Anzeige erlauben, habe ich nicht gefunden. Alpha Vantage hat nur 25 Anfragen pro Tag, bei FRED, Twelve Data und Stooq konnte ich die Bedingungen nicht prüfen. Das steht so im Plan.
- **YouTube:** Betreiber können das Einbetten abschalten, das lässt sich nicht umgehen. Ob „erst bei Klick laden" zu den Player-Regeln passt, prüfe ich vor dem Bau genauer.

## Stand Mockup
Das Mockup bleibt unverändert und liegt unter `mockup/index.html`. Neu hineinkommen: die sechs Uhren, die seitliche Scrollbarkeit und optional die Ausreißer-Marke.

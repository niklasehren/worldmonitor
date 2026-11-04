// Ausschlusswörter, in der Entwicklungsmenge abgeleitet und danach UNVERÄNDERT auf die Prüfmenge angewendet.
export const AUSSCHLUSS = /\b(sale|hack\w*|lawsuit|tribute|theatres?|dim lights|shooter|shooting|police|arrested|charged|suspect|murder|bond|court|judge|school|teacher|halloween|hockey|scores|study|mayor|elections?|prince|princess|cold case|killing of|disappeared)\b/i;
export const ausgeschlossen = (text) => AUSSCHLUSS.test(text);

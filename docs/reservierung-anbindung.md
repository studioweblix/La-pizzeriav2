# Website und Reservierungstools verbinden

Diese Anleitung beschreibt, wie die Reservierungsseite (`/reservierung`) mit dem gewünschten Kanal verbunden wird: **eigenes Formular (Supabase)**, **integrierte Anbieter** (OpenTable, Quandoo, Resy, Formitable) oder **freier Embed-Code**.

Die Steuerung erfolgt **nicht** über festen Code pro Kunde, sondern über die Tabelle **`store_settings`** in Supabase (pro Tenant eine Zeile) sowie die Umgebungsvariablen für den jeweiligen Mandanten.

---

## Voraussetzungen

1. **Umgebungsvariablen** (lokal in `.env.local`, auf dem Server z. B. bei Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_TENANT_ID` — UUID des Restaurants/Mandanten in der Tabelle `tenants`

2. **Store-Einstellungen** für genau diesen Tenant: eine Zeile in **`store_settings`** mit passender `tenant_id`.

---

## Ein Tool statt eigener Reservierungs-Datenbank

Wenn das Restaurant **bereits Quandoo, OpenTable o. Ä.** nutzt und ihr **keine zweite Liste** in Supabase pflegen wollt (z. B. weil auch **telefonisch** reserviert wird und alles **an einem Ort** liegen soll):

- **So ist das Template gedacht:** In `store_settings` **`reservation_type`** auf `quandoo`, `opentable`, `resy`, `formitable` oder `custom` setzen und die passende **ID** bzw. den **Embed-Code** hinterlegen.
- **Online:** Gäste buchen über das **Widget** auf eurer Website — die Daten landen **beim Anbieter** (Quandoo/OpenTable/…), nicht in der Tabelle `reservations` in Supabase.
- **Telefon:** Das Team trägt Reservierungen **im gleichen Tool** ein (Kassen-/Backoffice des Anbieters). So gibt es **eine** gemeinsame Datenbasis — ohne Konflikt mit einer separaten Website-Datenbank.
- Das **eingebaute Formular** (schreibt nach Supabase `reservations`) wird bei diesen Einstellungen **nicht** angezeigt. Nutzt es nur für Mandanten **ohne** externes Reservierungssystem.

Kurz: **Verknüpfen** = richtigen `reservation_type` + ID/Code in `store_settings` — nicht „API-URL“, sondern Widget-Anbindung wie in den Abschnitten unten beschrieben.

---

## Welche Option passt?

| Ziel | `reservation_type` | Weitere Felder |
|------|-------------------|----------------|
| Reservierungen in **eurer Datenbank** (Supabase-Tabelle `reservations`) | `null` oder ein Wert, der **keiner** der unten genannten externen Typen ist | — |
| **OpenTable**-Widget | `opentable` | `reservation_external_id` = Restaurant-ID (`rid`) |
| **Quandoo** | `quandoo` | `reservation_external_id` = Merchant-ID |
| **Resy** | `resy` | `reservation_external_id` = Venue-ID |
| **Formitable** | `formitable` | `reservation_external_id` = Restaurant-UID |
| **Beliebiges** Tool (HTML/Script vom Anbieter) | `custom` | `reservation_widget_code` = vollständiger Embed-Code |

Die Seite wählt die Darstellung in dieser Reihenfolge: externe Anbieter → **custom** → sonst **eingebautes Formular**.

---

## Felder in `store_settings`

| Spalte | Bedeutung |
|--------|-----------|
| `reservation_type` | Siehe Tabelle oben (`opentable`, `quandoo`, `resy`, `formitable`, `custom`, oder leer/anders für internes Formular). |
| `reservation_external_id` | ID für Quandoo / OpenTable / Resy / Formitable (je nach Anbieter anders benannt – siehe Abschnitte unten). |
| `reservation_widget_code` | Nur bei `custom`: HTML inkl. `<script>`-Tags, wie der Anbieter ihn liefert. |

**Hinweis:** `tenant_id` in `store_settings` muss zu `NEXT_PUBLIC_TENANT_ID` passen.

---

## 1. Eigenes Formular (Supabase)

- **`reservation_type`:** leer lassen oder keinen der Werte `quandoo`, `opentable`, `resy`, `formitable`, `custom` setzen.
- Besucher senden an **`POST /api/reservation`**; Einträge landen in **`reservations`** mit `tenant_id` und Status `pending`.

**Wichtig:** In Supabase müssen **Row Level Security (RLS)** und Policies so gesetzt sein, dass Inserts in `reservations` für die genutzte Rolle (meist Anon-Key) erlaubt sind – sonst schlägt das Formular mit Serverfehler fehl.

---

## 2. OpenTable

1. Restaurant-ID **`rid`** ermitteln (steht in der OpenTable-URL bzw. im Partner-/Widget-Bereich, numerisch).
2. In **`store_settings`** für den Tenant:
   - `reservation_type` = `opentable`
   - `reservation_external_id` = diese **`rid`** (nur die Zahl als Text)

Es wird ein eingebettetes OpenTable-Widget geladen; **kein** eigener API-Key im Next.js-Code nötig.

---

## 3. Quandoo

1. **Merchant-ID** aus dem Quandoo-Bereich für das Restaurant übernehmen.
2. `reservation_type` = `quandoo`, `reservation_external_id` = Merchant-ID.

---

## 4. Resy

1. **Venue-ID** aus dem Resy-Widget / der Dokumentation.
2. `reservation_type` = `resy`, `reservation_external_id` = Venue-ID.

---

## 5. Formitable

1. **Restaurant-UID** aus dem Formitable-Dashboard / Widget-Snippet.
2. `reservation_type` = `formitable`, `reservation_external_id` = Restaurant-UID.

---

## 6. Custom (jeder Anbieter mit Embed-Code)

Wenn das Tool **nicht** in der Liste vorkommt oder ihr das offizielle Snippet 1:1 nutzen wollt:

1. `reservation_type` = `custom`
2. Den kompletten Code in **`reservation_widget_code`** speichern (HTML und `<script>` wie vom Anbieter geliefert).

Die Komponente fügt den Code ein und führt eingebettete Skripte aus. Bei sehr strengen **Content Security Policy**-Regeln im Hosting kann es nötig sein, Domains des Anbieters zu erlauben.

---

## Prüfen nach der Einrichtung

1. `NEXT_PUBLIC_TENANT_ID` stimmt mit der bearbeiteten `store_settings`-Zeile überein.
2. Seite **`/reservierung`** im Browser neu laden (ggf. harter Reload).
3. Bei externen IDs: Wenn nichts erscheint, prüfen, ob `reservation_external_id` wirklich gesetzt ist — sonst zeigt die Seite einen Hinweistext statt des Widgets.

---

## Kurzüberblick Dateien im Projekt

| Bereich | Ort |
|--------|-----|
| Seite `/reservierung` | `src/app/reservierung/page.tsx` |
| Eingebautes Formular | `src/components/reservation/ReservationForm.tsx` |
| OpenTable & Co. | `src/components/reservation/ExternalWidget.tsx` |
| Custom-Embed | `src/components/reservation/CustomEmbed.tsx` |
| API internes Formular | `src/app/api/reservation/route.ts` |
| Daten-Insert | `createReservation()` in `src/lib/data.ts` |

Bei Anpassung von Widget-URLs (z. B. andere Sprache oder Theme bei OpenTable) ist in der Regel eine kleine Änderung in `ExternalWidget.tsx` nötig.

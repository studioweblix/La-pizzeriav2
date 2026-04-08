-- Beispiel: reservation_config für das interne Reservierungsformular setzen
--
-- 1) In Supabase: SQL → New query
-- 2) Ersetze unten DEINE_TENANT_UUID durch dieselbe UUID wie in NEXT_PUBLIC_TENANT_ID
--    (Tabelle tenants → id, oder in .env.local)
-- 3) Ausführen
--
-- Hinweis: Es muss bereits eine Zeile store_settings für diesen tenant_id existieren.
-- Wenn keine Zeile existiert, zuerst INSERT (siehe unten) oder im Dashboard anlegen.

UPDATE store_settings
SET reservation_config = '{
  "slot_interval_minutes": 15,
  "buffer_minutes": 15,
  "avg_dining_minutes": 90,
  "max_party_size": 8,
  "tables": [
    { "seats": 2, "count": 4 },
    { "seats": 4, "count": 3 }
  ]
}'::jsonb
WHERE tenant_id = 'DEINE_TENANT_UUID'::uuid;

-- Optional prüfen:
-- SELECT tenant_id, reservation_config FROM store_settings WHERE tenant_id = 'DEINE_TENANT_UUID'::uuid;

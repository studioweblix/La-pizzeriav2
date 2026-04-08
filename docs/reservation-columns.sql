-- Spalten für POST /api/reservation (falls noch nicht vorhanden)
-- In Supabase SQL Editor ausführen.

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS table_size integer;

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'website';

COMMENT ON COLUMN reservations.table_size IS 'Zugewiesene Tischgröße (Sitzplätze)';
COMMENT ON COLUMN reservations.source IS 'Herkunft der Buchung, z. B. website';

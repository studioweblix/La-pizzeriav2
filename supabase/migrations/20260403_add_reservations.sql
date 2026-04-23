-- store_settings: Reservierungs-Konfiguration
ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS reservation_type text,
  ADD COLUMN IF NOT EXISTS reservation_external_id text,
  ADD COLUMN IF NOT EXISTS reservation_widget_code text;

-- reservations: Built-in Reservierungssystem
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text,
  guest_phone text,
  date date NOT NULL,
  time text NOT NULL,
  guests integer NOT NULL DEFAULT 2,
  table_size integer,
  notes text,
  source text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reservations_tenant_id ON reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(tenant_id, date);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant can read own reservations"
  ON reservations FOR SELECT
  USING (tenant_id::text = current_setting('request.jwt.claims', true)::json->>'tenant_id');

CREATE POLICY "Anyone can insert reservations"
  ON reservations FOR INSERT
  WITH CHECK (true);

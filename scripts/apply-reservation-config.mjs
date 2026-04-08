#!/usr/bin/env node
/**
 * Schreibt ein gültiges reservation_config für den Tenant in Supabase (UPDATE store_settings).
 *
 * Voraussetzung in .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_TENANT_ID
 * - SUPABASE_SERVICE_ROLE_KEY  (Supabase → Project Settings → API → service_role, geheim halten)
 *
 * Ausführen: npm run reservation:apply
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const tenantId = env.NEXT_PUBLIC_TENANT_ID?.trim();

if (!url || !serviceKey || !tenantId) {
  console.error(
    "Fehlende Werte in .env.local. Benötigt:\n" +
      "  NEXT_PUBLIC_SUPABASE_URL\n" +
      "  NEXT_PUBLIC_TENANT_ID\n" +
      "  SUPABASE_SERVICE_ROLE_KEY (Project Settings → API in Supabase)\n"
  );
  process.exit(1);
}

const reservation_config = {
  slot_interval_minutes: 15,
  buffer_minutes: 15,
  avg_dining_minutes: 90,
  max_party_size: 8,
  tables: [
    { seats: 2, count: 4 },
    { seats: 4, count: 3 },
  ],
};

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase
  .from("store_settings")
  .update({ reservation_config })
  .eq("tenant_id", tenantId)
  .select("tenant_id");

if (error) {
  console.error("Supabase-Fehler:", error.message);
  process.exit(1);
}

if (!data?.length) {
  console.error(
    "Keine Zeile in store_settings für diese tenant_id. " +
      "Lege zuerst eine store_settings-Zeile für den Tenant an (Dashboard oder Supabase), dann erneut ausführen."
  );
  process.exit(1);
}

console.log("Erledigt: reservation_config wurde gesetzt für tenant_id", tenantId);
console.log(
  "Als Nächstes: reservation_type darf kein externer Anbieter sein; opening_hours für Zeitslots pflegen."
);

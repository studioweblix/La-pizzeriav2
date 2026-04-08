#!/usr/bin/env node
/**
 * Liest NEXT_PUBLIC_TENANT_ID aus .env.local (falls vorhanden) und gibt
 * fertiges SQL für Supabase aus – zum Einfügen im SQL Editor.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

let tenantId = "DEINE_TENANT_UUID";
if (fs.existsSync(envPath)) {
  const text = fs.readFileSync(envPath, "utf8");
  const m = text.match(/^\s*NEXT_PUBLIC_TENANT_ID\s*=\s*(.+)$/m);
  if (m) {
    tenantId = m[1].trim().replace(/^["']|["']$/g, "");
  }
}

const config = {
  slot_interval_minutes: 15,
  buffer_minutes: 15,
  avg_dining_minutes: 90,
  max_party_size: 8,
  tables: [
    { seats: 2, count: 4 },
    { seats: 4, count: 3 },
  ],
};

const json = JSON.stringify(config);
const jsonSql = json.replace(/'/g, "''");

const sql = `UPDATE store_settings
SET reservation_config = '${jsonSql}'::jsonb
WHERE tenant_id = '${tenantId}'::uuid;
`;

console.log("-- Fertiges SQL (in Supabase → SQL Editor einfügen und ausführen):\n");
console.log(sql);
if (tenantId === "DEINE_TENANT_UUID") {
  console.error(
    "\nHinweis: NEXT_PUBLIC_TENANT_ID in .env.local nicht gefunden – UUID im SQL manuell setzen.\n"
  );
}

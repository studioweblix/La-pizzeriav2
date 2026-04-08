import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  occupancyDenominator,
  parseReservationConfig,
} from "@/lib/reservation-logic";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID?.trim();
    if (!tenantId) {
      return NextResponse.json({
        enabled: false,
        reason: "missing_tenant_env",
      });
    }

    const supabase = await createClient();

    const { data: rows, error } = await supabase
      .from("store_settings")
      .select("reservation_config")
      .eq("tenant_id", tenantId)
      .limit(1);

    if (error) {
      console.error("reservation/config store_settings:", error);
      return NextResponse.json({
        enabled: false,
        reason: "store_settings_fetch_failed",
      });
    }

    const data = rows?.[0];
    if (!data) {
      return NextResponse.json({
        enabled: false,
        reason: "no_store_settings_row",
      });
    }

    const raw = (data as { reservation_config?: unknown }).reservation_config;
    const config =
      raw != null &&
      !(typeof raw === "object" && Object.keys(raw as object).length === 0)
        ? parseReservationConfig(raw)
        : null;

    if (config) {
      const max_party_size =
        typeof config.max_party_size === "number" && config.max_party_size >= 1
          ? Math.min(50, Math.floor(config.max_party_size))
          : 8;

      return NextResponse.json({
        enabled: true,
        mode: "full",
        max_party_size,
        slot_interval_minutes: config.slot_interval_minutes,
        total_seats: occupancyDenominator(config),
      });
    }

    /* Kein gültiges reservation_config: Formular im einfachen Modus (Speichern ohne Slot-/Tischlogik) */
    return NextResponse.json({
      enabled: true,
      mode: "simple",
      max_party_size: 50,
    });
  } catch (e) {
    console.error("reservation/config:", e);
    return NextResponse.json({
      enabled: false,
      reason: "server_error",
    });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { OpeningHour } from "@/types";
import type { ReservationSlotRow } from "@/lib/reservation-logic";
import {
  canSeatGuests,
  getGermanWeekday,
  getValidSlotMinutesForDate,
  isValidDateYYYYMMDD,
  minutesToHHMM,
  normalizeOpeningHours,
  occupiedSeatsForSlot,
  occupancyDenominator,
  parseReservationConfig,
  parseTimeToMinutes,
  reservationBlockOverlapsSlotStart,
} from "@/lib/reservation-logic";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getTenantId(): string {
  const id = process.env.NEXT_PUBLIC_TENANT_ID;
  if (!id) throw new Error("NEXT_PUBLIC_TENANT_ID is not set");
  return id;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date")?.trim() ?? "";
    const guestsRaw = searchParams.get("guests") ?? "2";
    const guests = Math.max(1, Math.min(50, parseInt(guestsRaw, 10) || 2));

    if (!isValidDateYYYYMMDD(date)) {
      return NextResponse.json(
        { error: "Ungültiges Datum. Erwartet: YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const tenantId = getTenantId();
    const supabase = await createClient();

    const { data: settingsRows, error: settingsError } = await supabase
      .from("store_settings")
      .select("*")
      .eq("tenant_id", tenantId)
      .limit(1);

    if (settingsError) {
      console.error("reservation/check settings:", settingsError);
      return NextResponse.json(
        { error: "Einstellungen konnten nicht geladen werden." },
        { status: 500 }
      );
    }

    const settingsRow = settingsRows?.[0];
    if (!settingsRow) {
      return NextResponse.json([]);
    }

    const config = parseReservationConfig(
      (settingsRow as { reservation_config?: unknown } | null)
        ?.reservation_config ?? null
    );
    if (!config) {
      return NextResponse.json([]);
    }

    const { buffer_minutes, avg_dining_minutes, tables } = config;

    const hours = normalizeOpeningHours(
      settingsRow?.opening_hours as OpeningHour[] | Record<string, unknown> | null
    );
    const weekdayName = getGermanWeekday(date);
    const dayRow = hours.find((h) => h.day === weekdayName);

    if (!dayRow || dayRow.closed || !dayRow.times?.length) {
      return NextResponse.json([]);
    }

    const slotMinutes = getValidSlotMinutesForDate(date, hours, config);

    const { data: reservationsRaw, error: resError } = await supabase
      .from("reservations")
      .select("id, time, guests, status")
      .eq("tenant_id", tenantId)
      .eq("date", date)
      .neq("status", "cancelled");

    if (resError) {
      console.error("reservation/check reservations:", resError);
      return NextResponse.json(
        { error: "Reservierungen konnten nicht geladen werden." },
        { status: 500 }
      );
    }

    const reservations = (reservationsRaw ?? []) as ReservationSlotRow[];

    const total = occupancyDenominator(config);
    if (total <= 0) {
      return NextResponse.json([]);
    }

    const result = slotMinutes.map((slotMin) => {
      const overlapping = reservations.filter((r) => {
        const rt = parseTimeToMinutes(r.time);
        if (Number.isNaN(rt)) return false;
        return reservationBlockOverlapsSlotStart(
          rt,
          slotMin,
          avg_dining_minutes,
          buffer_minutes
        );
      });

      const occupied = occupiedSeatsForSlot(overlapping, tables);

      const occupancy = Math.min(1, occupied / total);

      const available = canSeatGuests(overlapping, tables, guests);

      return {
        time: minutesToHHMM(slotMin),
        available,
        occupancy,
      };
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("reservation/check:", e);
    return NextResponse.json(
      { error: "Interner Fehler." },
      { status: 500 }
    );
  }
}

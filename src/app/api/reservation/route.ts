import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendReservationConfirmationEmails } from "@/lib/reservation-emails";
import type { OpeningHour } from "@/types";
import type { ReservationSlotRow } from "@/lib/reservation-logic";
import {
  canSeatGuests,
  findSmallestTableSeatCount,
  getValidSlotMinutesForDate,
  isTodayOrFutureDate,
  isValidDateYYYYMMDD,
  normalizeOpeningHours,
  normalizeTimeToSlotKey,
  parseReservationConfig,
  parseTimeToMinutes,
  reservationBlockOverlapsSlotStart,
} from "@/lib/reservation-logic";

export const dynamic = "force-dynamic";

function getTenantId(): string {
  const id = process.env.NEXT_PUBLIC_TENANT_ID;
  if (!id) throw new Error("NEXT_PUBLIC_TENANT_ID is not set");
  return id;
}

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  guests?: number;
  notes?: string;
};

export async function POST(request: Request) {
  try {
    let body: Body;
    const ct = request.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      body = (await request.json()) as Body;
    } else {
      const fd = await request.formData();
      body = {
        name: fd.get("name")?.toString(),
        email: fd.get("email")?.toString(),
        phone: fd.get("phone")?.toString(),
        date: fd.get("date")?.toString(),
        time: fd.get("time")?.toString(),
        guests: fd.get("guests") ? Number(fd.get("guests")) : undefined,
        notes: fd.get("message")?.toString() ?? fd.get("notes")?.toString(),
      };
    }

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const date = body.date?.trim() ?? "";
    const timeRaw = body.time?.trim() ?? "";
    const guestsNum =
      typeof body.guests === "number" && Number.isFinite(body.guests)
        ? Math.floor(body.guests)
        : parseInt(String(body.guests ?? ""), 10);
    const notes = body.notes?.trim() ?? "";

    if (!name || !date || !timeRaw || !Number.isFinite(guestsNum)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name, Datum, Uhrzeit und Gästeanzahl sind erforderlich.",
        },
        { status: 400 }
      );
    }

    if (!isValidDateYYYYMMDD(date) || !isTodayOrFutureDate(date)) {
      return NextResponse.json(
        {
          success: false,
          error: "Ungültiges Datum. Bitte wählen Sie heute oder ein zukünftiges Datum.",
        },
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

    const settingsRow = settingsRows?.[0];

    if (settingsError || !settingsRow) {
      return NextResponse.json(
        { success: false, error: "Einstellungen nicht gefunden." },
        { status: 500 }
      );
    }

    const config = parseReservationConfig(
      (settingsRow as { reservation_config?: unknown }).reservation_config ??
        null
    );

    const slotKey = normalizeTimeToSlotKey(timeRaw);
    if (!slotKey) {
      return NextResponse.json(
        { success: false, error: "Ungültige Uhrzeit." },
        { status: 400 }
      );
    }

    /* Einfacher Modus: keine reservation_config – nur plausibel prüfen und in DB speichern */
    if (!config) {
      if (guestsNum < 1 || guestsNum > 50) {
        return NextResponse.json(
          {
            success: false,
            error: "Gästeanzahl muss zwischen 1 und 50 liegen.",
          },
          { status: 400 }
        );
      }

      const insertSimpleFull: Record<string, unknown> = {
        tenant_id: tenantId,
        name,
        phone: phone || null,
        date,
        time: slotKey,
        guests: guestsNum,
        message: notes || null,
        status: "pending",
        source: "website",
      };

      let { data: rowSimple, error: insertSimpleErr } = await supabase
        .from("reservations")
        .insert(insertSimpleFull)
        .select("id")
        .single();

      if (insertSimpleErr?.code === "PGRST204") {
        const insertSimpleMin: Record<string, unknown> = {
          tenant_id: tenantId,
          name,
          phone: phone || null,
          date,
          time: slotKey,
          guests: guestsNum,
          status: "pending",
        };
        const retry = await supabase
          .from("reservations")
          .insert(insertSimpleMin)
          .select("id")
          .single();
        rowSimple = retry.data;
        insertSimpleErr = retry.error;
      }

      if (insertSimpleErr || !rowSimple) {
        console.error("reservation insert (simple):", insertSimpleErr);
        return NextResponse.json(
          {
            success: false,
            error: "Die Reservierung konnte nicht gespeichert werden.",
          },
          { status: 500 }
        );
      }

      const restaurantEmail =
        (settingsRow as { email?: string | null }).email ?? null;
      const restaurantPhone =
        (settingsRow as { phone?: string | null }).phone ?? null;

      try {
        await sendReservationConfirmationEmails({
          guestEmail: email,
          guestName: name,
          restaurantEmail,
          date,
          time: slotKey,
          guests: guestsNum,
          phoneRestaurant: restaurantPhone,
        });
      } catch (e) {
        console.error("reservation emails:", e);
      }

      return NextResponse.json({
        success: true,
        reservation_id: rowSimple.id,
        mode: "simple",
      });
    }

    const maxParty =
      typeof config.max_party_size === "number" && config.max_party_size >= 1
        ? Math.min(50, config.max_party_size)
        : 8;

    if (guestsNum < 1 || guestsNum > maxParty) {
      return NextResponse.json(
        {
          success: false,
          error: `Gästeanzahl muss zwischen 1 und ${maxParty} liegen.`,
        },
        { status: 400 }
      );
    }

    const hours = normalizeOpeningHours(
      settingsRow.opening_hours as OpeningHour[] | Record<string, unknown> | null
    );

    const validMinutes = getValidSlotMinutesForDate(date, hours, config);
    const requestedMin = parseTimeToMinutes(slotKey);
    if (Number.isNaN(requestedMin) || !validMinutes.includes(requestedMin)) {
      return NextResponse.json(
        {
          success: false,
          error: "Dieser Zeitslot ist an diesem Tag nicht verfügbar.",
        },
        { status: 400 }
      );
    }

    const { data: reservationsRaw, error: resError } = await supabase
      .from("reservations")
      .select("id, time, guests, status")
      .eq("tenant_id", tenantId)
      .eq("date", date)
      .neq("status", "cancelled");

    if (resError) {
      console.error("reservation POST reservations:", resError);
      return NextResponse.json(
        { success: false, error: "Reservierungen konnten nicht geprüft werden." },
        { status: 500 }
      );
    }

    const reservations = (reservationsRaw ?? []) as ReservationSlotRow[];
    const { buffer_minutes, avg_dining_minutes, tables } = config;

    const overlapping = reservations.filter((r) => {
      const rt = parseTimeToMinutes(r.time);
      if (Number.isNaN(rt)) return false;
      return reservationBlockOverlapsSlotStart(
        rt,
        requestedMin,
        avg_dining_minutes,
        buffer_minutes
      );
    });

    if (!canSeatGuests(overlapping, tables, guestsNum)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Dieser Zeitslot ist leider nicht mehr verfügbar.",
        },
        { status: 409 }
      );
    }

    const tableSize = findSmallestTableSeatCount(
      overlapping,
      tables,
      guestsNum
    );

    if (tableSize === null) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Dieser Zeitslot ist leider nicht mehr verfügbar.",
        },
        { status: 409 }
      );
    }

    const insertRowFull: Record<string, unknown> = {
      tenant_id: tenantId,
      name,
      phone: phone || null,
      date,
      time: slotKey,
      guests: guestsNum,
      message: notes || null,
      status: "pending",
      source: "website",
      table_size: tableSize,
    };

    let { data: row, error: insertError } = await supabase
      .from("reservations")
      .insert(insertRowFull)
      .select("id")
      .single();

    if (insertError?.code === "PGRST204") {
      const insertRowMin: Record<string, unknown> = {
        tenant_id: tenantId,
        name,
        phone: phone || null,
        date,
        time: slotKey,
        guests: guestsNum,
        status: "pending",
      };
      const retry = await supabase
        .from("reservations")
        .insert(insertRowMin)
        .select("id")
        .single();
      row = retry.data;
      insertError = retry.error;
    }

    if (insertError || !row) {
      console.error("reservation insert:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "Die Reservierung konnte nicht gespeichert werden.",
        },
        { status: 500 }
      );
    }

    const restaurantEmail =
      (settingsRow as { email?: string | null }).email ?? null;
    const restaurantPhone =
      (settingsRow as { phone?: string | null }).phone ?? null;

    try {
      await sendReservationConfirmationEmails({
        guestEmail: email,
        guestName: name,
        restaurantEmail,
        date,
        time: slotKey,
        guests: guestsNum,
        phoneRestaurant: restaurantPhone,
      });
    } catch (e) {
      console.error("reservation emails:", e);
    }

    return NextResponse.json({
      success: true,
      reservation_id: row.id,
    });
  } catch (e) {
    console.error("reservation POST:", e);
    return NextResponse.json(
      { success: false, error: "Interner Fehler." },
      { status: 500 }
    );
  }
}

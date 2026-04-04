import { NextResponse } from "next/server";
import { createReservation } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name")?.toString()?.trim() ?? "";
    const email = formData.get("email")?.toString()?.trim() ?? "";
    const phone = formData.get("phone")?.toString()?.trim() ?? "";
    const date = formData.get("date")?.toString() ?? "";
    const time = formData.get("time")?.toString() ?? "";
    const guestsRaw = formData.get("guests")?.toString() ?? "2";
    const message = formData.get("message")?.toString()?.trim() ?? "";

    if (!name || !email || !date || !time) {
      return NextResponse.json(
        { error: "Name, E-Mail, Datum und Uhrzeit sind erforderlich." },
        { status: 400 }
      );
    }

    const guests = Math.max(1, Math.min(50, parseInt(guestsRaw, 10) || 2));

    const reservation = await createReservation({
      name,
      email,
      phone: phone || undefined,
      date,
      time,
      guests,
      message: message || undefined,
    });

    return NextResponse.json({ success: true, id: reservation.id });
  } catch (err) {
    console.error("Reservation error:", err);
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Reservierung." },
      { status: 500 }
    );
  }
}

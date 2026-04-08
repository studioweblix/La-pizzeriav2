import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendContactFormNotifications } from "@/lib/reservation-emails";

export const dynamic = "force-dynamic";

function getTenantId(): string {
  const id = process.env.NEXT_PUBLIC_TENANT_ID;
  if (!id?.trim()) throw new Error("NEXT_PUBLIC_TENANT_ID is not set");
  return id.trim();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim() ?? "";
    const email = formData.get("email")?.toString().trim() ?? "";
    const phone = formData.get("phone")?.toString().trim() ?? "";
    const subject = formData.get("subject")?.toString().trim() ?? "";
    const message = formData.get("message")?.toString().trim() ?? "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, E-Mail und Nachricht sind erforderlich." },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error:
            "E-Mail-Versand ist nicht konfiguriert (RESEND_API_KEY).",
        },
        { status: 503 }
      );
    }

    const tenantId = getTenantId();
    const supabase = await createClient();

    const { data: rows, error } = await supabase
      .from("store_settings")
      .select("email")
      .eq("tenant_id", tenantId)
      .limit(1);

    if (error) {
      console.error("contact API store_settings:", error);
      return NextResponse.json(
        { error: "Einstellungen konnten nicht geladen werden." },
        { status: 500 }
      );
    }

    const restaurantEmail =
      (rows?.[0] as { email?: string | null } | undefined)?.email?.trim() ??
      null;

    if (!restaurantEmail) {
      return NextResponse.json(
        {
          error:
            "Es ist keine Empfänger-E-Mail im Dashboard (store_settings.email) hinterlegt.",
        },
        { status: 503 }
      );
    }

    const sent = await sendContactFormNotifications({
      restaurantEmail,
      guestEmail: email,
      guestName: name,
      phone,
      subject,
      message,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Die E-Mail konnte nicht gesendet werden." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("contact POST:", e);
    return NextResponse.json(
      { error: "Fehler beim Verarbeiten der Nachricht." },
      { status: 500 }
    );
  }
}

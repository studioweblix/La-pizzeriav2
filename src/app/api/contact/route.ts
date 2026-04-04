import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name")?.toString() ?? "";
    const email = formData.get("email")?.toString() ?? "";
    const phone = formData.get("phone")?.toString() ?? "";
    const subject = formData.get("subject")?.toString() ?? "";
    const message = formData.get("message")?.toString() ?? "";

    // Template: Hier später z.B. E-Mail versenden oder in Supabase speichern
    if (!email || !message) {
      return NextResponse.json(
        { error: "E-Mail und Nachricht sind erforderlich." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Fehler beim Verarbeiten der Nachricht." },
      { status: 500 }
    );
  }
}

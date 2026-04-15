/**
 * Optionale E-Mails via Resend (RESEND_API_KEY).
 * Kein zusätzliches npm-Paket – direkter Aufruf der REST-API.
 */

async function sendResend(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Resend error:", res.status, text);
    return false;
  }
  return true;
}

export async function sendReservationConfirmationEmails(opts: {
  guestEmail: string;
  guestName: string;
  restaurantEmail: string | null;
  date: string;
  time: string;
  guests: number;
  phoneRestaurant: string | null;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const dateFmt = new Date(opts.date + "T12:00:00").toLocaleDateString(
    "de-DE",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );

  const guestMail = opts.guestEmail.trim();
  if (guestMail) {
    await sendResend({
      to: guestMail,
      subject: `Reservierungsanfrage bei uns – ${dateFmt}`,
      html: `
      <p>Hallo ${escapeHtml(opts.guestName)},</p>
      <p>vielen Dank für Ihre Reservierungsanfrage.</p>
      <ul>
        <li><strong>Datum:</strong> ${escapeHtml(dateFmt)}</li>
        <li><strong>Uhrzeit:</strong> ${escapeHtml(opts.time)} Uhr</li>
        <li><strong>Personen:</strong> ${opts.guests}</li>
      </ul>
      <p>Wir bestätigen Ihre Reservierung in Kürze.</p>
      ${
        opts.phoneRestaurant
          ? `<p>Bei Rückfragen: ${escapeHtml(opts.phoneRestaurant)}</p>`
          : ""
      }
    `,
    });
  }

  if (opts.restaurantEmail?.trim()) {
    const emailLine = guestMail
      ? escapeHtml(guestMail)
      : "nicht angegeben";
    await sendResend({
      to: opts.restaurantEmail.trim(),
      subject: `Neue Reservierungsanfrage: ${escapeHtml(opts.guestName)}`,
      html: `
        <p><strong>Neue Anfrage über die Website</strong></p>
        <ul>
          <li><strong>Name:</strong> ${escapeHtml(opts.guestName)}</li>
          <li><strong>E-Mail:</strong> ${emailLine}</li>
          <li><strong>Datum:</strong> ${escapeHtml(dateFmt)}</li>
          <li><strong>Uhrzeit:</strong> ${escapeHtml(opts.time)}</li>
          <li><strong>Gäste:</strong> ${opts.guests}</li>
        </ul>
      `,
    });
  }
}

/** Kontaktformular: Benachrichtigung ans Restaurant + Kopie an Absender (Resend). */
export async function sendContactFormNotifications(opts: {
  restaurantEmail: string | null;
  guestEmail: string;
  guestName: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;

  const subj = opts.subject.trim() || "Kontaktanfrage Website";
  const safeSubject = subj.slice(0, 200);

  if (opts.restaurantEmail?.trim()) {
    const sent = await sendResend({
      to: opts.restaurantEmail.trim(),
      subject: `Kontakt: ${safeSubject}`,
      html: `
        <p><strong>Neue Nachricht über die Website</strong></p>
        <ul>
          <li><strong>Name:</strong> ${escapeHtml(opts.guestName)}</li>
          <li><strong>E-Mail:</strong> ${escapeHtml(opts.guestEmail)}</li>
          <li><strong>Telefon:</strong> ${escapeHtml(opts.phone || "—")}</li>
          <li><strong>Betreff:</strong> ${escapeHtml(subj)}</li>
        </ul>
        <p><strong>Nachricht</strong></p>
        <p style="white-space:pre-wrap;">${escapeHtml(opts.message)}</p>
      `,
    });
    if (!sent) return false;
  }

  return sendResend({
    to: opts.guestEmail,
    subject: `Ihre Nachricht an uns – ${safeSubject}`,
    html: `
      <p>Hallo ${escapeHtml(opts.guestName)},</p>
      <p>vielen Dank für Ihre Nachricht. Wir melden uns in Kürze bei Ihnen.</p>
      <p style="margin-top:1rem;padding-top:1rem;border-top:1px solid #eee;font-size:14px;color:#444;">
        <strong>Ihre Nachricht (Kopie):</strong>
      </p>
      <p style="white-space:pre-wrap;font-size:14px;">${escapeHtml(opts.message)}</p>
    `,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

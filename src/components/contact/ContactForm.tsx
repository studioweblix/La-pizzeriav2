"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setStatus("sending");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMessage(
          typeof data.error === "string" ? data.error : null
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage(null);
    }
  }

  const inputClass =
    "w-full border-b border-white/15 bg-transparent py-3 text-[13px] text-white placeholder:text-white/30 focus:border-[var(--color-secondary)] focus:outline-none transition-colors";

  return (
    <div>
      <h3
        className="font-heading text-lg font-medium text-white/90 md:text-xl"
        style={{ fontFamily: "var(--font-heading), serif" }}
      >
        Nachricht senden
      </h3>

      {status === "success" ? (
        <div className="mt-8 rounded border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5 px-6 py-8 text-center">
          <p className="text-sm font-medium text-[var(--color-secondary)]">
            Vielen Dank!
          </p>
          <p className="mt-2 text-xs text-white/50">
            Ihre Nachricht wurde erfolgreich gesendet.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatus("idle");
              setErrorMessage(null);
            }}
            className="mt-4 text-xs text-[var(--color-secondary)] underline underline-offset-4 hover:no-underline"
          >
            Weitere Nachricht senden
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
            <input
              type="text"
              name="name"
              placeholder="Name *"
              required
              className={inputClass}
            />
            <input
              type="email"
              name="email"
              placeholder="E-Mail *"
              required
              className={inputClass}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
            <input
              type="tel"
              name="phone"
              placeholder="Telefon *"
              className={inputClass}
            />
            <input
              type="text"
              name="subject"
              placeholder="Betreff *"
              className={inputClass}
            />
          </div>
          <textarea
            name="message"
            placeholder="Nachricht *"
            required
            rows={4}
            className={`${inputClass} resize-vertical`}
          />

          {status === "error" && (
            <p className="text-xs text-red-400/95">
              {errorMessage ??
                "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut."}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-sm bg-[var(--color-secondary)] px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-dark)] transition-all hover:brightness-110 disabled:opacity-50"
            >
              {status === "sending" ? "Wird gesendet…" : "Senden"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

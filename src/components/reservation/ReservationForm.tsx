"use client";

import { useState } from "react";
import { CalendarDays, Clock, Users } from "lucide-react";

const TIME_SLOTS = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
];

const GUEST_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function ReservationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setStatus("sending");
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "w-full border-b border-white/15 bg-transparent py-3 text-[13px] text-white placeholder:text-white/30 focus:border-[var(--color-secondary)] focus:outline-none transition-colors";
  const selectClass =
    "w-full appearance-none border-b border-white/15 bg-transparent py-3 text-[13px] text-white focus:border-[var(--color-secondary)] focus:outline-none transition-colors cursor-pointer";

  return (
    <div>
      <h3
        className="font-heading text-lg font-medium text-white/90 md:text-xl"
        style={{ fontFamily: "var(--font-heading), serif" }}
      >
        Tisch reservieren
      </h3>

      {status === "success" ? (
        <div className="mt-8 rounded border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5 px-6 py-8 text-center">
          <p className="text-sm font-medium text-[var(--color-secondary)]">
            Reservierung eingegangen!
          </p>
          <p className="mt-2 text-xs text-white/50">
            Wir bestätigen Ihre Reservierung in Kürze per E-Mail.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-4 text-xs text-[var(--color-secondary)] underline underline-offset-4 hover:no-underline"
          >
            Weitere Reservierung
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

          <input
            type="tel"
            name="phone"
            placeholder="Telefon (optional)"
            className={inputClass}
          />

          <div className="grid gap-5 sm:grid-cols-3 sm:gap-8">
            <div className="relative">
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-widest text-white/35">
                <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
                Datum
              </label>
              <input
                type="date"
                name="date"
                required
                min={getTomorrowDate()}
                defaultValue={getTomorrowDate()}
                className={`${inputClass} date-input`}
              />
            </div>
            <div className="relative">
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-widest text-white/35">
                <Clock className="mr-1 inline h-3.5 w-3.5" />
                Uhrzeit
              </label>
              <select name="time" required className={selectClass} defaultValue="19:00">
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t} className="bg-[var(--color-dark)] text-white">
                    {t} Uhr
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-widest text-white/35">
                <Users className="mr-1 inline h-3.5 w-3.5" />
                Gäste
              </label>
              <select name="guests" required className={selectClass} defaultValue="2">
                {GUEST_OPTIONS.map((n) => (
                  <option key={n} value={n} className="bg-[var(--color-dark)] text-white">
                    {n} {n === 1 ? "Person" : "Personen"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            name="message"
            placeholder="Sonderwünsche (optional)"
            rows={3}
            className={`${inputClass} resize-none`}
          />

          {status === "error" && (
            <p className="text-xs text-red-400">
              Reservierung konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-sm bg-[var(--color-secondary)] px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-dark)] transition-all hover:brightness-110 disabled:opacity-50"
            >
              {status === "sending" ? "Wird gesendet…" : "Reservieren"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { OpeningHour, StoreSettings } from "@/types";

const GERMAN_DAYS = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
] as const;

type SlotRow = { time: string; available: boolean; occupancy: number };

function formatYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeOpeningHours(
  raw: OpeningHour[] | null | undefined
): OpeningHour[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is OpeningHour =>
      item != null &&
      typeof item === "object" &&
      "day" in item &&
      "closed" in item
  );
}

function isOpenOnGermanDay(
  hours: OpeningHour[],
  germanDay: string
): boolean {
  const row = hours.find((h) => h.day === germanDay);
  return Boolean(row && !row.closed && row.times && row.times.length > 0);
}

function getOpenDatesForNextDays(
  hours: OpeningHour[],
  fromTomorrow: number,
  horizonDays: number
): string[] {
  const normalized = normalizeOpeningHours(hours);
  const out: string[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  for (let i = fromTomorrow; i <= horizonDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dayName = GERMAN_DAYS[d.getDay()];
    if (normalized.length === 0) {
      out.push(formatYYYYMMDD(d));
      continue;
    }
    if (isOpenOnGermanDay(normalized, dayName)) {
      out.push(formatYYYYMMDD(d));
    }
  }
  return out;
}

function formatTimesLine(times: { open: string; close: string }[]): string {
  if (!times.length) return "—";
  return times.map((t) => `${t.open} – ${t.close}`).join(" · ");
}

interface ReservationFormProps {
  settings: StoreSettings | null;
}

export function ReservationForm({ settings }: ReservationFormProps) {
  const [maxParty, setMaxParty] = useState(8);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(() =>
    normalizeOpeningHours(
      (settings?.opening_hours as OpeningHour[] | null | undefined) ?? null
    )
  );
  const [configLoading, setConfigLoading] = useState(true);
  /** null = laden; false = API: enabled false */
  const [reservationEnabled, setReservationEnabled] = useState<boolean | null>(
    null
  );
  const [configDisabledReason, setConfigDisabledReason] = useState<string | null>(
    null
  );
  /** full = Slots + Verfügbarkeit; simple = eine Seite, speichert direkt in DB */
  const [reservationMode, setReservationMode] = useState<
    "full" | "simple" | null
  >(null);
  /** Nur Modus „einfach“: Uhrzeit (HTML time) */
  const [manualTime, setManualTime] = useState("");

  const [date, setDate] = useState("");
  const [guests, setGuests] = useState<number>(2);

  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "sending" | "error"
  >("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const phoneDisplay = settings?.phone ?? null;
  const address = settings?.address ?? null;
  const hoursRows = normalizeOpeningHours(
    openingHours.length
      ? openingHours
      : (settings?.opening_hours as OpeningHour[] | null) ?? null
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/reservation/config");
        const data = (await res.json()) as {
          enabled?: boolean;
          mode?: string;
          max_party_size?: number;
          reason?: string;
        };
        if (cancelled) return;
        if (data.enabled === true) {
          setReservationEnabled(true);
          setConfigDisabledReason(null);
          const mode = data.mode === "simple" ? "simple" : "full";
          setReservationMode(mode);
          if (
            typeof data.max_party_size === "number" &&
            data.max_party_size >= 1
          ) {
            setMaxParty(Math.min(50, data.max_party_size));
          }
        } else {
          setReservationEnabled(false);
          setReservationMode(null);
          setConfigDisabledReason(
            typeof data.reason === "string" ? data.reason : null
          );
        }
      } catch {
        if (!cancelled) {
          setReservationEnabled(false);
          setReservationMode(null);
          setConfigDisabledReason("server_error");
          setMaxParty(8);
        }
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openDates = useMemo(
    () => getOpenDatesForNextDays(openingHours, 1, 90),
    [openingHours]
  );

  useEffect(() => {
    if (!date || openDates.length === 0) return;
    if (!openDates.includes(date)) {
      setDate("");
      setSlots([]);
      setSelectedTime(null);
    }
  }, [date, openDates]);

  const step1Ready = Boolean(date && guests >= 1);

  const fetchSlots = useCallback(async () => {
    if (!date || !guests) return;
    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedTime(null);
    try {
      const res = await fetch(
        `/api/reservation/check?date=${encodeURIComponent(date)}&guests=${guests}`
      );
      if (!res.ok) {
        setSlots([]);
        setSlotsError("Zeitslots konnten nicht geladen werden.");
        return;
      }
      const data = (await res.json()) as SlotRow[];
      if (!Array.isArray(data)) {
        setSlots([]);
        return;
      }
      setSlots(data);
    } catch {
      setSlots([]);
      setSlotsError("Zeitslots konnten nicht geladen werden.");
    } finally {
      setSlotsLoading(false);
    }
  }, [date, guests]);

  useEffect(() => {
    if (reservationMode !== "full") return;
    if (!step1Ready) {
      setSlots([]);
      setSelectedTime(null);
      return;
    }
    fetchSlots();
  }, [step1Ready, fetchSlots, reservationMode]);

  const allSlotsFull =
    slots.length > 0 && slots.every((s) => !s.available);

  const noSlotsConfigured = !slotsLoading && step1Ready && slots.length === 0;

  async function handleSimpleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !manualTime.trim()) return;
    setSubmitStatus("sending");
    setSubmitError(null);
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date,
          time: manualTime.trim(),
          guests,
          notes: message.trim(),
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
      };
      if (res.ok && data.success) {
        setSelectedTime(manualTime.trim());
        setSuccess(true);
        setSubmitStatus("idle");
        return;
      }
      setSubmitError(
        data.error ?? "Die Reservierung konnte nicht gespeichert werden."
      );
      setSubmitStatus("error");
    } catch {
      setSubmitError("Die Reservierung konnte nicht gespeichert werden.");
      setSubmitStatus("error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTime || !date) return;
    setSubmitStatus("sending");
    setSubmitError(null);
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          date,
          time: selectedTime,
          guests,
          notes: message.trim(),
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
      };
      if (res.ok && data.success) {
        setSuccess(true);
        setSubmitStatus("idle");
        return;
      }
      setSubmitError(
        data.error ??
          "Die Reservierung konnte nicht gespeichert werden."
      );
      setSubmitStatus("error");
      await fetchSlots();
    } catch {
      setSubmitError(
        "Die Reservierung konnte nicht gespeichert werden."
      );
      setSubmitStatus("error");
      await fetchSlots();
    }
  }

  function resetAll() {
    setSuccess(false);
    setDate("");
    setGuests(2);
    setManualTime("");
    setSlots([]);
    setSelectedTime(null);
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setSubmitStatus("idle");
    setSubmitError(null);
    setSlotsError(null);
  }

  const guestOptions = useMemo(
    () => Array.from({ length: maxParty }, (_, i) => i + 1),
    [maxParty]
  );

  useEffect(() => {
    if (guests > maxParty) setGuests(maxParty);
  }, [maxParty, guests]);

  const shell =
    "relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.06] to-transparent p-6 shadow-[0_28px_90px_-32px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.04] backdrop-blur-md md:p-9";
  const inputClass =
    "w-full rounded-xl border border-white/[0.1] bg-black/25 px-4 py-3.5 text-[14px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-white/30 focus:border-[var(--color-secondary)]/45 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/20 transition-all";
  const labelClass =
    "mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]";
  const btnPrimary =
    "inline-flex w-full min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[var(--color-secondary)] px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--color-dark)] shadow-[0_12px_40px_-12px_rgba(198,40,40,0.55)] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-45 sm:w-auto";
  const asideCard =
    "rounded-2xl border border-white/[0.06] bg-[var(--color-dark-surface)]/90 p-6 shadow-xl ring-1 ring-white/[0.03] md:p-8";

  const showStep2 =
    reservationMode === "full" && step1Ready && !slotsLoading;
  const showStep3 = Boolean(selectedTime && showStep2);

  const todayMinDate = formatYYYYMMDD(new Date());

  const fullStepIndex =
    reservationMode === "full"
      ? !step1Ready
        ? 1
        : !selectedTime
          ? 2
          : 3
      : 1;

  return (
    <div className="space-y-10">
      <div className="border-b border-white/[0.06] pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--color-secondary)]">
          Reservierung
        </p>
        <h3
          className="mt-2 font-heading text-2xl font-semibold tracking-tight text-white md:text-3xl"
          style={{ fontFamily: "var(--font-heading), serif" }}
        >
          {reservationMode === "simple"
            ? "Ihre Tisch-Anfrage"
            : "Planen Sie Ihren Besuch"}
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55">
          {!configLoading && reservationMode === "simple"
            ? "Tragen Sie Ihre Wünsche ein – wir speichern Ihre Anfrage und melden uns."
            : "Wählen Sie Datum und Personenanzahl, dann einen freien Zeitraum."}
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_min(300px,100%)] md:items-start md:gap-10 lg:grid-cols-[1fr_min(320px,100%)] lg:gap-12">
        <div>
        {!configLoading && reservationEnabled === false && (
          <div
            className={`${shell} border-amber-500/20 bg-amber-950/10`}
          >
            <p className="text-sm text-white/80">
              Online-Reservierung ist derzeit nicht aktiv oder nicht
              eingerichtet.
            </p>
            {configDisabledReason && (
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs text-white/50">
                {configDisabledReason === "no_store_settings_row" && (
                  <p>
                    <strong className="text-white/60">Hinweis:</strong> Für die{" "}
                    <code className="text-[var(--color-secondary)]">
                      NEXT_PUBLIC_TENANT_ID
                    </code>{" "}
                    gibt es keine Zeile in{" "}
                    <code className="text-[var(--color-secondary)]">
                      store_settings
                    </code>{" "}
                    (die UUID muss exakt übereinstimmen).
                  </p>
                )}
                {configDisabledReason === "reservation_config_empty" && (
                  <p>
                    <strong className="text-white/60">Hinweis:</strong> Das Feld{" "}
                    <code className="text-[var(--color-secondary)]">
                      reservation_config
                    </code>{" "}
                    ist leer. Die Tenant-ID gehört in die Spalte{" "}
                    <code className="text-[var(--color-secondary)]">
                      tenant_id
                    </code>
                    , nicht in dieses JSON.
                  </p>
                )}
                {configDisabledReason === "reservation_config_invalid" && (
                  <p>
                    <strong className="text-white/60">Hinweis:</strong>{" "}
                    <code className="text-[var(--color-secondary)]">
                      reservation_config
                    </code>{" "}
                    ist ungültig. Erforderlich (Zahlen):{" "}
                    <code className="text-[var(--color-secondary)]">
                      slot_interval_minutes
                    </code>
                    ,{" "}
                    <code className="text-[var(--color-secondary)]">
                      buffer_minutes
                    </code>
                    ,{" "}
                    <code className="text-[var(--color-secondary)]">
                      avg_dining_minutes
                    </code>
                    ,{" "}
                    <code className="text-[var(--color-secondary)]">
                      tables
                    </code>{" "}
                    (Array mit{" "}
                    <code className="text-[var(--color-secondary)]">
                      seats
                    </code>{" "}
                    und{" "}
                    <code className="text-[var(--color-secondary)]">
                      count
                    </code>
                    ).
                  </p>
                )}
                {configDisabledReason === "store_settings_fetch_failed" && (
                  <p>
                    <strong className="text-white/60">Hinweis:</strong> Die
                    Einstellungen konnten nicht geladen werden (z. B. RLS in
                    Supabase: Lesen auf{" "}
                    <code className="text-[var(--color-secondary)]">
                      store_settings
                    </code>{" "}
                    für die Rolle <code>anon</code> erlauben).
                  </p>
                )}
                {configDisabledReason === "missing_tenant_env" && (
                  <p>
                    <strong className="text-white/60">Hinweis:</strong>{" "}
                    <code className="text-[var(--color-secondary)]">
                      NEXT_PUBLIC_TENANT_ID
                    </code>{" "}
                    fehlt in der Umgebung (Vercel / .env.local).
                  </p>
                )}
              </div>
            )}
            {phoneDisplay && (
              <p className="mt-3">
                Bitte reservieren Sie telefonisch:{" "}
                <a
                  href={`tel:${phoneDisplay.replace(/\s/g, "")}`}
                  className="font-medium text-[var(--color-secondary)] hover:underline"
                >
                  {phoneDisplay}
                </a>
              </p>
            )}
          </div>
        )}

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${shell} border-emerald-500/25 bg-emerald-950/[0.15] text-center`}
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="relative mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 text-emerald-300 ring-1 ring-emerald-400/30"
            >
              <CheckCircle2 className="h-10 w-10" strokeWidth={1.25} />
            </motion.div>
            <p className="relative mt-8 font-heading text-2xl text-white md:text-3xl">
              Vielen Dank, {name.trim() || "Gast"}!
            </p>
            <p className="relative mt-4 text-sm text-white/65">
              {date && selectedTime && (
                <>
                  {new Date(date + "T12:00:00").toLocaleDateString("de-DE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {selectedTime} Uhr · {guests}{" "}
                  {guests === 1 ? "Person" : "Personen"}
                </>
              )}
            </p>
            <p className="relative mt-3 text-sm text-white/50">
              Wir bestätigen Ihre Reservierung in Kürze.
            </p>
            {phoneDisplay && (
              <p className="relative mt-8 text-xs text-white/40">
                Rückfragen:{" "}
                <a
                  href={`tel:${phoneDisplay.replace(/\s/g, "")}`}
                  className="text-[var(--color-secondary)] hover:underline"
                >
                  {phoneDisplay}
                </a>
              </p>
            )}
            <button
              type="button"
              onClick={resetAll}
              className="relative mt-10 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--color-secondary)] transition hover:underline"
            >
              Weitere Reservierung
            </button>
          </motion.div>
        ) : !configLoading &&
          reservationEnabled === true &&
          reservationMode === "simple" ? (
          <form
            onSubmit={handleSimpleSubmit}
            className={`${shell} mt-2 space-y-8`}
          >
            <div className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 text-xs leading-relaxed text-white/50">
              <span className="font-medium text-[var(--color-secondary)]">
                Hinweis:
              </span>{" "}
              Ohne erweiterte Konfiguration prüfen wir keine freien Kapazitäten
              automatisch. Optional können Sie später in der Datenbank{" "}
              <code className="rounded bg-white/5 px-1 text-[var(--color-secondary)]">
                reservation_config
              </code>{" "}
              pflegen – dann erscheint die Buchung mit Zeitslots.
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="simple-date">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Datum *
                </label>
                <input
                  id="simple-date"
                  type="date"
                  required
                  min={todayMinDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="simple-time">
                  <Clock className="h-3.5 w-3.5" />
                  Uhrzeit *
                </label>
                <input
                  id="simple-time"
                  type="time"
                  required
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="simple-guests">
                <Users className="h-3.5 w-3.5" />
                Gäste *
              </label>
              <select
                id="simple-guests"
                value={guests}
                onChange={(e) =>
                  setGuests(Number(e.target.value) || 2)
                }
                className={`${inputClass} cursor-pointer`}
              >
                {guestOptions.map((n) => (
                  <option key={n} value={n} className="bg-[#1a1a1a]">
                    {n} {n === 1 ? "Person" : "Personen"}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="simple-name">
                  Name *
                </label>
                <input
                  id="simple-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className={inputClass}
                  placeholder="Vor- und Nachname"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="simple-email">
                  E-Mail *
                </label>
                <input
                  id="simple-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="simple-phone">
                Telefon
              </label>
              <input
                id="simple-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="simple-msg">
                Besondere Wünsche
              </label>
              <textarea
                id="simple-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
            {submitStatus === "error" && submitError && (
              <p className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200/90">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitStatus === "sending"}
              className={btnPrimary}
            >
              {submitStatus === "sending" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {submitStatus === "sending"
                ? "Wird gesendet…"
                : "Anfrage senden"}
            </button>
          </form>
        ) : !configLoading &&
          reservationEnabled === true &&
          reservationMode === "full" ? (
          <form
            onSubmit={handleSubmit}
            className={`${shell} mt-2 space-y-12`}
          >
            <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6">
              {(
                [
                  { n: 1 as const, label: "Datum & Gäste" },
                  { n: 2 as const, label: "Uhrzeit" },
                  { n: 3 as const, label: "Kontakt" },
                ] as const
              ).map((s) => {
                const active = fullStepIndex === s.n;
                const done = fullStepIndex > s.n;
                return (
                  <div
                    key={s.n}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold tabular-nums transition-colors ${
                        active
                          ? "bg-[var(--color-secondary)] text-[var(--color-dark)] shadow-lg shadow-black/40"
                          : done
                            ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/25"
                            : "bg-white/[0.05] text-white/35 ring-1 ring-white/[0.06]"
                      }`}
                    >
                      {done && !active ? "✓" : s.n}
                    </span>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
                        active ? "text-white" : "text-white/40"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Schritt 1 */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                Schritt 1
              </p>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="res-date">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Datum
                  </label>
                  {openDates.length === 0 ? (
                    <p className="text-xs text-amber-400/90">
                      Keine Öffnungstage hinterlegt. Bitte kontaktieren Sie uns
                      telefonisch.
                    </p>
                  ) : (
                    <select
                      id="res-date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setSelectedTime(null);
                      }}
                      required
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="">Datum wählen</option>
                      {openDates.map((d) => (
                        <option key={d} value={d} className="bg-[#1a1a1a]">
                          {new Date(d + "T12:00:00").toLocaleDateString(
                            "de-DE",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className={labelClass} htmlFor="res-guests">
                    <Users className="h-3.5 w-3.5" />
                    Gäste
                  </label>
                  <select
                    id="res-guests"
                    value={guests}
                    onChange={(e) =>
                      setGuests(Number(e.target.value) || 2)
                    }
                    className={`${inputClass} cursor-pointer`}
                  >
                    {guestOptions.map((n) => (
                      <option key={n} value={n} className="bg-[#1a1a1a]">
                        {n} {n === 1 ? "Person" : "Personen"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {step1Ready && (
                <div className="mt-6 flex items-center gap-2 text-white/50">
                  {slotsLoading && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--color-secondary)]" />
                      <span className="text-xs">Verfügbarkeit wird geprüft…</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Schritt 2 */}
            <AnimatePresence mode="wait">
              {showStep2 && (
                <motion.div
                  key="slots"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                    Schritt 2
                  </p>
                  <p className="mt-2 text-sm text-white/55">
                    Uhrzeit wählen
                  </p>

                  {slotsError && (
                    <p className="mt-4 text-xs text-red-400">{slotsError}</p>
                  )}

                  {noSlotsConfigured && !slotsError && (
                    <p className="mt-4 text-sm text-white/50">
                      Für diesen Tag sind keine Zeitslots verfügbar. Bitte
                      wählen Sie ein anderes Datum oder kontaktieren Sie uns
                      direkt.
                    </p>
                  )}

                  {allSlotsFull && (
                    <p className="mt-4 rounded-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
                      Leider ist an diesem Tag kein Platz mehr frei. Bitte
                      wählen Sie einen anderen Tag.
                    </p>
                  )}

                  {slots.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {slots.map((slot) => {
                        const isSel = selectedTime === slot.time;
                        const occHigh = slot.available && slot.occupancy > 0.7;
                        const dead = !slot.available;

                        let btn =
                          "relative flex min-h-[76px] flex-col items-center justify-center rounded-xl border px-2 py-3.5 text-center transition-all duration-200 ";
                        if (dead) {
                          btn +=
                            "cursor-not-allowed border-white/[0.06] bg-black/20 text-white/28";
                        } else if (occHigh) {
                          btn += isSel
                            ? "border-amber-400/70 bg-gradient-to-b from-amber-500/25 to-amber-950/40 text-amber-50 ring-2 ring-amber-400/35"
                            : "border-amber-500/30 bg-amber-950/25 text-amber-100/95 hover:border-amber-400/55 hover:bg-amber-950/35";
                        } else {
                          btn += isSel
                            ? "border-emerald-400/70 bg-gradient-to-b from-emerald-500/25 to-emerald-950/40 text-emerald-50 ring-2 ring-emerald-400/35"
                            : "border-emerald-500/25 bg-emerald-950/20 text-emerald-100/95 hover:border-emerald-400/50 hover:bg-emerald-950/30";
                        }

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={dead}
                            onClick={() => !dead && setSelectedTime(slot.time)}
                            className={btn}
                          >
                            <span className="flex items-center gap-1 text-sm font-medium tabular-nums">
                              <Clock className="h-3.5 w-3.5 opacity-70" />
                              {slot.time}
                            </span>
                            {dead && (
                              <span className="mt-1 text-[10px] uppercase tracking-wider text-red-400/90">
                                Ausgebucht
                              </span>
                            )}
                            {slot.available && occHigh && (
                              <span className="mt-1 text-[10px] uppercase tracking-wider text-amber-200/90">
                                Wenige Plätze
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Schritt 3 */}
            <AnimatePresence>
              {showStep3 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <div className="pt-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                      Schritt 3
                    </p>
                    <p className="mt-2 text-sm text-white/55">
                      Ihre Kontaktdaten
                    </p>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="res-name">
                          Name *
                        </label>
                        <input
                          id="res-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          autoComplete="name"
                          className={inputClass}
                          placeholder="Vor- und Nachname"
                        />
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="res-email">
                          E-Mail *
                        </label>
                        <input
                          id="res-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className={inputClass}
                          placeholder="für die Bestätigung"
                        />
                      </div>
                    </div>
                    <div className="mt-5">
                      <label className={labelClass} htmlFor="res-phone">
                        Telefon
                      </label>
                      <input
                        id="res-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        className={inputClass}
                        placeholder="optional"
                      />
                    </div>
                    <div className="mt-5">
                      <label className={labelClass} htmlFor="res-msg">
                        Besondere Wünsche
                      </label>
                      <textarea
                        id="res-msg"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className={`${inputClass} resize-none`}
                        placeholder="Allergien, Kinderstuhl, besonderer Anlass…"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {submitStatus === "error" && (
              <p className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200/90">
                {submitError ??
                  "Die Reservierung konnte nicht gespeichert werden – der Slot war möglicherweise gerade vergeben. Bitte wählen Sie eine andere Uhrzeit."}
              </p>
            )}

            {showStep3 && (
              <div className="border-t border-white/[0.06] pt-8">
                <button
                  type="submit"
                  disabled={submitStatus === "sending"}
                  className={btnPrimary}
                >
                  {submitStatus === "sending" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {submitStatus === "sending"
                    ? "Wird gesendet…"
                    : "Tisch reservieren"}
                </button>
              </div>
            )}
          </form>
        ) : configLoading ? (
          <div
            className={`${shell} mt-2 flex items-center gap-4 border-dashed border-white/10`}
          >
            <Loader2 className="h-6 w-6 shrink-0 animate-spin text-[var(--color-secondary)]" />
            <div>
              <p className="text-sm font-medium text-white/80">
                Formular wird geladen…
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                Buchungsoptionen werden abgerufen.
              </p>
            </div>
          </div>
        ) : null}
        </div>

      {/* Info-Karte – gleiche Zeile wie das Formular (ab md) */}
      <aside className={`${asideCard} md:sticky md:top-28`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-secondary)]">
          Kontakt
        </p>
        {address && (
          <div className="mt-5 flex gap-3 text-sm text-white/75">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
            <span className="whitespace-pre-line leading-relaxed">
              {address}
            </span>
          </div>
        )}
        {phoneDisplay && (
          <div className="mt-4 flex gap-3 text-sm">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
            <a
              href={`tel:${phoneDisplay.replace(/\s/g, "")}`}
              className="text-white/85 hover:text-[var(--color-secondary)]"
            >
              {phoneDisplay}
            </a>
          </div>
        )}
        {hoursRows.length > 0 && (
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Öffnungszeiten
            </p>
            <ul className="mt-4 space-y-2 text-xs text-white/65">
              {hoursRows.map((row) => (
                <li
                  key={row.day}
                  className="flex justify-between gap-4 border-b border-white/5 pb-2 last:border-0"
                >
                  <span className="text-white/80">{row.day}</span>
                  <span className="shrink-0 text-right">
                    {row.closed || !row.times?.length
                      ? "Ruhetag"
                      : formatTimesLine(row.times)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!address && !phoneDisplay && hoursRows.length === 0 && (
          <p className="mt-4 text-xs text-white/40">
            Angaben folgen in Kürze.
          </p>
        )}
      </aside>
      </div>
    </div>
  );
}

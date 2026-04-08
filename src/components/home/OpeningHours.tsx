import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
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

function getTodayName(): string {
  return GERMAN_DAYS[new Date().getDay()];
}

function formatTimes(times: { open: string; close: string }[]): string {
  if (!times.length) return "Ruhetag";
  return times.map((t) => `${t.open} – ${t.close}`).join(" & ");
}

function normalizeOpeningHours(
  raw: OpeningHour[] | Record<string, unknown> | null | undefined
): OpeningHour[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is OpeningHour =>
        item != null &&
        typeof item === "object" &&
        "day" in item &&
        "closed" in item
    );
  }
  return [];
}

interface OpeningHoursProps {
  settings: StoreSettings | null;
  kicker?: string;
  title?: string;
  intro?: string;
  boxKicker?: string;
}

export function OpeningHours({
  settings,
  kicker = "Herzlich Willkommen",
  title = "Unsere Öffnungszeiten",
  intro = "Wir freuen uns auf Ihren Besuch. Genießen Sie unsere Küche zu den folgenden Zeiten.",
  boxKicker = "Für Sie da",
}: OpeningHoursProps) {
  const hours = normalizeOpeningHours(settings?.opening_hours ?? null);
  const todayName = getTodayName();

  return (
    <AnimatedSection
      animation="slideUp"
      as="section"
      className="relative py-20 md:py-28 bg-[var(--color-dark-card)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-secondary)]">
              {kicker}
            </p>
            <h2
              className="mt-3 font-heading text-3xl font-medium text-white md:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-heading), serif" }}
            >
              {title}
            </h2>
            <p className="mt-6 max-w-lg text-base text-white/60 leading-relaxed">
              {intro}
            </p>
          </div>

          {hours.length === 0 ? (
            <p className="text-white/60">
              Keine Öffnungszeiten hinterlegt.
            </p>
          ) : (
            <div className="rounded-lg border border-white/10 bg-[var(--color-dark)]/60 backdrop-blur-sm p-6 md:p-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
                {boxKicker}
              </p>
              <ul className="divide-y divide-white/10">
                {hours.map((row) => {
                  const isToday = row.day === todayName;
                  const isClosed = row.closed || !row.times?.length;
                  const timesText = isClosed
                    ? "Ruhetag"
                    : formatTimes(row.times ?? []);

                  return (
                    <li
                      key={row.day}
                      className={`flex items-center justify-between gap-4 py-3.5 ${
                        isToday ? "text-[var(--color-secondary)]" : ""
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          isToday ? "font-semibold" : "text-white"
                        }`}
                      >
                        {row.day}
                        {isToday && (
                          <span className="ml-2 text-xs opacity-70">
                            (Heute)
                          </span>
                        )}
                      </span>
                      <span
                        className={
                          isClosed
                            ? "italic text-white/40"
                            : isToday
                              ? ""
                              : "text-white/70"
                        }
                      >
                        {timesText}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}

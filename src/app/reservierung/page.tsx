import Image from "next/image";
import { getPageContent, getSettings, getTenant } from "@/lib/data";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ReservationForm } from "@/components/reservation/ReservationForm";
import { ExternalWidget } from "@/components/reservation/ExternalWidget";
import { CustomEmbed } from "@/components/reservation/CustomEmbed";
import type { ReservationType } from "@/types";

export const metadata = {
  title: "Reservierung",
  description: "Reservieren Sie jetzt Ihren Tisch bei uns.",
};

export default async function ReservierungPage() {
  const [pageReservierung, pageSpeisekarte, settings, tenant] = await Promise.all([
    getPageContent("reservierung"),
    getPageContent("speisekarte"),
    getSettings(),
    getTenant(),
  ]);

  const content = pageReservierung?.content ?? {};
  const speisekarteContent = pageSpeisekarte?.content ?? {};
  const tenantName = tenant?.name ?? "La Pizza";

  const heroImage =
    typeof content.hero_image === "string"
      ? content.hero_image
      : typeof speisekarteContent.hero_image === "string"
        ? speisekarteContent.hero_image
        : null;

  const reservationType = settings?.reservation_type ?? null;
  const externalId = settings?.reservation_external_id ?? "";
  const widgetCode = settings?.reservation_widget_code ?? "";

  const isExternal =
    reservationType === "quandoo" ||
    reservationType === "opentable" ||
    reservationType === "resy" ||
    reservationType === "formitable";

  return (
    <div className="min-h-screen bg-[var(--color-dark)]">

      {/* Hero */}
      <section className="relative min-h-[70vh] overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            quality={92}
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--color-dark-card)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

        <div className="relative z-10 flex h-full min-h-[70vh] items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
              {tenantName}
            </p>
            <h1
              className="mt-2 font-heading text-4xl font-bold tracking-wide text-white sm:text-5xl md:text-6xl"
              style={{ fontFamily: "var(--font-heading), serif" }}
            >
              Reservierung
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <AnimatedSection animation="slideUp" as="section" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {isExternal ? (
            <ExternalWidget
              provider={reservationType as ReservationType}
              externalId={externalId}
            />
          ) : reservationType === "custom" ? (
            <CustomEmbed code={widgetCode} />
          ) : (
            <ReservationForm settings={settings} />
          )}

        </div>
      </AnimatedSection>

    </div>
  );
}

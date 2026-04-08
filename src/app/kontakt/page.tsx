import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { getPageContent, getSettings } from "@/lib/data";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export const metadata = {
  title: "Kontakt",
  description: "Kontaktieren Sie uns – Wir freuen uns auf Ihre Nachricht.",
};

export default async function KontaktPage() {
  const [page, pageSpeisekarte, settings] = await Promise.all([
    getPageContent("kontakt"),
    getPageContent("speisekarte"),
    getSettings(),
  ]);

  const content = page?.content ?? {};
  const speisekarteContent = pageSpeisekarte?.content ?? {};
  const heroImage =
    typeof content.hero_image === "string"
      ? content.hero_image
      : typeof speisekarteContent.hero_image === "string"
        ? speisekarteContent.hero_image
        : null;
  const description =
    typeof content.description === "string" && content.description.trim()
      ? content.description
      : null;

  const phone = settings?.phone ?? null;
  const email = settings?.email ?? null;
  const address = settings?.address ?? null;

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
              Kontaktieren Sie uns
            </p>
            <h1
              className="mt-2 font-heading text-4xl font-bold tracking-wide text-white sm:text-5xl md:text-6xl"
              style={{ fontFamily: "var(--font-heading), serif" }}
            >
              Kontakt
            </h1>
          </div>
        </div>
      </section>

      {/* Kontaktinfos, zentriert */}
      <AnimatedSection animation="slideUp" as="section" className="py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          {description && (
            <p className="mx-auto text-[13px] leading-relaxed text-white/45">
              {description}
            </p>
          )}

          <div className="mt-12 space-y-10">
            <div className="flex flex-col items-center gap-2">
              <Phone
                className="h-5 w-5 text-[var(--color-secondary)]/70"
                strokeWidth={1.5}
              />
              <p className="text-[11px] font-medium uppercase tracking-widest text-white/35">
                Telefon
              </p>
              {phone ? (
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="text-[15px] font-medium text-[var(--color-secondary)] transition-opacity hover:opacity-80"
                >
                  {phone}
                </a>
              ) : (
                <p className="text-[13px] italic text-white/25">
                  Im Dashboard hinterlegen
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              <Mail
                className="h-5 w-5 text-[var(--color-secondary)]/70"
                strokeWidth={1.5}
              />
              <p className="text-[11px] font-medium uppercase tracking-widest text-white/35">
                E-Mail
              </p>
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="text-[15px] font-medium text-[var(--color-secondary)] transition-opacity hover:opacity-80"
                >
                  {email}
                </a>
              ) : (
                <p className="text-[13px] italic text-white/25">
                  Im Dashboard hinterlegen
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              <MapPin
                className="h-5 w-5 text-[var(--color-secondary)]/70"
                strokeWidth={1.5}
              />
              <p className="text-[11px] font-medium uppercase tracking-widest text-white/35">
                Adresse
              </p>
              {address ? (
                <p className="max-w-md whitespace-pre-line text-[13px] leading-relaxed text-white/70">
                  {address}
                </p>
              ) : (
                <p className="text-[13px] italic text-white/25">
                  Im Dashboard hinterlegen
                </p>
              )}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Karte */}
      <section className="relative h-[400px] md:h-[500px] w-full">
        {address ? (
          <iframe
            title="Standort"
            src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.95) contrast(1.1)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-dark-card)] text-white/30 text-sm">
            Karte wird angezeigt, sobald eine Adresse im Dashboard hinterlegt ist.
          </div>
        )}
      </section>

    </div>
  );
}


import { MapPin, Phone, Mail } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { StoreSettings } from "@/types";

export function Location({ settings }: { settings: StoreSettings | null }) {
  const address = settings?.address ?? "";
  const phone = settings?.phone ?? null;
  const email = settings?.email ?? null;

  const mapsSearchUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null;
  const mapsEmbedUrl = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
    : null;

  return (
    <AnimatedSection
      animation="slideUp"
      as="section"
      className="py-20 md:py-28 bg-[var(--color-dark-card)]"
    >
      <div id="kontakt" className="scroll-mt-24" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Besuchen Sie uns" />
        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start">
          <div className="space-y-6">
            {address ? (
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]/10">
                  <MapPin className="h-5 w-5 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
                    Adresse
                  </p>
                  <p className="mt-1 whitespace-pre-line text-white/80">{address}</p>
                </div>
              </div>
            ) : (
              <p className="text-white/50">Keine Adresse hinterlegt.</p>
            )}
            {phone && (
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]/10">
                  <Phone className="h-5 w-5 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
                    Telefon
                  </p>
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="mt-1 block text-white/80 hover:text-white transition-colors"
                  >
                    {phone}
                  </a>
                </div>
              </div>
            )}
            {email && (
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]/10">
                  <Mail className="h-5 w-5 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
                    E-Mail
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-1 block text-white/80 hover:text-white transition-colors"
                  >
                    {email}
                  </a>
                </div>
              </div>
            )}
            {mapsSearchUrl && (
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center rounded-sm bg-[var(--color-secondary)] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-dark)] transition-all hover:brightness-110"
              >
                Route planen
              </a>
            )}
          </div>

          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg min-h-[280px]">
            {mapsEmbedUrl ? (
              <iframe
                src={mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(0.8) invert(0.92) contrast(0.9)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Standort auf Google Maps"
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[var(--color-dark-surface)] text-white/40 text-sm">
                Keine Adresse für Karte hinterlegt.
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

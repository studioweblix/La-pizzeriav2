import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { getPageContent, getSettings, getTenant } from "@/lib/data";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = {
  title: "Kontakt",
  description: "Kontaktieren Sie uns – Wir freuen uns auf Ihre Nachricht.",
};

export default async function KontaktPage() {
  const [page, pageSpeisekarte, settings, tenant] = await Promise.all([
    getPageContent("kontakt"),
    getPageContent("speisekarte"),
    getSettings(),
    getTenant(),
  ]);

  const content = page?.content ?? {};
  const speisekarteContent = pageSpeisekarte?.content ?? {};
  const tenantName = tenant?.name ?? "Restaurant";
  const heroImage =
    typeof content.hero_image === "string"
      ? content.hero_image
      : typeof speisekarteContent.hero_image === "string"
        ? speisekarteContent.hero_image
        : null;
  const description =
    typeof content.description === "string" && content.description.trim()
      ? content.description
      : `${tenantName} ist Ihr Ort für authentische Küche. Genießen Sie traditionelle Spezialitäten in einem einzigartigen historischen Ambiente.`;

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
            className="object-cover"
            sizes="100vw"
            unoptimized={!heroImage.startsWith("/")}
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

      {/* Content: Info links + Formular rechts */}
      <AnimatedSection animation="slideUp" as="section" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:items-start">

            {/* Links: Kontaktinfos */}
            <div>
              <h2
                className="font-heading text-lg font-medium italic text-white/90 md:text-xl"
                style={{ fontFamily: "var(--font-heading), serif" }}
              >
                {tenantName}
              </h2>
              <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/40">
                {description}
              </p>

              <div className="mt-10 space-y-7">
                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-[18px] w-[18px] shrink-0 text-[var(--color-secondary)]/60" strokeWidth={1.5} />
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-white/35">
                      Telefon
                    </p>
                    {phone ? (
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="mt-0.5 block text-[15px] font-medium text-[var(--color-secondary)] transition-opacity hover:opacity-80"
                      >
                        {phone}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-[13px] italic text-white/20">Im Dashboard hinterlegen</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-[18px] w-[18px] shrink-0 text-[var(--color-secondary)]/60" strokeWidth={1.5} />
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-white/35">
                      E-Mail
                    </p>
                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className="mt-0.5 block text-[15px] font-medium text-[var(--color-secondary)] transition-opacity hover:opacity-80"
                      >
                        {email}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-[13px] italic text-white/20">Im Dashboard hinterlegen</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-[18px] w-[18px] shrink-0 text-[var(--color-secondary)]/60" strokeWidth={1.5} />
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-white/35">
                      Adresse
                    </p>
                    {address ? (
                      <p className="mt-0.5 whitespace-pre-line text-[13px] leading-relaxed text-white/70">
                        {address}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[13px] italic text-white/20">Im Dashboard hinterlegen</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Rechts: Kontaktformular */}
            <ContactForm />

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


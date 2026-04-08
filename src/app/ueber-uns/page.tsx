import Image from "next/image";
import { Star, Phone } from "lucide-react";
import { getPageContent, getSettings, getTenant } from "@/lib/data";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export const metadata = {
  title: "Über uns",
  description: "Erfahren Sie mehr über unser Restaurant, unsere Geschichte und unser Team.",
};

function ImageBlock({ src, className, placeholder = false }: { src: string | null; className?: string; placeholder?: boolean }) {
  if (!src && !placeholder) return null;
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-[var(--color-dark-card)] text-white/20 text-xs ${className ?? ""}`}>
        Bild hier einfügen
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Image
        src={src}
        alt=""
        fill
        quality={90}
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  );
}

export default async function UeberUnsPage() {
  const [pageAbout, settings, tenant] = await Promise.all([
    getPageContent("about"),
    getSettings(),
    getTenant(),
  ]);

  const c = pageAbout?.content ?? {};
  const tenantName = tenant?.name ?? "La Pizza";
  const phone = settings?.phone ?? null;
  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : null;

  const heroTitle = typeof c.hero_title === "string" && c.hero_title.trim()
    ? c.hero_title : "Über uns";
  const heroImage = typeof c.hero_image === "string" ? c.hero_image : null;
  const section1Subtitle = typeof c.section1_subtitle === "string"
    ? c.section1_subtitle : "Authentischer Genuss";
  const section1Title = typeof c.section1_title === "string"
    ? c.section1_title : "Tradition in historischem Ambiente";
  const section1Text = typeof c.text === "string" && c.text.trim()
    ? c.text : null;
  const section1Image = typeof c.image === "string" ? c.image : null;

  const section2Image = typeof c.image2 === "string" ? c.image2 : null;

  return (
    <div className="min-h-screen bg-[var(--color-dark)]">

      {/* ── Hero ── */}
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
              {heroTitle}
            </h1>
          </div>
        </div>
      </section>

      {/* ── Sektion 1: Text links, Bild-Collage rechts ── */}
      <AnimatedSection animation="slideUp" as="section" className="py-20 md:py-32 bg-[var(--color-dark)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

            {/* Text */}
            <div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-amber-400 text-amber-400"
                    strokeWidth={1.5}
                  />
                ))}
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
                {section1Subtitle}
              </p>
              <h2
                className="mt-3 font-heading text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-heading), serif" }}
              >
                {section1Title}
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/70 md:text-base">
                {section1Text ? (
                  <p className="whitespace-pre-line">{section1Text}</p>
                ) : (
                  <p className="italic text-white/40">
                    Text hier einfügen (Seite &quot;about&quot;, Feld &quot;text&quot;).
                  </p>
                )}
              </div>

              {telHref && (
                <div className="mt-10 flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[var(--color-secondary)]" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                      Reservierung
                    </p>
                    <a
                      href={telHref}
                      className="block text-xl font-semibold text-[var(--color-secondary)] transition-opacity hover:opacity-80 md:text-2xl"
                      style={{ fontFamily: "var(--font-heading), serif" }}
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Bild-Collage */}
            <div className="relative h-[400px] md:h-[500px]">
              <div className="absolute left-0 bottom-0 w-[48%] overflow-hidden rounded-lg shadow-2xl aspect-[3/4]">
                <ImageBlock src={section1Image} className="h-full w-full" placeholder />
              </div>
              <div className="absolute right-[0%] top-0 w-[44%] overflow-hidden rounded-lg shadow-2xl aspect-[3/4]">
                <ImageBlock src={section2Image} className="h-full w-full" placeholder />
              </div>
            </div>

          </div>
        </div>
      </AnimatedSection>

    </div>
  );
}

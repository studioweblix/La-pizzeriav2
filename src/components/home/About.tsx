import Image from "next/image";
import { Star } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { StoreSettings } from "@/types";

const PLACEHOLDER_TEXT =
  'Hier erscheint Ihre Geschichte. Pflegen Sie den Inhalt in der Datenbank unter der Seite "about".';

interface AboutProps {
  tenantName: string | null;
  title: string | null;
  imageUrl: string | null;
  imageUrl2: string | null;
  text: string | null;
  settings: StoreSettings | null;
}

function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--color-dark-card)] text-white/20 text-xs">
      Kein Bild
    </div>
  );
}

export function About({
  tenantName,
  title,
  imageUrl,
  imageUrl2,
  text,
  settings,
}: AboutProps) {
  const phone = settings?.phone ?? null;
  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : null;
  const displayTitle = title?.trim() || "Erleben Sie Gastfreundschaft";

  return (
    <AnimatedSection
      animation="slideUp"
      as="section"
      className="relative bg-[var(--color-dark)] py-20 md:py-32"
    >
      <div id="about" className="scroll-mt-24" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Links: Text */}
          <div>
            <div
              className="flex gap-0.5 sm:gap-1"
              aria-hidden
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-2.5 w-2.5 shrink-0 fill-[#c9a227] text-[#c9a227] sm:h-3 sm:w-3"
                  strokeWidth={0}
                />
              ))}
            </div>

            {tenantName && (
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
                {tenantName}
              </p>
            )}

            <h2
              className="mt-3 font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-heading), serif" }}
            >
              {displayTitle}
            </h2>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/70 md:text-base">
              {text ? (
                <p className="whitespace-pre-line">{text}</p>
              ) : (
                <p className="italic text-white/40">{PLACEHOLDER_TEXT}</p>
              )}
            </div>

            {telHref && (
              <div className="mt-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Reservierung
                </p>
                <a
                  href={telHref}
                  className="mt-1 block text-2xl font-semibold text-[var(--color-secondary)] transition-opacity hover:opacity-80 md:text-3xl"
                  style={{ fontFamily: "var(--font-heading), serif" }}
                >
                  {phone}
                </a>
              </div>
            )}
          </div>

          {/* Rechts: Bild-Collage (zwei Bilder) */}
          <div className="relative h-[420px] md:h-[520px]">
            <div className="absolute bottom-0 left-0 aspect-[3/4] w-[52%] overflow-hidden rounded-lg shadow-2xl">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 30vw"
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>

            <div className="absolute right-0 top-0 aspect-[3/4] w-[44%] overflow-hidden rounded-lg shadow-2xl">
              {imageUrl2 ? (
                <Image
                  src={imageUrl2}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              ) : imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover object-right"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>

            <div className="absolute bottom-[-12px] left-[3%] -z-10 aspect-[3/4] w-[52%] rounded-lg border border-[var(--color-secondary)]/25" />
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

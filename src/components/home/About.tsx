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
  const displayTitle = title ?? "Erleben Sie Gastfreundschaft";

  return (
    <AnimatedSection
      animation="slideUp"
      as="section"
      className="relative py-20 md:py-32 bg-[var(--color-dark)]"
    >
      <div id="about" className="scroll-mt-24" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

          {/* LEFT – Text */}
          <div>
            {/* 5 Sterne */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-amber-400 text-amber-400"
                  strokeWidth={1.5}
                />
              ))}
            </div>

            {/* Label */}
            {tenantName && (
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
                {tenantName}
              </p>
            )}

            {/* Heading */}
            <h2
              className="mt-3 font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-heading), serif" }}
            >
              {displayTitle}
            </h2>

            {/* Text */}
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/70 md:text-base">
              {text ? (
                <p className="whitespace-pre-line">{text}</p>
              ) : (
                <p className="italic text-white/40">{PLACEHOLDER_TEXT}</p>
              )}
            </div>

            {/* Reservierung + Telefon */}
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

          {/* RIGHT – Bild-Collage */}
          <div className="relative h-[420px] md:h-[520px]">
            {/* Bild 1 – Hauptbild links-unten */}
            <div className="absolute left-0 bottom-0 w-[52%] overflow-hidden rounded-lg shadow-2xl aspect-[3/4]">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 30vw"
                  unoptimized={!imageUrl.startsWith("/")}
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>

            {/* Bild 2 – Akzentbild rechts-oben */}
            <div className="absolute right-0 top-0 w-[44%] overflow-hidden rounded-lg shadow-2xl aspect-[3/4]">
              {imageUrl2 ? (
                <Image
                  src={imageUrl2}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  unoptimized={!imageUrl2.startsWith("/")}
                />
              ) : imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover object-right"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  unoptimized={!imageUrl.startsWith("/")}
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>

            {/* Dekorativer Goldrahmen */}
            <div className="absolute left-[3%] bottom-[-12px] w-[52%] aspect-[3/4] rounded-lg border border-[var(--color-secondary)]/25 -z-10" />
          </div>

        </div>
      </div>
    </AnimatedSection>
  );
}

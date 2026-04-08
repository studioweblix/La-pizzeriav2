import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { HeroScrollIndicator } from "./HeroScrollIndicator";

interface HeroProps {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
  heroCta?: string;
}

export function Hero({
  heroTitle,
  heroSubtitle,
  heroImage,
  heroCta = "Unsere Speisekarte",
}: HeroProps) {
  const titleOneLine = heroTitle.replace(/\s*\n+\s*/g, " ").trim();

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      <div className="absolute inset-0">
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            quality={90}
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[#1a1a1a]" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)]/90 via-black/20 to-black/30" />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div
            className="mb-5 flex justify-center gap-0.5 sm:gap-1"
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

          <p
            className="max-w-2xl text-[11px] font-normal uppercase leading-relaxed tracking-[0.35em] text-white sm:text-xs md:text-sm"
            style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
          >
            {heroSubtitle}
          </p>

          <h1
            className="mt-5 w-full max-w-full px-1 font-heading text-[clamp(1.35rem,calc(0.65rem+4.2vmin),5rem)] font-semibold uppercase leading-[1.05] tracking-[0.02em] text-white whitespace-nowrap"
            style={{ fontFamily: "var(--font-heading), serif" }}
          >
            {titleOneLine}
          </h1>

          <div className="mt-10">
            <Link
              href="/speisekarte"
              className="inline-flex max-w-fit items-center justify-center bg-[color-mix(in_srgb,var(--color-secondary)_72%,#4a3232)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-all hover:bg-[color-mix(in_srgb,var(--color-secondary)_78%,#4a3232)] hover:text-white sm:px-7 sm:text-xs sm:tracking-[0.28em]"
              style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
            >
              {heroCta}
            </Link>
          </div>
        </div>
      </div>

      <HeroScrollIndicator />
    </section>
  );
}

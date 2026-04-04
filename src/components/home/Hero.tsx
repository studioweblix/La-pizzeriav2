import Image from "next/image";
import Link from "next/link";
import { HeroScrollIndicator } from "./HeroScrollIndicator";

interface HeroProps {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroImage: string | null;
}

export function Hero({ heroTitle, heroSubtitle, heroImage }: HeroProps) {
  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      <div className="absolute inset-0">
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
          <div className="absolute inset-0 bg-[#1a1a1a]" />
        )}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark)] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {heroSubtitle && (
              <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-secondary)] md:text-base">
                {heroSubtitle}
              </p>
            )}
            {heroTitle && (
              <h1
                className="mt-3 font-heading text-5xl font-bold leading-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
                style={{ fontFamily: "var(--font-heading), serif" }}
              >
                {heroTitle}
              </h1>
            )}
            <div className="mt-8">
              <Link
                href="/speisekarte"
                className="inline-flex items-center justify-center rounded-sm border border-white/80 px-10 py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-all hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]"
              >
                Unsere Speisekarte
              </Link>
            </div>
          </div>
        </div>
      </div>

      <HeroScrollIndicator />
    </section>
  );
}

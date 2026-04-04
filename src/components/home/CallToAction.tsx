import Link from "next/link";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import type { StoreSettings } from "@/types";

export function CallToAction({ settings }: { settings: StoreSettings | null }) {
  const phone = settings?.phone ?? null;
  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : null;

  return (
    <AnimatedSection animation="fadeIn" as="section" className="py-20 md:py-28 bg-[var(--color-dark)]">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--color-secondary)]">
          Genuss erleben
        </p>
        <h2
          className="mt-4 font-heading text-3xl font-medium tracking-wide text-white md:text-4xl lg:text-5xl"
          style={{ fontFamily: "var(--font-heading), serif" }}
        >
          Haben Sie Appetit bekommen?
        </h2>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-[var(--color-secondary)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
          <span className="h-px w-8 bg-[var(--color-secondary)]" />
        </div>
        <p className="mt-6 text-lg text-white/70">
          Reservieren Sie jetzt Ihren Tisch oder bestellen Sie telefonisch.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {telHref && (
            <a
              href={telHref}
              className="inline-flex items-center justify-center rounded-sm bg-[var(--color-secondary)] px-10 py-4 text-sm font-semibold uppercase tracking-widest text-[var(--color-dark)] transition-all hover:brightness-110"
            >
              Jetzt anrufen
            </a>
          )}
          <Link
            href="/kontakt"
            className="inline-flex items-center justify-center rounded-sm border border-white/30 px-10 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:border-white hover:bg-white/5"
          >
            Kontakt
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );
}

import Image from "next/image";
import Link from "next/link";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

interface InfoCard {
  subtitle: string;
  title: string;
  text: string;
  href: string;
  cta: string;
  imageUrl: string | null;
}

interface InfoCardsProps {
  cards: InfoCard[];
}

function CardImage({ src }: { src: string | null }) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-dark-card)] text-white/20 text-xs">
        Bild hier einfügen
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 50vw"
      unoptimized={!src.startsWith("/")}
    />
  );
}

export function InfoCards({ cards }: InfoCardsProps) {
  if (cards.length === 0) return null;

  return (
    <section className="bg-[var(--color-dark)]">
      {cards.map((card, i) => {
        const imageFirst = i % 2 === 0;

        return (
          <AnimatedSection
            key={card.title}
            animation="fadeIn"
            as="div"
            className="border-t border-white/5"
          >
            <div className="mx-auto max-w-7xl">
              <div
                className={`grid md:grid-cols-2 ${
                  imageFirst ? "" : "md:[direction:rtl]"
                }`}
              >
                {/* Bild */}
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px]">
                  <CardImage src={card.imageUrl} />
                </div>

                {/* Text */}
                <div className="flex flex-col justify-center px-6 py-12 sm:px-10 md:px-14 lg:px-20 md:[direction:ltr]">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)]">
                    {card.subtitle}
                  </p>
                  <h3
                    className="mt-3 font-heading text-2xl font-medium text-white md:text-3xl lg:text-4xl"
                    style={{ fontFamily: "var(--font-heading), serif" }}
                  >
                    {card.title}
                  </h3>
                  <p className="mt-5 text-sm leading-relaxed text-white/65 md:text-base">
                    {card.text}
                  </p>
                  <div className="mt-8">
                    <Link
                      href={card.href}
                      className="inline-flex items-center justify-center rounded-sm border border-[var(--color-secondary)] px-8 py-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-secondary)] transition-colors hover:bg-[var(--color-secondary)] hover:text-[var(--color-dark)]"
                    >
                      {card.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        );
      })}
    </section>
  );
}

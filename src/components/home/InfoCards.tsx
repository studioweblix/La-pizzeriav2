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

/** Abwechselnd: Textflächen unterscheidbar, nahe Referenz (#141414 Seite vs. #1c… / #24… Kacheln) */
const TEXT_PANEL_A = "bg-[#1c1c1c]";
const TEXT_PANEL_B = "bg-[#262626]";

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
      className="object-cover scale-[1.008] transform-gpu"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}

export function InfoCards({ cards }: InfoCardsProps) {
  if (cards.length === 0) return null;

  return (
    <section className="bg-[#111111] px-4 pb-16 sm:px-6 md:pb-24 lg:px-8 lg:pb-28">
      {cards.map((card, i) => {
        const imageFirst = i % 2 === 0;

        const textPanelClass = i % 2 === 0 ? TEXT_PANEL_A : TEXT_PANEL_B;

        return (
          <AnimatedSection key={card.title} animation="fadeIn" as="div">
            <div className="mx-auto w-full max-w-5xl">
              <div
                className={`grid min-w-0 gap-0 overflow-hidden md:grid-cols-2 md:items-stretch ${
                  imageFirst ? "" : "md:[direction:rtl]"
                }`}
              >
                {/* Bild – gleiche Zeilenhöhe wie Text (kein max-h, sonst kürzer als die Textspalte) */}
                <div className="relative min-h-[240px] min-w-0 overflow-hidden aspect-[4/3] md:aspect-auto md:h-full md:min-h-[280px]">
                  <CardImage src={card.imageUrl} />
                </div>

                {/* Text */}
                <div
                  className={`flex min-h-0 min-w-0 flex-col justify-center overflow-hidden px-6 py-12 sm:px-10 md:px-14 lg:px-20 md:h-full md:[direction:ltr] ${textPanelClass}`}
                >
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

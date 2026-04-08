"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Wine,
  Cake,
  Beef,
  Salad,
  Cherry,
  Soup,
  Fish,
  CookingPot,
  Coffee,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatedSection,
  AnimatedStagger,
} from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Category } from "@/types";

const SLUG_ICON_MAP: Record<string, LucideIcon> = {
  vorspeisen: Salad,
  hauptgerichte: Beef,
  beilagen: CookingPot,
  desserts: Cake,
  nachspeisen: Cake,
  getraenke: Coffee,
  weine: Wine,
  cocktails: Wine,
  suppen: Soup,
  fisch: Fish,
  wild: Beef,
  spezialitaeten: Cherry,
};

function iconForSlug(slug: string): LucideIcon {
  const normalized = slug
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");

  for (const [key, icon] of Object.entries(SLUG_ICON_MAP)) {
    if (normalized.includes(key)) return icon;
  }
  return UtensilsCrossed;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

interface HighlightsProps {
  categories: Category[];
  kicker?: string;
  title?: string;
}

export function Highlights({
  categories,
  kicker = "Genussvolle Momente",
  title = "Unsere Highlights",
}: HighlightsProps) {
  if (categories.length === 0) return null;

  return (
    <AnimatedSection
      animation="fadeIn"
      as="section"
      className="py-20 md:py-28 bg-[var(--color-dark)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-[var(--color-secondary)]">
          {kicker}
        </p>
        <SectionHeading title={title} className="mt-3" />

        <AnimatedStagger
          as="div"
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((cat) => {
            const Icon = iconForSlug(cat.slug);
            return (
              <motion.div key={cat.id} variants={cardVariants}>
                <Link
                  href={`/speisekarte#${cat.slug}`}
                  className="group flex flex-col items-center rounded-lg border border-white/10 bg-[var(--color-dark-card)] p-8 text-center transition-all hover:border-[var(--color-secondary)]/40 hover:shadow-lg"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-secondary)]/10 transition-colors group-hover:bg-[var(--color-secondary)]/20">
                    <Icon className="h-7 w-7 text-[var(--color-secondary)]" />
                  </div>
                  <h3
                    className="mt-5 font-heading text-lg font-medium text-white"
                    style={{ fontFamily: "var(--font-heading), serif" }}
                  >
                    {cat.name}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </AnimatedStagger>
      </div>
    </AnimatedSection>
  );
}

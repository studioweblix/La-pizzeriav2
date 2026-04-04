"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatedSection, AnimatedStagger } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Product } from "@/types";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function truncate(str: string | null, max: number) {
  if (!str) return "";
  return str.length <= max ? str : `${str.slice(0, max)}…`;
}

interface FeaturedDishesGridProps {
  products: Product[];
}

export function FeaturedDishesGrid({ products }: FeaturedDishesGridProps) {
  return (
    <AnimatedSection animation="fadeIn" as="section" className="py-20 md:py-28 bg-[var(--color-dark)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Unsere Empfehlungen" />

        <AnimatedStagger
          as="div"
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {products.map((product) => {
            const image = product.images?.[0];
            const displayPrice = product.sale_price ?? product.price;

            return (
              <motion.div
                key={product.id}
                variants={fadeIn}
                className="group relative overflow-hidden rounded-lg bg-[var(--color-dark-card)] transition-all hover:ring-1 hover:ring-[var(--color-secondary)]/40"
              >
                <Link href={`/speisekarte#${product.id}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {image ? (
                      <Image
                        src={image.url}
                        alt={image.alt_text ?? product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        unoptimized={!image.url.startsWith("/")}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[var(--color-dark-surface)] text-white/30 text-sm">
                        Kein Bild
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-lg font-medium text-white">
                        {product.name}
                      </h3>
                      <span className="text-[var(--color-secondary)] font-semibold">
                        {formatPrice(displayPrice)}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {product.vegetarian && <span title="Vegetarisch">🌿</span>}
                      {product.vegan && <span title="Vegan">🌱</span>}
                      {product.spicy && <span title="Scharf">🌶️</span>}
                      {product.sale_price != null && (
                        <span className="ml-auto text-sm text-white/40 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="mt-2 text-sm text-white/60">
                        {truncate(product.description, 80)}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatedStagger>

        <div className="mt-12 text-center">
          <Link
            href="/speisekarte"
            className="inline-flex items-center gap-2 rounded-sm border border-[var(--color-secondary)] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-secondary)] transition-colors hover:bg-[var(--color-secondary)] hover:text-[var(--color-dark)]"
          >
            Zur vollständigen Speisekarte →
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );
}

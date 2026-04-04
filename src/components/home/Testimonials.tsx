"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import type { Testimonial } from "@/types";

const AUTO_SCROLL_MS = 6000;

interface TestimonialsProps {
  testimonials: Testimonial[];
  backgroundImage: string | null;
}

function clampRating(rating: number) {
  return Math.min(5, Math.max(1, Math.round(rating)));
}

function Stars({ rating }: { rating: number }) {
  const n = clampRating(rating);
  return (
    <div className="flex gap-1" aria-label={`${n} von 5 Sternen`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= n
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-white/25"
          }`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function getSourceLabel(source: string): string {
  const s = source.trim().toLowerCase();
  if (s.includes("google")) return "Gästebewertung";
  if (s.includes("facebook")) return "Gästebewertung";
  return "Gästebewertung";
}

export function Testimonials({ testimonials, backgroundImage }: TestimonialsProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const len = testimonials.length;

  const goTo = useCallback(
    (next: number) => setIndex((next + len) % len),
    [len]
  );

  useEffect(() => {
    if (len <= 1 || paused) return;
    const id = setInterval(() => goTo(index + 1), AUTO_SCROLL_MS);
    return () => clearInterval(id);
  }, [index, goTo, len, paused]);

  const item = len > 0 ? testimonials[index] : null;

  return (
    <section
      className="relative min-h-[70vh] flex items-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Hintergrundbild */}
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized={!backgroundImage.startsWith("/")}
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--color-dark-card)]" />
      )}
      <div className="absolute inset-0 bg-black/60" />

      {/* Inhalt */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-20 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
          Kundenstimmen
        </p>
        <h2
          className="mt-3 font-heading text-3xl font-medium text-white md:text-4xl"
          style={{ fontFamily: "var(--font-heading), serif" }}
        >
          Was sagen unsere Gäste?
        </h2>

        {item ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-8"
            >
              <blockquote className="text-base leading-relaxed text-white/85 md:text-lg">
                {item.text}
              </blockquote>

              <div className="mt-6 flex items-center gap-4">
                <Stars rating={item.rating} />
              </div>

              <div className="mt-4">
                <cite className="not-italic text-sm font-semibold text-white">
                  {item.author_name}
                </cite>
                <p className="mt-0.5 text-xs text-white/50">
                  {getSourceLabel(item.source)}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <p className="mt-8 text-sm text-white/40 italic">
            Noch keine Bewertungen vorhanden. Pflegen Sie diese im Dashboard
            (Tabelle: testimonials, featured = true).
          </p>
        )}

        {/* Dots */}
        <div className="mt-10 flex justify-center gap-3">
          {(len > 1 ? testimonials : [0, 1, 2]).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => len > 1 && setIndex(i)}
              aria-label={`Bewertung ${i + 1}`}
              className={`h-3 w-3 rounded-full transition-all ${
                i === (len > 0 ? index : 0)
                  ? "bg-white"
                  : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

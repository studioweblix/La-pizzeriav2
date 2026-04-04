"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function HeroScrollIndicator() {
  return (
    <motion.a
      href="#kontakt"
      aria-label="Nach unten scrollen"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[var(--color-secondary)] hover:text-white transition-colors"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      <span className="text-xs uppercase tracking-widest">Scroll</span>
      <motion.span
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-6 w-6" strokeWidth={1.5} />
      </motion.span>
    </motion.a>
  );
}

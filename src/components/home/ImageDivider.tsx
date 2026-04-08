"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ImageDividerProps {
  imageUrl: string | null;
}

export function ImageDivider({ imageUrl }: ImageDividerProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-35%", "35%"]);

  return (
    <section
      ref={ref}
      className="relative w-full h-[55vh] min-h-[360px] overflow-hidden"
    >
      {imageUrl ? (
        <motion.div className="absolute inset-[-35%]" style={{ y }}>
          <Image
            src={imageUrl}
            alt=""
            fill
            quality={90}
            className="object-cover"
            sizes="100vw"
            
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-[var(--color-dark-card)] flex items-center justify-center text-white/30 text-sm">
          Atmosphären-Bild hier einfügen (Feld: divider_image in Seite &quot;home&quot;)
        </div>
      )}
    </section>
  );
}

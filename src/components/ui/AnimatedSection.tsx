"use client";

import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

const animations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
} satisfies Record<string, Variants>;

type Animation = keyof typeof animations;

interface AnimatedSectionProps {
  children: ReactNode;
  animation?: Animation;
  duration?: number;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "span";
}

export function AnimatedSection({
  children,
  animation = "slideUp",
  duration = 0.6,
  delay = 0,
  className,
  as = "div",
}: AnimatedSectionProps) {
  const Component = motion.create(as);
  const variants = animations[animation];

  return (
    <Component
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </Component>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface AnimatedStaggerProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "ol";
}

export function AnimatedStagger({
  children,
  className,
  as = "div",
}: AnimatedStaggerProps) {
  const Component = motion.create(as);

  return (
    <Component
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </Component>
  );
}

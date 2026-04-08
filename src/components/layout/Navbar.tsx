"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { Tenant } from "@/types";

const navLinks = [
  { href: "/ueber-uns", label: "Über uns", activeFor: "/ueber-uns" },
  { href: "/speisekarte", label: "Speisekarte", activeFor: "/speisekarte" },
  { href: "/reservierung", label: "Reservierung", activeFor: "/reservierung" },
  { href: "/kontakt", label: "Kontakt", activeFor: "/kontakt" },
];

export function Navbar({ tenant }: { tenant: Tenant | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/80 backdrop-blur-md shadow-lg shadow-black/30"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo / Name */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.svg"
              alt="La Pizza"
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-10">
            {navLinks.map(({ href, label, activeFor }) => {
              const isActive = activeFor !== null && activeFor === pathname;
              return (
                <li key={label}>
                  <Link
                    href={href}
                    className={`relative py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                      isActive
                        ? "text-[var(--color-secondary)]"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[var(--color-secondary)]"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile Toggle */}
          <button
            type="button"
            aria-label="Menü öffnen"
            onClick={() => setMobileOpen(true)}
            className="p-2 text-white lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Slide-In */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs bg-[#0d0d0d] shadow-2xl lg:hidden"
            >
              <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
                <img
                  src="/logo.svg"
                  alt="La Pizza"
                  className="h-14 w-auto"
                />
                <button
                  type="button"
                  aria-label="Menü schließen"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <ul className="flex flex-col px-6 py-8 gap-1">
                {navLinks.map(({ href, label, activeFor }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className={`block py-3 text-base font-medium uppercase tracking-widest transition-colors ${
                        activeFor !== null && activeFor === pathname
                          ? "text-[var(--color-secondary)]"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Category } from "@/types";

interface MenuSidebarProps {
  categories: Category[];
  currentCategorySlug: string | null;
}

export function MenuSidebar({
  categories,
  currentCategorySlug,
}: MenuSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  function selectCategory(slug: string) {
    router.push(`${pathname}?category=${slug}`, { scroll: false });
  }

  return (
    <div className="lg:hidden sticky top-20 z-40 border-b border-white/10 bg-[var(--color-dark)]/95 backdrop-blur-md">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {categories.map((cat) => {
          const isActive = currentCategorySlug === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(cat.slug)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                isActive
                  ? "bg-[var(--color-secondary)] text-[var(--color-dark)]"
                  : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

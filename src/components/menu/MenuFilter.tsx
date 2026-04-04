"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Category } from "@/types";

interface MenuFilterProps {
  categories: Category[];
  currentCategorySlug: string | null;
  vegetarian: boolean;
  vegan: boolean;
}

export function MenuFilter({
  categories,
  currentCategorySlug,
  vegetarian,
  vegan,
}: MenuFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  function setParams(updates: {
    category?: string | null;
    vegetarian?: boolean;
    vegan?: boolean;
  }) {
    const params = new URLSearchParams();
    const cat = updates.category !== undefined ? updates.category : currentCategorySlug;
    const veg = updates.vegetarian !== undefined ? updates.vegetarian : vegetarian;
    const v = updates.vegan !== undefined ? updates.vegan : vegan;
    if (cat) params.set("category", cat);
    if (veg) params.set("vegetarian", "true");
    if (v) params.set("vegan", "true");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  return (
    <div className="sticky top-20 z-40 border-b border-white/10 bg-[var(--color-dark)]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setParams({ category: null })}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !currentCategorySlug
                ? "bg-[var(--color-secondary)] text-[var(--color-dark)]"
                : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
            }`}
          >
            Alle
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setParams({ category: cat.slug })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                currentCategorySlug === cat.slug
                  ? "bg-[var(--color-secondary)] text-[var(--color-dark)]"
                  : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-white/20" aria-hidden />
          <button
            type="button"
            onClick={() => setParams({ vegetarian: !vegetarian })}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              vegetarian
                ? "bg-[var(--color-secondary)] text-[var(--color-dark)]"
                : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
            }`}
            title="Vegetarisch"
          >
            <span>🌿</span>
            <span className="hidden sm:inline">Vegetarisch</span>
          </button>
          <button
            type="button"
            onClick={() => setParams({ vegan: !vegan })}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              vegan
                ? "bg-[var(--color-secondary)] text-[var(--color-dark)]"
                : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
            }`}
            title="Vegan"
          >
            <span>🌱</span>
            <span className="hidden sm:inline">Vegan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

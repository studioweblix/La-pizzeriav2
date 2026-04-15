import Image from "next/image";
import { getProducts, getCategories, getTenant, getPageContent } from "@/lib/data";
import { MenuSidebar } from "@/components/menu/MenuSidebar";
import { MenuItem } from "@/components/menu/MenuItem";

/** Immer aktuelle Daten aus Supabase (neue Gerichte ohne Rebuild sichtbar). */
export const dynamic = "force-dynamic";

export default async function SpeisekartePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [products, categories, tenant, page] = await Promise.all([
    getProducts(),
    getCategories(),
    getTenant(),
    getPageContent("speisekarte"),
  ]);

  const content = page?.content ?? {};
  const tenantName = tenant?.name ?? "La Pizza";
  const heroImage =
    typeof content.hero_image === "string" ? content.hero_image : null;

  const params = await searchParams;
  const categorySlug =
    typeof params.category === "string" ? params.category : null;

  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  const activeSlugResolved = categorySlug ?? categories[0]?.slug ?? null;
  const activeCategoryId = activeSlugResolved
    ? categoryBySlug.get(activeSlugResolved)?.id ?? null
    : null;

  /** Ohne Kategorie zugewiesen – erschienen sonst in keiner gefilterten Ansicht. */
  const uncategorized = products.filter((p) => !p.category_id);

  const hasCategoryFilter = activeCategoryId != null;
  const filtered = hasCategoryFilter
    ? products.filter((p) => p.category_id === activeCategoryId)
    : products;

  const showSonstiges = hasCategoryFilter && uncategorized.length > 0;

  const activeSlug = activeSlugResolved;

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            quality={92}
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--color-dark-card)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

        <div className="relative z-10 flex h-full min-h-[70vh] items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
              {tenantName}
            </p>
            <h1
              className="mt-2 font-heading text-4xl font-bold tracking-wide text-white sm:text-5xl md:text-6xl"
              style={{ fontFamily: "var(--font-heading), serif" }}
            >
              Speisekarte
            </h1>
          </div>
        </div>
      </section>

      {/* Sidebar + Content */}
      <div className="min-h-screen bg-[var(--color-dark)]">
        {/* Mobile: horizontale Kategorie-Leiste */}
        <MenuSidebar categories={categories} currentCategorySlug={activeSlug} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="lg:grid lg:grid-cols-[180px_1fr] lg:gap-14">
            {/* Desktop: vertikale Sidebar links */}
            <div className="hidden lg:block">
              <nav className="sticky top-28">
                <ul className="space-y-1">
                  <SidebarLinks categories={categories} activeSlug={activeSlug} />
                </ul>
              </nav>
            </div>

            {/* Gerichte rechts */}
            <div>
              {activeSlug && categoryBySlug.get(activeSlug) && (
                <h2
                  className="font-heading text-xl font-medium tracking-wide text-white/90 md:text-2xl mb-8"
                  style={{ fontFamily: "var(--font-heading), serif" }}
                >
                  {categoryBySlug.get(activeSlug)!.name}
                </h2>
              )}

              <ul className="space-y-4">
                {filtered.map((product) => (
                  <MenuItem key={product.id} product={product} />
                ))}
              </ul>

              {showSonstiges && (
                <>
                  <h3
                    className="font-heading mt-14 text-xl font-medium tracking-wide text-white/90 md:text-2xl mb-8"
                    style={{ fontFamily: "var(--font-heading), serif" }}
                  >
                    Sonstiges
                  </h3>
                  <ul className="space-y-4">
                    {uncategorized.map((product) => (
                      <MenuItem key={product.id} product={product} />
                    ))}
                  </ul>
                </>
              )}

              {filtered.length === 0 && !showSonstiges && (
                <p className="py-12 text-center text-white/50">
                  Keine Gerichte in dieser Kategorie.
                </p>
              )}
              {filtered.length === 0 && showSonstiges && (
                <p className="py-6 text-center text-sm text-white/40">
                  Keine Gerichte in dieser Kategorie – siehe unten unter Sonstiges.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarLinks({
  categories,
  activeSlug,
}: {
  categories: { id: string; slug: string; name: string }[];
  activeSlug: string | null;
}) {
  return (
    <>
      {categories.map((cat) => (
        <li key={cat.id}>
          <a
            href={`?category=${cat.slug}`}
            className={`block py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              activeSlug === cat.slug
                ? "text-[var(--color-secondary)]"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {cat.name}
          </a>
        </li>
      ))}
    </>
  );
}

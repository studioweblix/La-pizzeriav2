# Restaurant-Website Template – StudioWeblix

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Datenbank + Auth/SSR)
- **Framer Motion** (Animationen)
- **Lucide React** (Icons)

---

## WICHTIG – Datenquellen

**Alle Inhalte kommen aus Supabase. Nichts hardcoden.**

| Daten | Funktion in `src/lib/data.ts` |
|-------|--------------------------------|
| Tenant (Name, Farben, Logo, Fonts) | `getTenant()` |
| Kontakt, Öffnungszeiten, Social Media | `getSettings()` |
| Seiteninhalt (Hero, About, etc.) | `getPageContent(slug)` |
| Alle Gerichte | `getProducts()` |
| Empfohlene Gerichte | `getFeaturedProducts()` |
| Gerichte nach Kategorie | `getProductsByCategory(categoryId)` |
| Einzelnes Gericht | `getProductById(id)` |
| Kategorien | `getCategories()` |

- **Alle Queries** filtern nach `NEXT_PUBLIC_TENANT_ID`.
- Keine statischen Texte/Bilder für Inhalte – alles aus DB oder Platzhalter nur bei fehlenden Daten.

---

## Datenbank-Tabellen (bestehend, nicht ändern)

| Tabelle | Relevante Spalten |
|---------|-------------------|
| **tenants** | id, name, domain, logo_url, primary_color, secondary_color, font_heading, font_body |
| **products** | id, tenant_id, name, description, price, sale_price, category_id, in_stock, featured, sort_order, **vegetarian**, **vegan**, **spicy**, **allergens** |
| **product_images** | id, tenant_id, product_id, url, alt_text, sort_order |
| **categories** | id, tenant_id, name, slug, sort_order |
| **pages** | id, tenant_id, slug, title, **content** (JSONB) |
| **store_settings** | id, tenant_id, phone, email, address, **opening_hours** (JSONB), instagram, facebook, tiktok |

---

## Design

- **Stil:** Elegant, warm, einladend.
- **Typo:** Playfair Display (Überschriften), Inter (Fließtext).
- **Sprache:** Alle Texte auf Deutsch.
- **Layout:** Mobile-first, responsive.
- **Bilder:** Immer mit `next/image` (Next.js Image).
- **Animationen:** Dezent mit Framer Motion (z. B. fadeIn, slideUp); `AnimatedSection` / `AnimatedStagger` aus `src/components/ui/AnimatedSection.tsx`.

---

## Umgebungsvariablen

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_TENANT_ID=
NEXT_PUBLIC_SITE_URL=   # optional, für Sitemap/Metadata
```

---

## Projektstruktur (Kern)

```
src/
├── app/              # Routen (page.tsx, layout.tsx, impressum, datenschutz, speisekarte)
├── components/
│   ├── layout/      # Navbar, Footer
│   ├── home/        # Hero, About, FeaturedDishes, OpeningHours, Testimonials, Location, CallToAction
│   ├── menu/        # MenuFilter, MenuItem, MenuCategory
│   └── ui/          # AnimatedSection, AnimatedStagger
├── lib/
│   ├── supabase/    # client.ts, server.ts
│   └── data.ts      # alle Daten-Funktionen
└── types/           # TypeScript-Interfaces (Product, Category, Page, StoreSettings, Tenant, …)
```

import { MenuItem } from "./MenuItem";
import type { Category } from "@/types";
import type { Product } from "@/types";

interface MenuCategoryProps {
  category: Category;
  products: Product[];
}

export function MenuCategory({ category, products }: MenuCategoryProps) {
  if (products.length === 0) return null;

  return (
    <section id={category.slug} className="scroll-mt-28 py-8 first:pt-0">
      <h2
        className="font-heading text-xl font-medium tracking-wide text-white/90 md:text-2xl"
        style={{ fontFamily: "var(--font-heading), serif" }}
      >
        {category.name}
      </h2>
      <ul className="mt-6 space-y-0">
        {products.map((product) => (
          <MenuItem key={product.id} product={product} />
        ))}
      </ul>
    </section>
  );
}

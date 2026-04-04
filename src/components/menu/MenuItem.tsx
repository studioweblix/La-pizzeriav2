import type { Product } from "@/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

interface MenuItemProps {
  product: Product;
}

export function MenuItem({ product }: MenuItemProps) {
  const displayPrice = product.sale_price ?? product.price;

  return (
    <li className="list-none">
      <div
        id={product.id}
        className="scroll-mt-32 rounded-lg border border-white/10 bg-[var(--color-dark-card)] p-5 mb-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-heading text-base font-semibold text-white">
                {product.name}
              </span>
              <div className="flex gap-1 text-sm">
                {product.vegetarian && <span title="Vegetarisch">🌿</span>}
                {product.vegan && <span title="Vegan">🌱</span>}
                {product.spicy && <span title="Scharf">🌶️</span>}
              </div>
            </div>
            {product.description && (
              <p className="mt-1.5 text-sm text-white/50 leading-relaxed">
                {product.description}
              </p>
            )}
            {product.allergens && (
              <p className="mt-1 text-xs italic text-white/30">
                {product.allergens}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <span className="font-medium text-white/80 tabular-nums">
            {formatPrice(displayPrice)}
          </span>
          {product.sale_price != null && (
            <span className="ml-2 text-sm text-white/30 line-through tabular-nums">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

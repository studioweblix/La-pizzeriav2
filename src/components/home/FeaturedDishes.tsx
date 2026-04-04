import { getFeaturedProducts } from "@/lib/data";
import { FeaturedDishesGrid } from "./FeaturedDishesGrid";

export async function FeaturedDishes() {
  const products = await getFeaturedProducts();

  return <FeaturedDishesGrid products={products} />;
}

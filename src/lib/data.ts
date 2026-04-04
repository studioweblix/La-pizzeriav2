import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Page,
  Product,
  ProductImage,
  Reservation,
  StoreSettings,
  Tenant,
  Testimonial,
} from "@/types";

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

function getTenantId(): string {
  if (!TENANT_ID) {
    throw new Error("NEXT_PUBLIC_TENANT_ID is not set");
  }
  return TENANT_ID;
}

function mapProduct(row: {
  product_images?: { id: string; url: string; alt_text: string | null; sort_order: number }[];
  [key: string]: unknown;
}): Product {
  const images: ProductImage[] = (row.product_images ?? []).sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const { product_images: _, ...rest } = row;
  return { ...rest, images } as Product;
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const tenantId = getTenantId();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images (id, url, alt_text, sort_order)
    `
    )
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const tenantId = getTenantId();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images (id, url, alt_text, sort_order)
    `
    )
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? mapProduct(data) : null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const tenantId = getTenantId();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images (id, url, alt_text, sort_order)
    `
    )
    .eq("tenant_id", tenantId)
    .eq("featured", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const tenantId = getTenantId();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getProductsByCategory(
  categoryId: string
): Promise<Product[]> {
  const supabase = await createClient();
  const tenantId = getTenantId();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images (id, url, alt_text, sort_order)
    `
    )
    .eq("tenant_id", tenantId)
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProduct);
}

export async function getPageContent(slug: string): Promise<Page | null> {
  const supabase = await createClient();
  const tenantId = getTenantId();

  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Page | null;
}

export async function getSettings(): Promise<StoreSettings | null> {
  const supabase = await createClient();
  const tenantId = getTenantId();

  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("tenant_id", tenantId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as StoreSettings | null;
}

export async function getTenant(): Promise<Tenant | null> {
  const supabase = await createClient();
  const tenantId = getTenantId();

  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Tenant | null;
}

export async function createReservation(data: {
  name: string;
  email: string;
  phone?: string;
  date: string;
  time: string;
  guests: number;
  message?: string;
}): Promise<Reservation> {
  const supabase = await createClient();
  const tenantId = getTenantId();

  const { data: row, error } = await supabase
    .from("reservations")
    .insert({
      tenant_id: tenantId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      date: data.date,
      time: data.time,
      guests: data.guests,
      message: data.message || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return row as Reservation;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const tenantId = getTenantId();

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("featured", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

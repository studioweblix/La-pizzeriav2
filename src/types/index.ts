export interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category_id: string | null;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
  vegetarian: boolean;
  vegan: boolean;
  spicy: boolean;
  allergens: string | null;
  images: ProductImage[];
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  sort_order: number;
}

export interface Page {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  content: Record<string, unknown>;
}

export interface OpeningHour {
  day: string;
  closed: boolean;
  times: { open: string; close: string }[];
}

export type ReservationType =
  | "built_in"
  | "quandoo"
  | "opentable"
  | "resy"
  | "formitable"
  | "custom";

export interface StoreSettings {
  id: string;
  tenant_id: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  opening_hours: OpeningHour[] | Record<string, unknown> | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  reservation_type: ReservationType | null;
  reservation_external_id: string | null;
  reservation_widget_code: string | null;
}

export interface Reservation {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string | null;
  date: string;
  time: string;
  guests: number;
  message: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  font_heading: string | null;
  font_body: string | null;
}

export interface Testimonial {
  id: string;
  tenant_id: string;
  author_name: string;
  rating: number;
  text: string;
  source: string;
  date: string | null;
  featured: boolean;
  sort_order: number;
}

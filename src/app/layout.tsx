import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { getTenant, getSettings, getPageContent } from "@/lib/data";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  /** Nicht „--font-heading“ nennen – in @theme bauen wir daraus die finale Stack-Variable. */
  variable: "--font-heading-src",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body-src",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [tenant, pageHome] = await Promise.all([
    getTenant(),
    getPageContent("home"),
  ]);
  const title = "La Pizza";
  const content = pageHome?.content ?? {};
  const description =
    (typeof content.hero_subtitle === "string" && content.hero_subtitle.trim())
      ? content.hero_subtitle
      : `${title} – Genuss & Gastlichkeit`;
  const heroImage =
    typeof content.hero_image === "string" ? content.hero_image : null;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      type: "website",
      ...(heroImage && {
        images: [{ url: heroImage, width: 1200, height: 630, alt: title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(heroImage && { images: [heroImage] }),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [tenant, settings] = await Promise.all([getTenant(), getSettings()]);

  return (
    <html lang="de" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased font-body bg-[var(--color-dark)] text-neutral-100">
        <Navbar tenant={tenant} />
        <main className="min-h-screen">{children}</main>
        <Footer tenant={tenant} settings={settings} />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { getTenant, getSettings, getPageContent } from "@/lib/data";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [tenant, pageHome] = await Promise.all([
    getTenant(),
    getPageContent("home"),
  ]);
  const title = tenant?.name ?? "Restaurant";
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
    <html lang="de" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen antialiased font-body bg-[var(--color-dark)] text-neutral-100">
        <Navbar tenant={tenant} />
        <main className="min-h-screen">{children}</main>
        <Footer tenant={tenant} settings={settings} />
      </body>
    </html>
  );
}

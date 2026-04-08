import {
  getPageContent,
  getCategories,
  getSettings,
  getTenant,
  getTestimonials,
} from "@/lib/data";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Highlights } from "@/components/home/Highlights";
import { OpeningHours } from "@/components/home/OpeningHours";
import { Testimonials } from "@/components/home/Testimonials";
import { ImageDivider } from "@/components/home/ImageDivider";
import { InfoCards } from "@/components/home/InfoCards";

function str(val: unknown, fallback: string): string {
  return typeof val === "string" && val.trim() !== "" ? val : fallback;
}

function strOrNull(val: unknown): string | null {
  return typeof val === "string" && val.trim() !== "" ? val : null;
}

export default async function HomePage() {
  const [pageHome, pageAbout, categories, settings, tenant, testimonials] =
    await Promise.all([
      getPageContent("home"),
      getPageContent("about"),
      getCategories(),
      getSettings(),
      getTenant(),
      getTestimonials(),
    ]);

  const h = pageHome?.content ?? {};
  const a = pageAbout?.content ?? {};

  return (
    <>
      <Hero
        heroTitle={str(h.hero_title, "La Pizza Kempten")}
        heroSubtitle={str(
          h.hero_subtitle,
          "PIZZERIA & ITALIANISCHE KÜCHE"
        )}
        heroImage={strOrNull(h.hero_image)}
        heroCta={str(h.hero_cta, "Unsere Speisekarte")}
      />
      <About
        tenantName={tenant?.name ?? null}
        title={strOrNull(a.title)}
        imageUrl={strOrNull(a.image)}
        imageUrl2={strOrNull(a.image2)}
        text={strOrNull(a.text)}
        settings={settings}
      />
      <ImageDivider imageUrl={strOrNull(h.divider_image)} />
      <Highlights
        categories={categories}
        kicker={str(h.highlights_kicker, "Genussvolle Momente")}
        title={str(h.highlights_title, "Unsere Highlights")}
      />
      <OpeningHours
        settings={settings}
        kicker={str(h.hours_kicker, "Herzlich Willkommen")}
        title={str(h.hours_title, "Unsere Öffnungszeiten")}
        intro={str(h.hours_intro, "Wir freuen uns auf Ihren Besuch. Genießen Sie unsere Küche zu den folgenden Zeiten.")}
        boxKicker={str(h.hours_box_kicker, "Für Sie da")}
      />
      <Testimonials
        testimonials={testimonials}
        backgroundImage={strOrNull(h.testimonials_bg) ?? strOrNull(h.divider_image)}
        kicker={str(h.testimonials_kicker, "Kundenstimmen")}
        title={str(h.testimonials_title, "Was sagen unsere Gäste?")}
      />
      <div className="py-10 bg-[var(--color-dark)]" />
      <InfoCards
        cards={[
          {
            subtitle: str(h.infocard_1_subtitle, "Restaurant"),
            title: str(h.infocard_1_title, "Über uns"),
            text: str(h.infocard_1_text, "Erfahren Sie mehr über unsere Geschichte, unsere Leidenschaft für gutes Essen und die Menschen hinter der Küche. Unser erfahrenes Team verwöhnt Sie mit hausgemachten Spezialitäten und persönlicher Betreuung."),
            href: "/ueber-uns",
            cta: str(h.infocard_1_cta, "Mehr dazu"),
            imageUrl: strOrNull(h.infocard_image_1),
          },
          {
            subtitle: str(h.infocard_2_subtitle, "Kulinarik"),
            title: str(h.infocard_2_title, "Unsere Speisekarte"),
            text: str(h.infocard_2_text, "Entdecken Sie unsere vielfältige Speisekarte mit traditionellen Gerichten und saisonalen Spezialitäten. Von herzhaften Vorspeisen über deftige Hauptgerichte bis hin zu verführerischen Desserts — bei uns finden Sie kulinarische Highlights."),
            href: "/speisekarte",
            cta: str(h.infocard_2_cta, "Zur Speisekarte"),
            imageUrl: strOrNull(h.infocard_image_2),
          },
        ]}
      />
    </>
  );
}

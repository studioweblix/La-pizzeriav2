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

  const homeContent = pageHome?.content ?? {};
  const aboutContent = pageAbout?.content ?? {};

  return (
    <>
      <Hero
        heroTitle={
          typeof homeContent.hero_title === "string"
            ? homeContent.hero_title
            : null
        }
        heroSubtitle={
          typeof homeContent.hero_subtitle === "string"
            ? homeContent.hero_subtitle
            : null
        }
        heroImage={
          typeof homeContent.hero_image === "string"
            ? homeContent.hero_image
            : null
        }
      />
      <About
        tenantName={tenant?.name ?? null}
        title={
          typeof aboutContent.title === "string" && aboutContent.title.trim() !== ""
            ? aboutContent.title
            : null
        }
        imageUrl={
          typeof aboutContent.image === "string" ? aboutContent.image : null
        }
        imageUrl2={
          typeof aboutContent.image2 === "string" ? aboutContent.image2 : null
        }
        text={
          typeof aboutContent.text === "string" &&
          aboutContent.text.trim() !== ""
            ? aboutContent.text
            : null
        }
        settings={settings}
      />
      <Highlights categories={categories} />
      <ImageDivider
        imageUrl={
          typeof homeContent.divider_image === "string"
            ? homeContent.divider_image
            : null
        }
      />
      <OpeningHours settings={settings} />
      <ImageDivider
        imageUrl={
          typeof homeContent.divider_image === "string"
            ? homeContent.divider_image
            : null
        }
      />
      <Testimonials
        testimonials={testimonials}
        backgroundImage={
          typeof homeContent.testimonials_bg === "string"
            ? homeContent.testimonials_bg
            : typeof homeContent.divider_image === "string"
              ? homeContent.divider_image
              : null
        }
      />
      <InfoCards
        cards={[
          {
            subtitle: "Restaurant",
            title: "Über uns",
            text: "Erfahren Sie mehr über unsere Geschichte, unsere Leidenschaft für gutes Essen und die Menschen hinter der Küche. Unser erfahrenes Team verwöhnt Sie mit hausgemachten Spezialitäten und persönlicher Betreuung.",
            href: "/ueber-uns",
            cta: "Mehr dazu",
            imageUrl:
              typeof homeContent.infocard_image_1 === "string"
                ? homeContent.infocard_image_1
                : null,
          },
          {
            subtitle: "Kulinarik",
            title: "Unsere Speisekarte",
            text: "Entdecken Sie unsere vielfältige Speisekarte mit traditionellen Gerichten und saisonalen Spezialitäten. Von herzhaften Vorspeisen über deftige Hauptgerichte bis hin zu verführerischen Desserts — bei uns finden Sie kulinarische Highlights.",
            href: "/speisekarte",
            cta: "Zur Speisekarte",
            imageUrl:
              typeof homeContent.infocard_image_2 === "string"
                ? homeContent.infocard_image_2
                : null,
          },
        ]}
      />
    </>
  );
}

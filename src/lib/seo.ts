import type { Metadata } from "next";
import { ogImagePath, ogImages, type OgImageShape } from "@/lib/ogImage";
import { toMetaDescription } from "@/lib/site";
import { ensureSiteSettings } from "@/lib/siteSettings";
import type { HeroPage } from "@/types/SiteSettings";

type ShareMetadataInput = {
  title: string;
  description: string;
  canonical: string;
  /** Rota da imagem comprimida, ja com ?v= (ver ogImagePath). */
  image?: string;
  imageAlt: string;
  shape?: OgImageShape;
  type?: "website" | "article" | "profile";
};

/**
 * Titulo, descricao, canonical, Open Graph e Twitter de uma pagina. O Next
 * substitui o openGraph do layout por inteiro, por isso cada pagina repete o
 * nome do site e o locale.
 */
export async function buildShareMetadata({
  title,
  description,
  canonical,
  image,
  imageAlt,
  shape = "wide",
  type = "website",
}: ShareMetadataInput): Promise<Metadata> {
  const { seo } = await ensureSiteSettings();

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type,
      url: canonical,
      title,
      description,
      siteName: seo.siteName,
      locale: "pt_PT",
      images: ogImages(image, imageAlt, shape),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/** Paginas com destaque (Personalizar > Destaques): titulo, texto e imagem do painel. */
export async function heroPageMetadata(page: HeroPage, canonical: string): Promise<Metadata> {
  const { heroes, seo } = await ensureSiteSettings();
  const hero = heroes.pages[page];

  return buildShareMetadata({
    title: hero.title,
    description: toMetaDescription(hero.description) || seo.description,
    canonical,
    image: ogImagePath(`/og/page/${page}.jpg`, hero.imageUrl),
    imageAlt: hero.title,
  });
}

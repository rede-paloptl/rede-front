import { ogImageResponse } from "@/lib/ogImage";
import { getSharedNews, getSharedOpportunity } from "@/lib/shareContent";
import { ensureSiteSettings } from "@/lib/siteSettings";
import { heroPages, type HeroPage } from "@/types/SiteSettings";

type OgRouteContext = {
  params: Promise<{ slug: string[] }>;
};

/**
 * Imagens de partilha comprimidas (ver lib/ogImage.ts):
 *   /og/site.jpg                  imagem do SEO no painel
 *   /og/page/<pagina>.jpg         destaque de uma pagina (news, about, …)
 *   /og/news/<id>.jpg             imagem de uma noticia
 *   /og/opportunity/<id>.jpg      capa de uma oportunidade
 * A imagem original sai sempre do painel ou do conteudo, nunca do pedido.
 */
export async function GET(request: Request, { params }: OgRouteContext) {
  const { slug } = await params;
  const [kind, file] = slug.length === 1 ? ["site", slug[0]] : slug;
  const id = file?.endsWith(".jpg") && slug.length <= 2 ? decodeURIComponent(file.slice(0, -4)) : "";

  if (!id) return new Response(null, { status: 404 });

  const { seo, heroes, placeholders } = await ensureSiteSettings();

  switch (kind) {
    case "site":
      return id === "site" ? ogImageResponse([seo.shareImageUrl], request.url) : new Response(null, { status: 404 });

    case "page":
      return heroPages.includes(id as HeroPage)
        ? ogImageResponse([heroes.pages[id as HeroPage].imageUrl, seo.shareImageUrl], request.url)
        : new Response(null, { status: 404 });

    case "news": {
      const news = await getSharedNews(id);
      return news ? ogImageResponse([news.imageUrl, placeholders.newsImageUrl], request.url) : new Response(null, { status: 404 });
    }

    case "opportunity": {
      const opportunity = await getSharedOpportunity(id);
      return opportunity
        ? ogImageResponse([opportunity.cover, placeholders.opportunityImageUrl], request.url)
        : new Response(null, { status: 404 });
    }

    default:
      return new Response(null, { status: 404 });
  }
}

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { VisitTracker } from "@/components/VisitTracker";
import { NewsDetails } from "@/components/news/NewsDetails";
import { ogImagePath } from "@/lib/ogImage";
import { buildShareMetadata } from "@/lib/seo";
import { getSharedNews } from "@/lib/shareContent";
import { toMetaDescription } from "@/lib/site";
import { ensureSiteSettings } from "@/lib/siteSettings";

interface NewsDetailsPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

// O conteudo carrega no browser; os metadados (partilha, Google) vem do servidor.
export async function generateMetadata({ searchParams }: NewsDetailsPageProps): Promise<Metadata> {
  const { id } = await searchParams;
  const news = typeof id === "string" ? await getSharedNews(id) : null;

  if (!news) return { title: "Notícia não encontrada", robots: { index: false, follow: true } };

  const { placeholders } = await ensureSiteSettings();
  const encodedId = encodeURIComponent(news.id);

  return buildShareMetadata({
    title: news.title,
    description: toMetaDescription(news.description) || news.title,
    canonical: `/news-details?id=${encodedId}`,
    image: ogImagePath(`/og/news/${encodedId}.jpg`, news.imageUrl || placeholders.newsImageUrl),
    imageAlt: news.title,
    type: "article",
  });
}

export default async function NewsDetailsPage({
  searchParams,
}: NewsDetailsPageProps) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams?.id;

  return (
    <main className="bg-rede-bg">
      {typeof id === "string" && id && <VisitTracker page="news" contentId={id} />}
      <TopBar />
      <NewsDetails id={typeof id === "string" ? id : ""} />
      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { VisitTracker } from "@/components/VisitTracker";
import { OpportunityDetails } from "@/components/opportunities/OpportunityDetails";
import { ogImagePath } from "@/lib/ogImage";
import { buildShareMetadata } from "@/lib/seo";
import { getSharedOpportunity } from "@/lib/shareContent";
import { toMetaDescription } from "@/lib/site";
import { ensureSiteSettings } from "@/lib/siteSettings";

interface OpportunityDetailsPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

// O conteudo carrega no browser; os metadados (partilha, Google) vem do servidor.
export async function generateMetadata({ searchParams }: OpportunityDetailsPageProps): Promise<Metadata> {
  const { id } = await searchParams;
  const opportunity = typeof id === "string" ? await getSharedOpportunity(id) : null;

  if (!opportunity) return { title: "Oportunidade não encontrada", robots: { index: false, follow: true } };

  const { placeholders } = await ensureSiteSettings();
  const encodedId = encodeURIComponent(opportunity.id);

  return buildShareMetadata({
    title: opportunity.title,
    description: toMetaDescription(opportunity.description) || opportunity.title,
    canonical: `/opportunity-details?id=${encodedId}`,
    image: ogImagePath(`/og/opportunity/${encodedId}.jpg`, opportunity.cover || placeholders.opportunityImageUrl),
    imageAlt: opportunity.title,
    type: "article",
  });
}

export default async function OpportunityDetailsPage({
  searchParams,
}: OpportunityDetailsPageProps) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams?.id;

  return (
    <main className="bg-rede-bg">
      {typeof id === "string" && id && <VisitTracker page="opportunity" contentId={id} />}
      <TopBar />
      <OpportunityDetails id={typeof id === "string" ? id : ""} />
      <Footer />
    </main>
  );
}

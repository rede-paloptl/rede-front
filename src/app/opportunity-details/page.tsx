import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { OpportunityDetails } from "@/components/opportunities/OpportunityDetails";

interface OpportunityDetailsPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function OpportunityDetailsPage({
  searchParams,
}: OpportunityDetailsPageProps) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams?.id;

  return (
    <main className="bg-rede-bg">
      <TopBar />
      <OpportunityDetails id={typeof id === "string" ? id : ""} />
      <Footer />
    </main>
  );
}

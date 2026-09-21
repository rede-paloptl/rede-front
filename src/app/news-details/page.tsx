import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { NewsDetails } from "@/components/news/NewsDetails";

interface NewsDetailsPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function NewsDetailsPage({
  searchParams,
}: NewsDetailsPageProps) {
  const resolvedSearchParams = await searchParams;
  const id = resolvedSearchParams?.id;

  return (
    <main className="bg-rede-bg">
      <TopBar />
      <NewsDetails id={typeof id === "string" ? id : ""} />
      <Footer />
    </main>
  );
}

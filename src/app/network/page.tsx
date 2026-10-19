import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { AdvancedSearch } from "@/components/network/AdvancedSearch";
import PalopMapSection from "@/components/network/MapSection";
import { ogImagePath } from "@/lib/ogImage";
import { buildShareMetadata } from "@/lib/seo";
import { ensureSiteSettings } from "@/lib/siteSettings";

// Sem destaque no painel: usa a imagem de partilha do site.
export async function generateMetadata() {
  const { seo } = await ensureSiteSettings();

  return buildShareMetadata({
    title: "REDE de profissionais",
    description: "Encontra profissionais, empresas, festivais e instituições do cinema e audiovisual dos PALOP e Timor-Leste.",
    canonical: "/network",
    image: ogImagePath("/og/site.jpg", seo.shareImageUrl),
    imageAlt: seo.siteName,
  });
}

export default function NetworkPage() {
  return (
    <main className="bg-rede-bg">
      <TopBar />
      <PalopMapSection/>
      <AdvancedSearch />
      <Footer />
    </main>
  )
}
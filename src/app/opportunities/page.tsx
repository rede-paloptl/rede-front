import { heroPageMetadata } from "@/lib/seo";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Opportunities } from "@/components/opportunities/Opportunities";


// Titulo, texto e imagem do destaque (Personalizar > Destaques das paginas).
export const generateMetadata = () => heroPageMetadata("opportunities", "/opportunities");

export default function OpportunitiesPage() {
  return (
    <main className="bg-rede-bg">
      <TopBar />
      <Hero page="opportunities" />
      <Opportunities />
      <Footer />
    </main>
  )
}
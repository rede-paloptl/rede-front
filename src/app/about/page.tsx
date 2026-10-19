import { heroPageMetadata } from "@/lib/seo";
import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/about/About";
import { TeamSection } from "@/components/about/TeamSection";
import { ProjectSection } from "@/components/about/ProjectSection";
import { ObjectivesSection } from "@/components/about/ObjectivesSection";
import { GovernanceFrameworkSection } from "@/components/about/GovernanceFrameworkSection";
import { CommunicationAndVisibilityStrategy } from "@/components/about/CommunicationAndVisibilityStrategy";


// Titulo, texto e imagem do destaque (Personalizar > Destaques das paginas).
export const generateMetadata = () => heroPageMetadata("about", "/about");

export default function AboutPage() {
  return (
    <main className="bg-rede-bg">
      <TopBar />
      <Hero page="about" />
      <About />
      <TeamSection />
      <ProjectSection />
      <ObjectivesSection />
      <GovernanceFrameworkSection />
      <CommunicationAndVisibilityStrategy />
      <Footer />
    </main>
  )
}
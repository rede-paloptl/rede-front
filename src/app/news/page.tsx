import { heroPageMetadata } from "@/lib/seo";
import { Hero } from "@/components/Hero";

import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { NewsFilter } from "@/components/news/NewsFilter";


// Titulo, texto e imagem do destaque (Personalizar > Destaques das paginas).
export const generateMetadata = () => heroPageMetadata("news", "/news");

export default function NewsPage() {
  return (
    <main className="bg-rede-bg">
      <TopBar />
      <Hero page="news" />
      <NewsFilter />
      <Footer />
    </main>
  )
}
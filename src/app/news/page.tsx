import { Hero } from "@/components/Hero";

import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { NewsFilter } from "@/components/news/NewsFilter";


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
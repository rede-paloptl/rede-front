import { heroPageMetadata } from "@/lib/seo";
import Footer from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { SectionNewsletters } from "@/components/newsletter/SectionNewsletters";
import { TopBar } from "@/components/TopBar";


// Titulo, texto e imagem do destaque (Personalizar > Destaques das paginas).
export const generateMetadata = () => heroPageMetadata("newsletter", "/newsletter");

export default function NewsletterPage() {
    return (
        <main className="bg-rede-bg">
            <TopBar />
            <Hero page="newsletter" />
            <SectionNewsletters />
            <Footer />
        </main>
    )
}
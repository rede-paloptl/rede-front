import Footer from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { SectionNewsletters } from "@/components/newsletter/SectionNewsletters";
import { TopBar } from "@/components/TopBar";


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
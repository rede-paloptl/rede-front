import { heroPageMetadata } from "@/lib/seo";
import { Hero } from "@/components/Hero";
import { WhatItComprises } from "@/components/film-commission/WhatItComprises";
import { ScreenCommission } from "@/components/film-commission/ScreenCommission";
import { LegislativeInternship } from "@/components/film-commission/LegislativeInternship";
import { RecommendationTypologies } from "@/components/film-commission/RecommendationTypologies";
import { PartiallyOverlappingPhases } from "@/components/film-commission/PartiallyOverlappingPhases";
import Footer from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { WhatWeAreDoing } from "@/components/film-commission/WhatWeAreDoing";
import { WhereWeAre } from "@/components/film-commission/WhereWeAre";
import { GoForWork } from "@/components/film-commission/GoForWork";

// Titulo, texto e imagem do destaque (Personalizar > Destaques das paginas).
export const generateMetadata = () => heroPageMetadata("film-commission", "/film-commission");

export default function FilmCommissionPage() {
    return (
        <main className="bg-rede-bg">
            <TopBar />
            <Hero page="film-commission" />
            <WhatWeAreDoing />
            <WhereWeAre />
            <WhatItComprises />
            <RecommendationTypologies />
            <ScreenCommission />
            <PartiallyOverlappingPhases />
            <GoForWork/>
            <Footer variant="yellow" />
        </main>
    )
}
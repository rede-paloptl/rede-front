import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { VisitTracker } from "@/components/VisitTracker";
import { Hero } from "../components/home/Hero";
import { Join } from "../components/home/Join";
import { News } from "../components/home/News";
import { Partners } from "../components/home/Partners";
import { Opportunities } from "../components/home/Opportunities";
import { Newsletter } from "@/components/home/Newsletter";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="bg-rede-bg">
      <VisitTracker page="home" />
      <TopBar/>
      <Hero />
      <Join/>
      <News />
      {/* <WorkShops/> */}
      <Opportunities/>
      <Newsletter/>
      <Partners/>
      <Footer/>
    </main>
  );
}
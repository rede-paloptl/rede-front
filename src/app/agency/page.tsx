import { Hero } from "@/components/Hero";
import { FilmsSection } from "@/components/agency/Films";
import { Packages } from "@/components/agency/Packages";
import { Licensing } from "@/components/agency/Licensing";

import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";

export default function AgencyPage() {
  return (
    <main className="bg-rede-bg">
      <TopBar />
      <Hero page="agency" />
      <FilmsSection />
      <Packages />
      <Licensing />
      <Footer variant="red" />
    </main>
  )
}
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { TopBar } from "@/components/TopBar";
import { SessionHistory } from "@/components/history/SessionHistory";

export const metadata: Metadata = {
  title: "Histórico de sessões",
  robots: { index: false, follow: false },
};

export default function SessionHistoryPage() {
  return (
    <main className="min-h-dvh bg-rede-bg">
      <TopBar />
      <SessionHistory />
      <Footer />
    </main>
  );
}

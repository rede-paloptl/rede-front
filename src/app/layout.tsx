import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ogImagePath, ogImages } from "@/lib/ogImage";
import { SITE_URL } from "@/lib/site";
import { ensureTaxonomy } from "@/lib/taxonomy";
import { ensureSiteSettings } from "@/lib/siteSettings";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins", // 1. Adicione esta linha
});

// Nome e descrição geridos no painel (Personalizar > SEO).
export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await ensureSiteSettings();
  // Imagem comprimida (app/og): vale para a home e paginas sem imagem propria.
  const shareImage = ogImagePath("/og/site.jpg", seo.shareImageUrl);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.siteName,
      template: `%s | ${seo.siteName}`,
    },
    description: seo.description,
    applicationName: seo.siteName,
    openGraph: {
      type: "website",
      siteName: seo.siteName,
      locale: "pt_PT",
      images: ogImages(shareImage, seo.siteName),
    },
    twitter: {
      card: "summary_large_image",
      images: shareImage ? [shareImage] : undefined,
    },
    ...(seo.googleSiteVerification ? { verification: { google: seo.googleSiteVerification } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Listas de opções (Configurações do painel) e personalização do site
  // (Personalizar), partilhadas com o browser.
  const [taxonomy, siteSettings] = await Promise.all([ensureTaxonomy(), ensureSiteSettings()]);

  return (
    // 2. Injete a variável na tag html
    <html lang="pt" className={`${poppins.variable} h-full antialiased`}>
      {/* 3. Mantenha a classe no body */}
      <body className={`${poppins.className} bg-background text-foreground antialiased`}>
        <Providers taxonomyTerms={taxonomy.terms} siteSettings={siteSettings}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

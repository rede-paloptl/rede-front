import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Paginas privadas ou de fluxo de conta: nao tem valor nos resultados.
      disallow: ["/api/", "/profile", "/historico", "/onboarding", "/confirm-account", "/reset-password", "/login", "/signup"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

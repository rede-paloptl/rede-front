"use client";

import { api } from "@/lib/api";

export type TrackVisitPayload =
  | { page: "home" }
  | { page: "profile"; username: string }
  | { page: "news" | "opportunity"; contentId: string };

/**
 * Conta uma visita publica. Vai directamente do browser para a API, para o
 * servidor ver o IP e a localizacao reais de quem visita. Nunca lanca.
 */
export const trackVisit = async (payload: TrackVisitPayload) => {
  try {
    const referrer = typeof document !== "undefined" ? document.referrer : "";

    await api.post("/api/v1/analytics/visits", {
      ...payload,
      referrer: referrer || undefined,
    }, { timeout: 5000 });
  } catch {
    // A contagem e secundaria: uma falha nunca pode afectar a pagina.
  }
};

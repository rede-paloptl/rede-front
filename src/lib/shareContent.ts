import { cache } from "react";
import { getServerApiBaseUrl } from "@/lib/serverApi";

/**
 * Noticias e oportunidades lidas no servidor, so para metadados (titulo,
 * descricao, imagem) e sitemap. As paginas de detalhe continuam a carregar o
 * conteudo no browser.
 */

/** Segundos durante os quais um conteudo pode vir da cache. */
const SHARE_CONTENT_REVALIDATE_SECONDS = 300;

export type SharedNews = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  publishedAt?: string;
};

export type SharedOpportunity = {
  id: string;
  title: string;
  description?: string;
  cover?: string;
};

const getJson = async <T>(path: string): Promise<T | null> => {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}${path}`, {
      next: { revalidate: SHARE_CONTENT_REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });

    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
};

export const getSharedNews = cache(async (id: string) =>
  id ? (await getJson<{ news?: SharedNews }>(`/api/v1/news/${encodeURIComponent(id)}`))?.news ?? null : null,
);

export const getSharedOpportunity = cache(async (id: string) =>
  id
    ? (await getJson<{ opportunity?: SharedOpportunity }>(`/api/v1/opportunities/${encodeURIComponent(id)}`))?.opportunity ?? null
    : null,
);

export const listSharedNews = async () => (await getJson<{ news?: SharedNews[] }>("/api/v1/news"))?.news ?? [];

export const listSharedOpportunities = async () =>
  (await getJson<{ opportunities?: SharedOpportunity[] }>("/api/v1/opportunities"))?.opportunities ?? [];

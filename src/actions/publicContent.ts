"use client";

import { api } from "@/lib/api";

/**
 * Resultado de uma leitura publica (noticias, oportunidades, newsletter).
 * Nunca lanca: o componente decide que estado mostrar.
 */
export type PublicContentResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
  /** A API respondeu 404: o conteudo nao existe ou nao esta publicado. */
  notFound?: boolean;
};

type ApiError = {
  response?: {
    status?: number;
    data?: {
      error?: string;
      message?: string;
    };
  };
};

const getApiError = (err: unknown): ApiError => {
  return typeof err === "object" && err !== null ? err as ApiError : {};
};

/**
 * So usa as rotas publicas da API, que ja devolvem apenas conteudo publicado.
 * Nenhuma rota /admin e chamada a partir do site.
 */
export async function getPublicContent<R, T>(
  path: string,
  select: (response: R) => T,
  fallbackMessage: string,
): Promise<PublicContentResponse<T>> {
  try {
    const response = await api.get<R>(path);

    return { data: select(response.data) };
  } catch (err: unknown) {
    const apiError = getApiError(err);

    return {
      error: apiError.response?.data?.error || "Erro desconhecido",
      message: apiError.response?.data?.message || fallbackMessage,
      notFound: apiError.response?.status === 404,
    };
  }
}

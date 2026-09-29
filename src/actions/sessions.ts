"use client";

import { api } from "@/lib/api";

export type SessionStatus = "active" | "ended" | "expired";

export type SessionMethod = "password" | "google" | "confirmation";

export type UserSession = {
  id: string;
  method: SessionMethod;
  ip: string | null;
  os: string;
  browser: string;
  device: "desktop" | "mobile" | "tablet" | "bot" | "unknown";
  location: {
    countryCode: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
  };
  startedAt: string;
  expiresAt: string;
  endedAt: string | null;
  finishedAt: string | null;
  status: SessionStatus;
  isCurrent: boolean;
};

export type GetSessionsResponseType = {
  error?: string;
  message?: string;
  unauthorized?: boolean;
  data?: {
    sessions: UserSession[];
    page: number;
    limit: number;
    total: number;
  };
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

const getApiError = (err: unknown): ApiError =>
  typeof err === "object" && err !== null ? err as ApiError : {};

export const getSessionHistory = async (page = 1, limit = 20): Promise<GetSessionsResponseType> => {
  try {
    const response = await api.get<NonNullable<GetSessionsResponseType["data"]>>("/api/v1/sessions", {
      params: { page, limit },
    });

    return { data: response.data };
  } catch (err: unknown) {
    const apiError = getApiError(err);
    const status = apiError.response?.status;

    return {
      unauthorized: status === 401 || status === 403,
      error: apiError.response?.data?.error || "Erro desconhecido",
      message: apiError.response?.data?.message || "Não foi possível carregar o histórico de sessões.",
    };
  }
};

/**
 * Grava no servidor o fim da sessao actual. Nunca lanca: o logout local
 * acontece sempre, mesmo sem rede ou com o token ja expirado.
 */
export const endCurrentSession = async () => {
  try {
    await api.post("/api/v1/auth/logout", {}, { timeout: 5000 });
  } catch {
    // Sem registo do fim: o historico mostra a sessao como expirada mais tarde.
  }
};

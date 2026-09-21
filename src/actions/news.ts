"use client";

import type { NewsType } from "@/components/news/data";

import { getPublicContent } from "./publicContent";

/** Noticias publicadas, das mais recentes para as mais antigas. */
export const getPublishedNews = () =>
  getPublicContent<{ news?: NewsType[] }, NewsType[]>(
    "/api/v1/news",
    (response) => response.news ?? [],
    "Não foi possível carregar as notícias.",
  );

export const getPublishedNewsById = (id: string) =>
  getPublicContent<{ news: NewsType }, NewsType>(
    `/api/v1/news/${encodeURIComponent(id)}`,
    (response) => response.news,
    "Não foi possível carregar a notícia.",
  );

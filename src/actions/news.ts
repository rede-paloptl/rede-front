"use client";

import type { NewsType } from "@/components/news/data";
import { toContentCategoryValue, toContentThemeLabels, toCountryId } from "@/components/news/categories";

import { getPublicContent } from "./publicContent";

// A API grava ids das listas (Configurações). O site filtra os países por id
// e a categoria/temas pelo nome, por isso cada notícia é convertida aqui.
const toSiteNews = (news: NewsType): NewsType => ({
  ...news,
  category: toContentCategoryValue(news.category),
  countries: (news.countries ?? []).map(toCountryId),
  themes: toContentThemeLabels(news.themes),
});

/** Noticias publicadas, das mais recentes para as mais antigas. */
export const getPublishedNews = () =>
  getPublicContent<{ news?: NewsType[] }, NewsType[]>(
    "/api/v1/news",
    (response) => (response.news ?? []).map(toSiteNews),
    "Não foi possível carregar as notícias.",
  );

export const getPublishedNewsById = (id: string) =>
  getPublicContent<{ news: NewsType }, NewsType>(
    `/api/v1/news/${encodeURIComponent(id)}`,
    (response) => toSiteNews(response.news),
    "Não foi possível carregar a notícia.",
  );

"use client";

import { useMemo } from "react";

import { getPublishedNews, getPublishedNewsById } from "@/actions/news";
import { Hero } from "@/components/Hero";
import { usePublicContent } from "@/hooks/usePublicContent";

import { ContentState } from "../ContentState";
import { getSimilarNews } from "./actions";
import { SectionViewNews } from "./SectionViewNews";
import { SimilarNews } from "./SimilarNews";

export const NewsDetails: React.FC<{ id: string }> = ({ id }) => {
  const selected = usePublicContent(() => getPublishedNewsById(id), id);
  const all = usePublicContent(getPublishedNews);

  const similarNews = useMemo(
    () => (selected.data && all.data ? getSimilarNews(selected.data, all.data, 3) : []),
    [selected.data, all.data],
  );

  if (!id || selected.notFound) {
    return (
      <>
        <Hero />
        <ContentState variant="empty" message="Esta notícia não existe ou já não está publicada." className="min-h-80 text-rede-white" />
      </>
    );
  }

  if (selected.isLoading) {
    return <ContentState variant="loading" message="A carregar notícia…" className="min-h-[calc(100vh-65px)] pt-17 text-rede-white" />;
  }

  if (selected.error || !selected.data) {
    return (
      <ContentState
        variant="error"
        message={selected.error ?? "Não foi possível carregar a notícia."}
        onRetry={selected.retry}
        className="min-h-[calc(100vh-65px)] pt-17"
      />
    );
  }

  return (
    <>
      <Hero imageUrl={selected.data.imageUrl} />
      <SectionViewNews selectedNews={selected.data} />
      {/* As relacionadas são secundárias: se falharem, a notícia continua visível. */}
      {!all.isLoading && !all.error && <SimilarNews similarNews={similarNews} />}
    </>
  );
};

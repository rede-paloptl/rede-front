"use client";

import { useMemo } from "react";

import { getPublishedOpportunities, getPublishedOpportunityById } from "@/actions/opportunities";
import { Hero } from "@/components/Hero";
import { usePublicContent } from "@/hooks/usePublicContent";

import { ContentState } from "../ContentState";
import { getSimilarOpportunities } from "./actions";
import { SectionViewOpportunity } from "./SectionViewOpportunity";
import { SimilarOpportunities } from "./SimilarOpportunities";

export const OpportunityDetails: React.FC<{ id: string }> = ({ id }) => {
  const selected = usePublicContent(() => getPublishedOpportunityById(id), id);
  const all = usePublicContent(getPublishedOpportunities);

  const similarOpportunities = useMemo(
    () => (selected.data && all.data ? getSimilarOpportunities(selected.data, all.data, 3) : []),
    [selected.data, all.data],
  );

  if (!id || selected.notFound) {
    return (
      <>
        <Hero />
        <ContentState variant="empty" message="Esta oportunidade não existe ou já não está disponível." className="min-h-80 text-rede-white" />
      </>
    );
  }

  if (selected.isLoading) {
    return <ContentState variant="loading" message="A carregar oportunidade…" className="min-h-[calc(100vh-65px)] pt-17 text-rede-white" />;
  }

  if (selected.error || !selected.data) {
    return (
      <ContentState
        variant="error"
        message={selected.error ?? "Não foi possível carregar a oportunidade."}
        onRetry={selected.retry}
        className="min-h-[calc(100vh-65px)] pt-17"
      />
    );
  }

  return (
    <>
      <Hero imageUrl={selected.data.cover} />
      <SectionViewOpportunity selectedOpportunity={selected.data} />
      {/* As relacionadas são secundárias: se falharem, a oportunidade continua visível. */}
      {!all.isLoading && !all.error && <SimilarOpportunities similarOpportunities={similarOpportunities} />}
    </>
  );
};

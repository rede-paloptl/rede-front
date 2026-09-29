"use client";

import type { OpportunityType } from "@/components/OpportunityCard";
import { toContentThemeLabels, toCountryId, toCountryLabel } from "@/components/news/categories";
import { getTaxonomy } from "@/lib/taxonomy";

import { getPublicContent } from "./publicContent";

// A API grava ids das listas (Configurações). O site mostra e filtra o tipo,
// a elegibilidade e os temas pelo nome, e o país principal pelo id (como a
// lista de países dos filtros), por isso cada oportunidade é convertida aqui.
const toSiteOpportunity = (opportunity: OpportunityType): OpportunityType => ({
  ...opportunity,
  type: getTaxonomy().label(opportunity.type, ["opportunity-type"]),
  eligibility: (opportunity.eligibility ?? []).map(toCountryLabel),
  themes: toContentThemeLabels(opportunity.themes),
  country: toCountryId(opportunity.country),
});

/** Oportunidades visiveis no site. */
export const getPublishedOpportunities = () =>
  getPublicContent<{ opportunities?: OpportunityType[] }, OpportunityType[]>(
    "/api/v1/opportunities",
    (response) => (response.opportunities ?? []).map(toSiteOpportunity),
    "Não foi possível carregar as oportunidades.",
  );

export const getPublishedOpportunityById = (id: string) =>
  getPublicContent<{ opportunity: OpportunityType }, OpportunityType>(
    `/api/v1/opportunities/${encodeURIComponent(id)}`,
    (response) => toSiteOpportunity(response.opportunity),
    "Não foi possível carregar a oportunidade.",
  );

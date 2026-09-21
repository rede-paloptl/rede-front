"use client";

import type { OpportunityType } from "@/components/OpportunityCard";

import { getPublicContent } from "./publicContent";

/** Oportunidades visiveis no site. */
export const getPublishedOpportunities = () =>
  getPublicContent<{ opportunities?: OpportunityType[] }, OpportunityType[]>(
    "/api/v1/opportunities",
    (response) => response.opportunities ?? [],
    "Não foi possível carregar as oportunidades.",
  );

export const getPublishedOpportunityById = (id: string) =>
  getPublicContent<{ opportunity: OpportunityType }, OpportunityType>(
    `/api/v1/opportunities/${encodeURIComponent(id)}`,
    (response) => response.opportunity,
    "Não foi possível carregar a oportunidade.",
  );

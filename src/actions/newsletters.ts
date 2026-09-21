"use client";

import type { NewsletterType } from "@/components/NewsletterCard";

import { getPublicContent } from "./publicContent";

/** Edicoes publicadas da newsletter, das mais recentes para as mais antigas. */
export const getPublishedNewsletters = () =>
  getPublicContent<{ editions?: NewsletterType[] }, NewsletterType[]>(
    "/api/v1/newsletters",
    (response) => response.editions ?? [],
    "Não foi possível carregar as newsletters.",
  );

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { customBlur } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";

import { getPublishedOpportunities } from "@/actions/opportunities";
import { usePublicContent } from "@/hooks/usePublicContent";

import { ContentState } from "../ContentState";
import { OpportunityCard } from "../OpportunityCard";

// A home mostra só as três primeiras; a lista completa está em /opportunities.
const HOME_OPPORTUNITIES_LIMIT = 3;

export const Opportunities: React.FC = () => {
  const { data: opportunities, isLoading, error, retry } = usePublicContent(getPublishedOpportunities);

  return (
    <section className="w-full bg-rede-white">
      <div className="mx-auto flex w-full max-w-360 flex-col px-4 pt-16 pb-14 sm:px-6 sm:pt-20 sm:pb-16 lg:px-8 lg:pt-28 lg:pb-24">
        <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Heading
            className={`${customBlur.className} break-words text-5xl leading-none font-medium text-rede-surface sm:text-7xl md:text-8xl lg:text-[96px]`}
          >
            Oportunidades
          </Heading>

          <Link href="/opportunities" className="w-full shrink-0 sm:w-auto">
            <Button
              icon={
                <ArrowRight
                  aria-hidden="true"
                  className="h-3 w-3"
                />
              }
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              Ver todas
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {isLoading ? (
            <ContentState variant="loading" message="A carregar oportunidades…" className="text-rede-surface" />
          ) : error ? (
            <ContentState variant="error" message={error} onRetry={retry} />
          ) : !opportunities || opportunities.length === 0 ? (
            <ContentState variant="empty" message="Ainda não há oportunidades publicadas." className="text-rede-surface" />
          ) : (
            opportunities.slice(0, HOME_OPPORTUNITIES_LIMIT).map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunityData={opportunity}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};
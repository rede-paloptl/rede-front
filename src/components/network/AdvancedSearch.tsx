"use client";

import { useMemo } from "react";

import { customBlur } from "@/app/fonts";

import { ProfileCard } from "../ProfileCard";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { FilterSidebar } from "./FilterSidebar";
import { countProfilesByType, filterProfiles } from "./actions";
import { useNetworkFilters } from "./useNetworkFilters";
import { useNetworkProfiles } from "./useNetworkProfiles";

export const AdvancedSearch: React.FC = () => {
  // Os filtros vem do URL e a lista de perfis da cache partilhada com o mapa,
  // por isso as duas metades da pagina mostram sempre o mesmo.
  const { filters, setFilters, clearFilters } = useNetworkFilters();
  const { profiles, status } = useNetworkProfiles();

  const results = useMemo(
    () => filterProfiles(profiles, filters),
    [filters, profiles],
  );

  // Sem perfis carregados nao ha contagens: um zero seria lido como "nao ha
  // ninguem deste tipo".
  const typeCounts = useMemo(
    () =>
      status === "ready" ? countProfilesByType(profiles, filters) : undefined,
    [filters, profiles, status],
  );

  return (
    <section className="h-auto w-full">
      <div className="mx-auto h-auto w-full max-w-360">
        <div className="mt-5 flex items-end justify-between gap-4 px-4 sm:items-center sm:px-6 lg:px-0">
          <Heading
            level="h2"
            className={`${customBlur.className} mb-5 text-[40px] leading-[0.95] font-medium text-rede-yellow sm:ml-3 sm:text-[48px] sm:leading-11.5`}
          >
            Pesquisa
            <br />
            avançada
          </Heading>

          <div className="flex shrink-0 justify-end pb-5 sm:px-6 sm:py-4">
            <Text
              aria-live="polite"
              className="text-right text-sm leading-4"
            >
              {results.length}{" "}
              {results.length === 1 ? "resultado" : "resultados"}
            </Text>
          </div>
        </div>

        <div className="mt-6 flex w-full flex-col lg:mt-10 lg:flex-row">
          <div className="w-full shrink-0 px-4 sm:px-6 lg:w-auto lg:px-0">
            <FilterSidebar
              filters={filters}
              typeCounts={typeCounts}
              onFiltersChange={setFilters}
              onClear={clearFilters}
            />
          </div>

          <div className="mt-8 flex min-w-0 flex-1 flex-col lg:mt-0">
            {status === "loading" && (
              <Text
                role="status"
                className="px-4 pb-6 text-sm leading-5 sm:px-6"
              >
                A carregar perfis...
              </Text>
            )}

            {status === "error" && (
              <Text
                role="alert"
                className="px-4 pb-6 text-sm leading-5 sm:px-6"
              >
                Não foi possível carregar os perfis.
              </Text>
            )}

            {status === "ready" && results.length === 0 && (
              <Text className="px-4 pb-6 text-sm leading-5 sm:px-6">
                Nenhum resultado encontrado.
              </Text>
            )}

            {status === "ready" && results.length > 0 && (
              <div className="grid w-full grid-cols-1 gap-4 px-4 pb-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
                {results.map((profile) => (
                  <ProfileCard key={profile.id} profileData={profile} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

'use client'

import { useMemo } from 'react'
import { getPublishedOpportunities } from '@/actions/opportunities'
import { usePublicContent } from '@/hooks/usePublicContent'
import { FilterSidebar } from './FilterSidebar'
import { OpportunityCard } from '../OpportunityCard'
import { ContentState } from '../ContentState'
import { customBlur } from '@/app/fonts'
import { Heading } from '../ui/heading'
import { filterOpportunities } from './actions'
import { Text } from '../ui/text'
import { useOpportunityFilters } from './useOpportunityFilters'

const OpportunitiesContent: React.FC = () => {
  const { filters, setFilters, clearFilters } = useOpportunityFilters()
  const { data, isLoading, error, retry } = usePublicContent(getPublishedOpportunities)

  const opportunities = useMemo(() => data ?? [], [data])
  const filteredOpportunities = useMemo(
    () => filterOpportunities(opportunities, filters),
    [opportunities, filters],
  )

  const renderResults = () => {
    if (isLoading) {
      return <ContentState variant="loading" message="A carregar oportunidades…" className="text-rede-gray" />
    }

    if (error) {
      return <ContentState variant="error" message={error} onRetry={retry} />
    }

    if (opportunities.length === 0) {
      return <ContentState variant="empty" message="Ainda não há oportunidades publicadas." className="text-rede-gray" />
    }

    if (filteredOpportunities.length === 0) {
      return (
        <ContentState
          variant="empty"
          message="Nenhuma oportunidade encontrada para os filtros selecionados."
          className="text-rede-gray"
        />
      )
    }

    return filteredOpportunities.map((opportunity) => (
      <OpportunityCard
        key={opportunity.id}
        opportunityData={opportunity}
      />
    ))
  }

  return (
    <section className="mt-12 h-auto w-full sm:mt-16 lg:mt-20">
      <div className="mx-auto h-auto w-full max-w-360">
        <div className="flex items-end justify-between gap-4 px-4 sm:items-center sm:px-6 lg:px-0">
          <Heading
            level="h2"
            className={`${customBlur.className} mb-3 text-[38px] font-medium leading-[0.95] text-rede-yellow sm:mb-5 sm:text-[44px] lg:ml-3 lg:text-[48px] lg:leading-11.5`}
          >
            Todas as
            <br />
            oportunidades
          </Heading>

          {!isLoading && !error && (
            <div className="flex shrink-0 justify-end py-4 sm:px-6">
              <Text className="text-[14px] leading-4">
                {filteredOpportunities.length}{' '}
                {filteredOpportunities.length === 1
                  ? 'resultado'
                  : 'resultados'}
              </Text>
            </div>
          )}
        </div>

        <div className="mt-6 flex w-full min-w-0 flex-col lg:mt-10 lg:flex-row">
          <div className="w-full shrink-0 lg:w-82.75">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              onClear={clearFilters}
            />
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 px-4 pb-6 sm:grid-cols-2 sm:px-6 xl:grid-cols-3">
            {renderResults()}
          </div>
        </div>
      </div>
    </section>
  )
}

export const Opportunities: React.FC = () => {
  return <OpportunitiesContent />
}

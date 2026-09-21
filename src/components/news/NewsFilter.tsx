'use client'

import { useMemo } from 'react'
import { customBlur } from '@/app/fonts'
import { getPublishedNews } from '@/actions/news'
import { usePublicContent } from '@/hooks/usePublicContent'
import { FilterSidebar } from './FilterSidebar'
import { Heading } from '../ui/heading'
import { ArticleCard } from '../ArticleCard'
import { ContentState } from '../ContentState'
import { filterNews, getNewsYearOptions } from './actions'
import { Text } from '../ui/text'
import { useNewsFilters } from './useNewsFilters'

const NewsFilterContent: React.FC = () => {
  const { filters, setFilters, clearFilters } = useNewsFilters()
  const { data, isLoading, error, retry } = usePublicContent(getPublishedNews)

  const news = useMemo(() => data ?? [], [data])
  const yearOptions = useMemo(() => getNewsYearOptions(news), [news])
  const results = useMemo(() => filterNews(news, filters), [news, filters])

  const renderResults = () => {
    if (isLoading) {
      return <ContentState variant="loading" message="A carregar notícias…" className="flex-1 text-rede-white" />
    }

    if (error) {
      return <ContentState variant="error" message={error} onRetry={retry} className="flex-1" />
    }

    if (news.length === 0) {
      return <ContentState variant="empty" message="Ainda não há notícias publicadas." className="flex-1 text-rede-white" />
    }

    if (results.length === 0) {
      return (
        <ContentState
          variant="empty"
          message="Nenhuma notícia encontrada para os filtros selecionados."
          className="flex-1 text-rede-white"
        />
      )
    }

    return (
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 px-4 pb-6 sm:grid-cols-2 sm:px-6 xl:grid-cols-3">
        {results.map((item) => (
          <ArticleCard key={item.id} newsData={item} />
        ))}
      </div>
    )
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
            notícias
          </Heading>

          {!isLoading && !error && (
            <div className="flex shrink-0 justify-end py-4 sm:px-6">
              <Text className="text-[14px] leading-4">
                {results.length}{' '}
                {results.length === 1 ? 'resultado' : 'resultados'}
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
              yearOptions={yearOptions}
            />
          </div>

          {renderResults()}
        </div>
      </div>
    </section>
  )
}

export const NewsFilter: React.FC = () => {
  return <NewsFilterContent />
}

'use client'

import { getPublishedNewsletters } from '@/actions/newsletters'
import { usePublicContent } from '@/hooks/usePublicContent'

import { ContentState } from '../ContentState'
import { NewsletterCard } from '../NewsletterCard'

export const SectionNewsletters: React.FC = () => {
  const { data: newsletters, isLoading, error, retry } = usePublicContent(getPublishedNewsletters)

  const renderContent = () => {
    if (isLoading) {
      return <ContentState variant="loading" message="A carregar newsletters…" className="text-rede-white" />
    }

    if (error) {
      return <ContentState variant="error" message={error} onRetry={retry} />
    }

    if (!newsletters || newsletters.length === 0) {
      return <ContentState variant="empty" message="Ainda não há edições publicadas." className="text-rede-white" />
    }

    return newsletters.map((newsletter, index) => (
      <NewsletterCard
        key={newsletter.id ?? `${newsletter.title}-${index}`}
        newsletterData={newsletter}
      />
    ))
  }

  return (
    <section className="mt-12 h-auto w-full sm:mt-16 lg:mt-20">
      <div className="mx-auto h-auto w-full max-w-360">
        <div className="grid min-w-0 grid-cols-1 gap-4 px-4 pb-6 sm:grid-cols-2 sm:px-6 xl:grid-cols-3">
          {renderContent()}
        </div>
      </div>
    </section>
  )
}

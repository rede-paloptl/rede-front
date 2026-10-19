'use client'

import { customBlur } from '@/app/fonts'
import { useSiteSettings } from '@/components/contexts/SiteSettingsContext'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import type { HeroPage } from '@/types/SiteSettings'

type HeroProps = {
  /** Página cujo destaque (imagem, título, descrição) vem do painel (Personalizar > Destaques). */
  page?: HeroPage
  /** Sobrepõem-se ao painel (ex: a capa de uma notícia). */
  title?: string
  description?: string
  imageUrl?: string
}

export const Hero: React.FC<HeroProps> = ({ page, ...props }) => {
  const { heroes } = useSiteSettings()
  const content = page ? heroes.pages[page] : undefined

  const title = props.title ?? content?.title
  const description = props.description ?? content?.description
  // Sem imagem própria (ex: notícia sem capa) usa a imagem por omissão do painel.
  const imageUrl = props.imageUrl || content?.imageUrl || heroes.fallbackImageUrl
  const hasContent = Boolean(title || description)

  return (
    <section className="h-auto w-full pt-17">
      <div className="relative mx-auto h-[calc(100vh-65px)] w-full max-w-[1920px] overflow-hidden">
        <img
          src={imageUrl}
          alt={title ? `Imagem de destaque: ${title}` : 'Imagem de destaque'}
          className="h-full w-full object-cover"
        />

        {hasContent && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/20 px-4 text-center sm:gap-4 sm:px-6 lg:bg-transparent">
            {title && (
              <Heading
                className={`${customBlur.className} max-w-full break-words text-[52px] font-medium leading-none text-rede-yellow sm:text-[82px] lg:text-[128px]`}
              >
                {title}
              </Heading>
            )}

            {description && (
              <Text className="max-w-[560px] text-sm font-semibold leading-relaxed text-rede-white sm:text-base lg:max-w-2xl">
                {description}
              </Text>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

import { defaultSiteSettings, withDefaults, type SiteLink, type SiteSettings } from '@/types/SiteSettings'

import { apiBaseUrl } from './api'

/**
 * Personalizacao do site (menu, rodape, imagens de destaque, home e
 * parceiros). Segue o mesmo caminho da taxonomia:
 * - no servidor, o RootLayout chama `await ensureSiteSettings()` e passa o
 *   resultado ao SiteSettingsProvider;
 * - no browser, o provider volta a pedir a versao actual (as paginas estaticas
 *   trazem a do dia do deploy).
 *
 * Sem API, fica sempre o que havia (no limite, `defaultSiteSettings`).
 */

const SITE_SETTINGS_TTL_MS = 30_000

let current: SiteSettings = defaultSiteSettings
let loadedAt = 0
let pending: Promise<SiteSettings> | null = null

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const response = await fetch(
    `${apiBaseUrl}/api/v1/site-settings`,
    (process.env.NODE_ENV === 'development'
      ? { cache: 'no-store' }
      : { next: { revalidate: 30, tags: ['site-settings'] } }) as RequestInit,
  )

  if (!response.ok) throw new Error(`Personalização: ${response.status}`)

  // Completa o que faltar (ex: API mais antiga que o site) com os valores originais.
  return withDefaults(defaultSiteSettings, ((await response.json()) as { settings?: unknown }).settings)
}

/** Nunca lança. */
export async function ensureSiteSettings(): Promise<SiteSettings> {
  if (loadedAt > 0 && Date.now() - loadedAt < SITE_SETTINGS_TTL_MS) return current

  pending ??= fetchSiteSettings().finally(() => {
    pending = null
  })

  try {
    current = await pending
    loadedAt = Date.now()
  } catch (error) {
    console.error('[site-settings] não foi possível carregar a personalização:', error)
  }

  return current
}

/**
 * Endereço de um link do painel pelo id (ex: "terms" nos contactos do
 * rodapé). Se o link foi apagado ou escondido, fica o endereço original.
 */
export const findLinkHref = (links: SiteLink[], id: string, fallback: string) =>
  links.find((link) => link.id === id && link.isVisible)?.href ?? fallback

/**
 * Capa que o site grava num filme sem imagem. Ao mostrar, vale como "sem
 * capa" e é trocada pela imagem por omissão do painel.
 */
export const LEGACY_FILM_PLACEHOLDER = '/assets/placeholder-img.jpg'

export const filmCoverOrPlaceholder = (cover: string | undefined, placeholder: string) =>
  cover && cover !== LEGACY_FILM_PLACEHOLDER ? cover : placeholder

/** Links para fora do site abrem noutro separador. */
export const isExternalHref = (href: string) => /^https?:\/\//i.test(href)

export const externalLinkProps = (href: string) =>
  isExternalHref(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {}

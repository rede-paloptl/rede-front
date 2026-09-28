import { apiBaseUrl } from './api'
import { normalizeText } from './utils'

/**
 * Listas de opções (países, províncias, cidades, categorias, temas, ...)
 * geridas no painel, em Configurações. Os registos guardam o id do termo;
 * registos antigos podem ainda ter o nome ou o slug, e `label`/`find`
 * resolvem as duas formas.
 *
 * O estado vive num store de módulo (e não só em contexto React) porque os
 * filtros, os URLs e os cartões usam-no em funções puras, tanto no servidor
 * como no browser:
 * - no servidor, quem precisa chama `await ensureTaxonomy()` (o RootLayout já
 *   o faz e passa os termos ao TaxonomyProvider);
 * - no browser, o TaxonomyProvider preenche o store no primeiro render.
 */

export type SelectItemType = {
  label: string
  value: string
}

export type TaxonomyKind =
  | 'country'
  | 'region'
  | 'city'
  | 'profile-type'
  | 'profile-category'
  | 'profile-subcategory'
  | 'service'
  | 'content-category'
  | 'content-theme'
  | 'opportunity-type'
  | 'film-genre'
  | 'film-theme'

export type TaxonomyTerm = {
  id: string
  kind: TaxonomyKind
  label: string
  slug: string
  parentId: string | null
  isActive: boolean
}

/** Os tipos de perfil de que o código depende (não se apagam no painel). */
export type ProfileTypeSlug = 'empresa' | 'festival' | 'instituicao' | 'profissionais'

const toKey = (value: string) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const sortByLabel = (a: SelectItemType, b: SelectItemType) => a.label.localeCompare(b.label, 'pt')

const toOption = (term: TaxonomyTerm): SelectItemType => ({ label: term.label, value: term.id })

function buildTaxonomy(terms: TaxonomyTerm[], version: number) {
  const byId = new Map(terms.map((term) => [term.id, term]))
  const active = terms.filter((term) => term.isActive)

  const childrenOf = (parentId: string | null, kind?: TaxonomyKind) =>
    active.filter((term) => term.parentId === parentId && (!kind || term.kind === kind))

  const optionsOf = (list: TaxonomyTerm[]) => list.map(toOption).sort(sortByLabel)

  const ofKind = (kind: TaxonomyKind) => optionsOf(active.filter((term) => term.kind === kind))

  const isDescendantOf = (term: TaxonomyTerm, ancestorId: string) => {
    let parentId = term.parentId

    while (parentId) {
      if (parentId === ancestorId) return true
      parentId = byId.get(parentId)?.parentId ?? null
    }

    return false
  }

  /** O termo de um valor gravado: id, ou slug/nome em registos antigos. */
  const find = (value: string | null | undefined, kinds?: TaxonomyKind[], withinId?: string | null) => {
    if (!value) return undefined

    const direct = byId.get(value)
    if (direct && (!kinds || kinds.includes(direct.kind))) return direct

    const key = toKey(value)
    if (!key) return undefined

    const matches = terms.filter(
      (term) =>
        (!kinds || kinds.includes(term.kind)) &&
        (term.slug === key || toKey(term.label) === key) &&
        (!withinId || isDescendantOf(term, withinId)),
    )

    // Activos primeiro; depois a ordem dos tipos pedidos.
    return matches.sort(
      (a, b) =>
        Number(b.isActive) - Number(a.isActive) ||
        (kinds ? kinds.indexOf(a.kind) - kinds.indexOf(b.kind) : 0),
    )[0]
  }

  const ancestorOfKind = (term: TaxonomyTerm | undefined, kind: TaxonomyKind) => {
    let current = term

    while (current) {
      if (current.kind === kind) return current
      current = current.parentId ? byId.get(current.parentId) : undefined
    }

    return undefined
  }

  // --- Localização --------------------------------------------------------
  const countries = active.filter((term) => term.kind === 'country')
  const countriesList = optionsOf(countries)

  const provincesByCountry: Record<string, SelectItemType[]> = {}
  const citiesByCountryAndProvince: Record<string, Record<string, SelectItemType[]>> = {}

  for (const country of countries) {
    const regions = childrenOf(country.id, 'region')
    provincesByCountry[country.id] = optionsOf(regions)

    const cities: Record<string, SelectItemType[]> = {}
    for (const region of regions) cities[region.id] = optionsOf(childrenOf(region.id, 'city'))

    // Cidades sem província (dados antigos) ficam debaixo do próprio país.
    const direct = childrenOf(country.id, 'city')
    if (direct.length > 0) cities[country.id] = optionsOf(direct)

    citiesByCountryAndProvince[country.id] = cities
  }

  // --- Perfis -------------------------------------------------------------
  const profileTypes = active.filter((term) => term.kind === 'profile-type')
  const profileTypesList = optionsOf(profileTypes)

  const profileTypeIdBySlug = Object.fromEntries(profileTypes.map((type) => [type.slug, type.id])) as Partial<
    Record<ProfileTypeSlug, string>
  >

  const categoriesByType: Record<string, SelectItemType[]> = {}
  const subCategoriesByType: Record<string, Record<string, SelectItemType[]>> = {}
  const categoryBySubCategory: Record<string, string> = {}

  for (const type of profileTypes) {
    const categories = childrenOf(type.id, 'profile-category')
    categoriesByType[type.id] = optionsOf(categories)

    const byCategory: Record<string, SelectItemType[]> = {}
    for (const category of categories) {
      const subCategories = childrenOf(category.id, 'profile-subcategory')
      if (subCategories.length === 0) continue

      byCategory[category.id] = optionsOf(subCategories)
      for (const subCategory of subCategories) categoryBySubCategory[subCategory.id] = category.id
    }

    subCategoriesByType[type.id] = byCategory
  }

  // --- Conteúdos ----------------------------------------------------------
  const contentCategories = ofKind('content-category')
  const contentThemesByCategory: Record<string, SelectItemType[]> = {}
  for (const category of contentCategories) {
    contentThemesByCategory[category.value] = optionsOf(childrenOf(category.value, 'content-theme'))
  }

  return {
    version,
    terms,
    byId,
    find,
    ancestorOfKind,
    isDescendantOf,

    /** Nome a mostrar; um valor fora das listas aparece tal e qual. */
    label: (value: string | null | undefined, kinds?: TaxonomyKind[]) => find(value, kinds)?.label ?? value ?? '',
    /** O id canónico de um valor gravado (ou o próprio valor, se não estiver nas listas). */
    id: (value: string | null | undefined, kinds?: TaxonomyKind[], withinId?: string | null) =>
      find(value, kinds, withinId)?.id ?? value ?? '',

    options: ofKind,
    /** Opções de um tipo em qualquer nível abaixo de um termo (ex: todas as cidades de um país). */
    optionsWithin: (kind: TaxonomyKind, ancestorId: string | null | undefined) =>
      ancestorId ? optionsOf(active.filter((term) => term.kind === kind && isDescendantOf(term, ancestorId))) : [],

    countriesList,
    provincesByCountry,
    citiesByCountryAndProvince,

    profileTypesList,
    profileTypeIdBySlug,
    categoriesByType,
    subCategoriesByType,
    categoryBySubCategory,
    services: ofKind('service'),

    contentCategories,
    contentThemesByCategory,
    contentThemes: ofKind('content-theme'),
    opportunityTypes: ofKind('opportunity-type'),

    filmGenres: ofKind('film-genre'),
    filmThemes: ofKind('film-theme'),
  }
}

export type Taxonomy = ReturnType<typeof buildTaxonomy>

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

let current: Taxonomy = buildTaxonomy([], 0)
let loadedAt = 0

export const getTaxonomy = () => current

export function setTaxonomyTerms(terms: TaxonomyTerm[]) {
  if (terms === current.terms) return
  current = buildTaxonomy(terms, current.version + 1)
  loadedAt = Date.now()
}

const TAXONOMY_TTL_MS = 60_000
let pending: Promise<TaxonomyTerm[]> | null = null

export async function fetchTaxonomyTerms(): Promise<TaxonomyTerm[]> {
  const response = await fetch(
    `${apiBaseUrl}/api/v1/taxonomy`,
    // Em produção, a cache do Next partilha a lista entre pedidos (60 s). Em
    // desenvolvimento essa cache sobrevive entre pedidos e mostrava listas
    // antigas; o store deste módulo já evita pedidos repetidos.
    (process.env.NODE_ENV === 'development'
      ? { cache: 'no-store' }
      : { next: { revalidate: 60, tags: ['taxonomy'] } }) as RequestInit,
  )

  if (!response.ok) throw new Error(`Taxonomia: ${response.status}`)

  return ((await response.json()) as { terms: TaxonomyTerm[] }).terms
}

/** Garante o store preenchido (e fresco no servidor). Nunca lança: sem API, fica o que havia. */
export async function ensureTaxonomy(): Promise<Taxonomy> {
  const isFresh = current.terms.length > 0 && Date.now() - loadedAt < TAXONOMY_TTL_MS
  if (isFresh) return current

  pending ??= fetchTaxonomyTerms().finally(() => {
    pending = null
  })

  try {
    setTaxonomyTerms(await pending)
  } catch (error) {
    console.error('[taxonomy] não foi possível carregar as listas:', error)
  }

  return current
}

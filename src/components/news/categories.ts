import { getTaxonomy, sortByLabel, type SelectItemType } from '@/lib/taxonomy'
import { normalizeNewsValue } from './actions'

// Categorias e temas partilhados por /news e /oportunidades, geridos no painel
// (Configurações > Conteúdos). Os registos guardam ids; aqui, como os filtros
// e as tags trabalham com nomes, o value de cada opção é o nome normalizado
// ("festivais-e-eventos") — é também o que fica no URL.

/** Categorias de conteúdo, com o nome normalizado como value. */
export const getContentCategoryOptions = (): SelectItemType[] =>
  getTaxonomy().contentCategories.map(({ label }) => ({ label, value: normalizeNewsValue(label) }))

/** Nomes dos temas de cada categoria, indexados pelo value da categoria. */
export const getContentThemesByCategory = (): Record<string, string[]> => {
  const { contentCategories, contentThemesByCategory } = getTaxonomy()

  return Object.fromEntries(
    contentCategories.map((category) => [
      normalizeNewsValue(category.label),
      (contentThemesByCategory[category.value] ?? []).map((theme) => theme.label),
    ]),
  )
}

const toOption = (label: string): SelectItemType => ({
  label,
  value: normalizeNewsValue(label),
})

// Uma sub-categoria pode aparecer em mais do que uma categoria (por exemplo
// "Mapeamento", que é de Investigação e de Projetos da REDE), daí guardarmos a
// lista de donos em vez de um só.
const getOwnersBySubCategory = () => {
  const owners = new Map<string, string[]>()

  for (const [category, labels] of Object.entries(getContentThemesByCategory())) {
    for (const label of labels) {
      const value = normalizeNewsValue(label)
      owners.set(value, [...(owners.get(value) ?? []), category])
    }
  }

  return owners
}

// Sem categoria escolhida a lista mostra todos os temas, para que a
// sub-categoria possa ser o ponto de partida da pesquisa.
export const getNewsSubCategoryOptions = (selectedCategory: string): SelectItemType[] => {
  const labels = getContentThemesByCategory()[selectedCategory]

  if (labels) return labels.map(toOption).sort(sortByLabel)

  const seen = new Set<string>()

  return getTaxonomy()
    .contentThemes.map(({ label }) => toOption(label))
    .filter((option) => {
      if (seen.has(option.value)) return false
      seen.add(option.value)
      return true
    })
    .sort(sortByLabel)
}

// Devolve a categoria a aplicar quando se escolhe uma sub-categoria. Mantém a
// categoria já escolhida se a sub-categoria lhe pertencer; se a sub-categoria
// pertencer a mais do que uma categoria, devolve vazio de propósito — fechar
// na categoria errada esconderia resultados que a sub-categoria devolve.
export const getNewsCategoryForSubCategory = (subCategoryValue: string, preferredCategory = ''): string => {
  if (!subCategoryValue) return preferredCategory

  const owners = getOwnersBySubCategory().get(normalizeNewsValue(subCategoryValue)) ?? []

  if (preferredCategory && owners.includes(preferredCategory)) {
    return preferredCategory
  }

  return owners.length === 1 ? owners[0] : ''
}

// Os registos guardam ids (e os antigos, nomes/slugs). O site mostra e filtra
// por nomes, e os países por id, como na lista de países dos filtros.
export const toContentCategoryValue = (value?: string) =>
  value ? normalizeNewsValue(getTaxonomy().label(value, ['content-category'])) : ''

export const toContentThemeLabels = (values?: string[]) =>
  (values ?? []).map((value) => getTaxonomy().label(value, ['content-theme']))

export const toCountryLabel = (value?: string) => getTaxonomy().label(value, ['country'])

export const toCountryId = (value?: string) => (value ? getTaxonomy().id(value, ['country']) : '')

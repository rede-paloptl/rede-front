import { OpportunityType } from '../OpportunityCard'
import { getContentThemesByCategory } from '../news/categories'
import { normalizeNewsValue } from '../news/actions'

export type OpportunityFilters = {
  search: string
  country: string
  category: string
  subCategory: string
}

export const defaultOpportunityFilters: OpportunityFilters = {
  search: '',
  country: '',
  category: '',
  subCategory: '',
}

const normalizedThemes = (opportunity: OpportunityType) =>
  opportunity.themes?.map(normalizeNewsValue) ?? []

const opportunityMatchesCategory = (
  opportunity: OpportunityType,
  category: string,
) => {
  const normalizedCategory = normalizeNewsValue(category)
  const themes = normalizedThemes(opportunity)
  const categorySubCategories =
    getContentThemesByCategory()[category]?.map(normalizeNewsValue) ?? []

  return (
    normalizeNewsValue(opportunity.type) === normalizedCategory ||
    themes.includes(normalizedCategory) ||
    categorySubCategories.some((subCategory) => themes.includes(subCategory))
  )
}

// Local, static-data implementation of the opportunities search. Keeps the
// same (opportunities, filters) -> OpportunityType[] shape a real API call
// would have, so swapping this for a fetch to the backend later is a
// drop-in replacement.
export function filterOpportunities(
  opportunities: OpportunityType[],
  filters: OpportunityFilters,
): OpportunityType[] {
  const search = filters.search.trim().toLowerCase()

  return opportunities.filter((opportunity) => {
    if (search) {
      const haystack = [
        opportunity.title,
        opportunity.description,
        opportunity.type,
        ...opportunity.eligibility,
        ...(opportunity.themes ?? []),
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }

    if (
      filters.country &&
      normalizeNewsValue(opportunity.country) !== normalizeNewsValue(filters.country)
    ) {
      return false
    }

    if (
      filters.category &&
      !opportunityMatchesCategory(opportunity, filters.category)
    ) {
      return false
    }

    if (
      filters.subCategory &&
      normalizeNewsValue(opportunity.type) !==
        normalizeNewsValue(filters.subCategory) &&
      !normalizedThemes(opportunity).includes(normalizeNewsValue(filters.subCategory))
    ) {
      return false
    }

    return true
  })
}


// O "sitio" de uma oportunidade e a elegibilidade mais o pais. Duas
// oportunidades sao semelhantes quando partilham pelo menos um deles: exigir a
// lista inteira igual deixaria sem sugestoes as que abrangem varios paises.
const toPlaceValues = (opportunity: OpportunityType): string[] =>
  [...(opportunity.eligibility ?? []), opportunity.country]
    .map((place) => normalizeNewsValue(String(place ?? '')))
    .filter(Boolean)

export function getSimilarOpportunities(
  currentOpportunity: OpportunityType,
  opportunities: OpportunityType[],
  limit = 3,
): OpportunityType[] {
  const currentPlaces = new Set(toPlaceValues(currentOpportunity))

  return opportunities
    .filter(
      (opportunity) =>
        opportunity.id !== currentOpportunity.id &&
        toPlaceValues(opportunity).some((place) => currentPlaces.has(place)),
    )
    .slice(0, limit)
}

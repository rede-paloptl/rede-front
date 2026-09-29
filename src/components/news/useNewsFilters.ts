'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { normalizeCountryValue, normalizeLabelKey } from '../network/filters'
import { getTaxonomy } from '@/lib/taxonomy'
import { getContentCategoryOptions, getContentThemesByCategory } from './categories'
import {
  defaultNewsFilters,
  NewsFilters,
  normalizeNewsValue,
} from './actions'

type NewsFilterKey = keyof NewsFilters

const urlFilterKeys = [
  'search',
  'country',
  'category',
  'subCategory',
  'year',
] as const

const optionMatches = (
  option: { label: string; value: string },
  value: string,
) => {
  const normalizedValue = normalizeLabelKey(value)

  return (
    normalizeLabelKey(option.value) === normalizedValue ||
    normalizeLabelKey(option.label) === normalizedValue
  )
}

const findCountryByValue = (value: string) => {
  const id = normalizeCountryValue(value)

  return getTaxonomy().countriesList.find((country) => country.value === id)
}

const findCategoryByValue = (value: string) =>
  getContentCategoryOptions().find((category) => optionMatches(category, value))

// As notícias chegam da API depois de a página abrir: o ano do URL não pode
// depender da lista carregada. Qualquer ano de quatro dígitos é aceite; se não
// houver notícias desse ano, a listagem mostra o estado vazio.
const findYearByValue = (value: string) => {
  const year = value.trim()

  return /^\d{4}$/.test(year) ? { label: year, value: year } : undefined
}

const findSubCategoryParent = (value: string) => {
  const normalizedValue = normalizeNewsValue(value)

  for (const [category, subCategories] of Object.entries(getContentThemesByCategory())) {
    const subCategory = subCategories.find(
      (item) => normalizeNewsValue(item) === normalizedValue,
    )

    if (subCategory) {
      return {
        category,
        subCategory: normalizeNewsValue(subCategory),
      }
    }
  }

  return null
}

export const getNewsFiltersFromTag = (
  tag: string,
): Partial<NewsFilters> => {
  const country = findCountryByValue(tag)

  if (country) return { country: country.value }

  const category = findCategoryByValue(tag)

  if (category) return { category: category.value }

  const subCategoryParent = findSubCategoryParent(tag)

  if (subCategoryParent) return subCategoryParent

  const year = findYearByValue(tag)

  if (year) return { year: year.value }

  return { search: tag }
}

export const getNewsFiltersFromParams = (
  params: Partial<Record<NewsFilterKey | 'tag', string>>,
): NewsFilters => {
  const filters: NewsFilters = { ...defaultNewsFilters }

  const country = params.country ? findCountryByValue(params.country) : null

  if (country) filters.country = country.value

  const category = params.category
    ? findCategoryByValue(params.category)
    : null

  if (category) filters.category = category.value

  if (params.subCategory) {
    const subCategoryParent = findSubCategoryParent(params.subCategory)

    if (subCategoryParent) {
      filters.category = subCategoryParent.category
      filters.subCategory = subCategoryParent.subCategory
    }
  }

  const year = params.year ? findYearByValue(params.year) : null

  if (year) filters.year = year.value

  if (params.search) filters.search = params.search.trim()

  if (params.tag) Object.assign(filters, getNewsFiltersFromTag(params.tag))

  return filters
}

const buildQueryString = (filters: NewsFilters): string => {
  const params = new URLSearchParams()

  for (const key of urlFilterKeys) {
    const value = filters[key].trim()

    if (value) params.set(key, value)
  }

  return params.toString()
}

export const getNewsTagHref = (tag: string) => {
  const filters = getNewsFiltersFromTag(tag)
  const entry = urlFilterKeys.find((key) => filters[key])

  if (entry) {
    return `/news?${entry}=${encodeURIComponent(filters[entry] ?? '')}`
  }

  return `/news?tag=${encodeURIComponent(tag)}`
}

export const useNewsFilters = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo(
    () =>
      getNewsFiltersFromParams({
        tag: searchParams.get('tag') ?? '',
        search: searchParams.get('search') ?? '',
        country: searchParams.get('country') ?? '',
        category: searchParams.get('category') ?? '',
        subCategory:
          searchParams.get('subCategory') ??
          searchParams.get('subcategory') ??
          '',
        year: searchParams.get('year') ?? '',
      }),
    [searchParams],
  )

  const applyFilters = useCallback(
    (next: NewsFilters) => {
      const query = buildQueryString(next)

      window.history.replaceState(
        null,
        '',
        query ? `${pathname}?${query}` : pathname,
      )
    },
    [pathname],
  )

  const clearFilters = useCallback(() => {
    applyFilters(defaultNewsFilters)
  }, [applyFilters])

  return { filters, setFilters: applyFilters, clearFilters }
}

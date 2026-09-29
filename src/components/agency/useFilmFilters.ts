'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { normalizeCountryValue, normalizeLabelKey } from '../network/filters'
import { getTaxonomy } from '@/lib/taxonomy'
import {
  agencyGenreKinds,
  defaultFilmFilters,
  FilmFilters,
  getFilmYearOptions,
} from './actions'
import { films } from './data'

type FilmFilterKey = keyof FilmFilters

const urlFilterKeys = ['search', 'country', 'genre', 'year'] as const

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

const findGenreByValue = (value: string) => {
  const genre = getTaxonomy().find(value, agencyGenreKinds)

  return genre?.isActive ? { label: genre.label, value: genre.id } : undefined
}

const findYearByValue = (value: string) =>
  getFilmYearOptions(films).find((year) => optionMatches(year, value))

export const getFilmFiltersFromTag = (
  tag: string,
): Partial<FilmFilters> => {
  const country = findCountryByValue(tag)

  if (country) return { country: country.value }

  const genre = findGenreByValue(tag)

  if (genre) return { genre: genre.value }

  const year = findYearByValue(tag)

  if (year) return { year: year.value }

  return { search: tag }
}

export const getFilmFiltersFromParams = (
  params: Partial<Record<FilmFilterKey | 'tag', string>>,
): FilmFilters => {
  const filters: FilmFilters = { ...defaultFilmFilters }

  const country = params.country ? findCountryByValue(params.country) : null

  if (country) filters.country = country.value

  const genre = params.genre ? findGenreByValue(params.genre) : null

  if (genre) filters.genre = genre.value

  const year = params.year ? findYearByValue(params.year) : null

  if (year) filters.year = year.value

  if (params.search) filters.search = params.search.trim()

  if (params.tag) Object.assign(filters, getFilmFiltersFromTag(params.tag))

  return filters
}

const buildQueryString = (filters: FilmFilters): string => {
  const params = new URLSearchParams()

  for (const key of urlFilterKeys) {
    const value = filters[key].trim()

    if (value) params.set(key, value)
  }

  return params.toString()
}

export const getFilmTagHref = (tag: string) => {
  const filters = getFilmFiltersFromTag(tag)
  const entry = urlFilterKeys.find((key) => filters[key])

  if (entry) {
    return `/agency?${entry}=${encodeURIComponent(filters[entry] ?? '')}`
  }

  return `/agency?tag=${encodeURIComponent(tag)}`
}

export const useFilmFilters = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo(
    () =>
      getFilmFiltersFromParams({
        tag: searchParams.get('tag') ?? '',
        search: searchParams.get('search') ?? '',
        country: searchParams.get('country') ?? '',
        genre: searchParams.get('genre') ?? '',
        year: searchParams.get('year') ?? '',
      }),
    [searchParams],
  )

  const applyFilters = useCallback(
    (next: FilmFilters) => {
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
    applyFilters(defaultFilmFilters)
  }, [applyFilters])

  return { filters, setFilters: applyFilters, clearFilters }
}

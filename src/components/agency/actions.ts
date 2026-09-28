import { SelectItemType } from '../network/filters'
import { getTaxonomy } from '@/lib/taxonomy'
import { FilmType } from './Films'

export type FilmFilters = {
  search: string
  country: string
  genre: string
  year: string
}

export const defaultFilmFilters: FilmFilters = {
  search: '',
  country: '',
  genre: '',
  year: '',
}

// Local, static-data implementation of the film catalog search. Keeps the
// same (films, filters) -> FilmType[] shape a real API call would have, so
// swapping this for a fetch to the backend later is a drop-in replacement.
export function filterFilms(films: FilmType[], filters: FilmFilters): FilmType[] {
  const search = filters.search.trim().toLowerCase()

  return films.filter((film) => {
    if (search) {
      const haystack = [film.title, film.director, ...film.tags.map((tag) => tag.label)]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }

    // Os filtros usam ids das listas; os filmes guardam o slug.
    const taxonomy = getTaxonomy()
    if (filters.country && taxonomy.id(film.country, ['country']) !== filters.country) return false
    if (filters.genre && taxonomy.id(film.genre, ['film-genre']) !== filters.genre) return false
    if (filters.year && film.year !== filters.year) return false

    return true
  })
}

export function getFilmYearOptions(films: FilmType[]): SelectItemType[] {
  const years = Array.from(new Set(films.map((film) => film.year))).sort((a, b) => Number(b) - Number(a))
  return years.map((year) => ({ label: year, value: year }))
}

import { AccountType, CompanyType } from "@/types/User";
import { getTaxonomy, sortByLabel, type ProfileTypeSlug, type SelectItemType, type TaxonomyKind } from "@/lib/taxonomy";

// As listas (localização, tipos, categorias, sub-categorias, formatos, géneros
// e temas de filmes) vêm da API e são geridas no painel, em Configurações. Os
// values das opções são os ids dos termos: é isso que os perfis gravam.
export { sortByLabel };

export type ProfileTypeCode = ProfileTypeSlug;

/** Os campos do perfil que decidem o seu tipo. */
export type ProfileTypeSource = { accountType?: AccountType; companyType?: CompanyType } | null | undefined;

// O tipo de perfil de uma conta: individual é "profissionais"; uma conta de
// empresa é do sub-tipo escolhido no registo (empresa, festival ou
// instituição). Contas de empresa anteriores ao sub-tipo contam como empresa.
export const getProfileTypeSlug = (profile: ProfileTypeSource): ProfileTypeCode =>
  profile?.accountType === 'company' ? profile.companyType ?? 'empresa' : 'profissionais'

/** Id do tipo de perfil de uma conta (o value usado nos filtros da Rede). */
export const getProfileTypeId = (profile: ProfileTypeSource): string =>
  getTaxonomy().profileTypeIdBySlug[getProfileTypeSlug(profile)] ?? ''

// As categorias que uma conta pode escolher são as do seu tipo de perfil.
export const getProfileCategories = (profile: ProfileTypeSource): SelectItemType[] =>
  getTaxonomy().categoriesByType[getProfileTypeId(profile)] ?? []

// As sub-categorias que uma conta pode declarar, sem repetidos e por ordem
// alfabética. Tipos sem nível abaixo da categoria devolvem a lista vazia.
export const getProfileSubCategories = (profile: ProfileTypeSource): SelectItemType[] => {
  const byCategory = getTaxonomy().subCategoriesByType[getProfileTypeId(profile)] ?? {}
  const seen = new Set<string>()

  return Object.values(byCategory)
    .flat()
    .filter((item) => {
      if (seen.has(item.value)) return false

      seen.add(item.value)
      return true
    })
    .sort(sortByLabel)
}

// Formatos, géneros e temas dos filmes, para o formulário e os cartões.
export const getFilmFormatOptions = () => getTaxonomy().filmFormats
export const getFilmThemeOptions = () => getTaxonomy().filmThemes
export const getFilmGenreOptions = () => getTaxonomy().filmGenres

/** `type` de um filme junta formato, género e temas numa só lista. */
export const filmTypeKinds: TaxonomyKind[] = ['film-format', 'film-genre', 'film-theme']

// Os filmes guardam ids (países, formato/género/temas, funções); registos
// antigos podem ter o slug. Mostra-se sempre o nome, e um valor fora das
// listas (ex: "Outros" nos países) aparece tal e qual.
export const getFilmTagLabel = (value?: string): string =>
  getTaxonomy().label(value, ['country', ...filmTypeKinds, 'profile-category', 'profile-subcategory'])

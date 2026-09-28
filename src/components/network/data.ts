import { AccountType } from "@/types/User";
import { getTaxonomy, sortByLabel, type ProfileTypeSlug, type SelectItemType } from "@/lib/taxonomy";

// As listas (localização, tipos, categorias, sub-categorias, géneros e temas
// de filmes) vêm da API e são geridas no painel, em Configurações. Os values
// das opções são os ids dos termos: é isso que os perfis gravam.
export { sortByLabel };

export type ProfileTypeCode = ProfileTypeSlug;

// O tipo de perfil que corresponde ao tipo de conta. Festival e instituição
// existem na taxonomia mas ainda não como tipo de conta.
export const getProfileTypeSlugByAccountType = (accountType?: AccountType): ProfileTypeCode =>
  accountType === 'company' ? 'empresa' : 'profissionais'

/** Id do tipo de perfil de uma conta (o value usado nos filtros da Rede). */
export const getProfileTypeByAccountType = (accountType?: AccountType): string =>
  getTaxonomy().profileTypeIdBySlug[getProfileTypeSlugByAccountType(accountType)] ?? ''

// As categorias que uma conta pode escolher dependem apenas do tipo de conta:
// contas de empresa usam as categorias de empresa, individuais as de
// profissionais.
export const getCategoriesByAccountType = (accountType?: AccountType): SelectItemType[] =>
  getTaxonomy().categoriesByType[getProfileTypeByAccountType(accountType)] ?? []

// As sub-categorias que uma conta pode declarar, sem repetidos e por ordem
// alfabética. Profissionais não têm nível abaixo da profissão, por isso a
// lista vem vazia.
export const getSubCategoriesByAccountType = (accountType?: AccountType): SelectItemType[] => {
  const byCategory = getTaxonomy().subCategoriesByType[getProfileTypeByAccountType(accountType)] ?? {}
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

// Temas e géneros dos filmes, para o formulário e os cartões.
export const getFilmThemeOptions = () => getTaxonomy().filmThemes
export const getFilmGenreOptions = () => getTaxonomy().filmGenres

// Os filmes guardam ids (países, tema/género, funções); registos antigos
// podem ter o slug. Mostra-se sempre o nome, e um valor fora das listas
// aparece tal e qual.
export const getFilmTagLabel = (value?: string): string =>
  getTaxonomy().label(value, ['country', 'film-genre', 'film-theme', 'profile-category', 'profile-subcategory'])

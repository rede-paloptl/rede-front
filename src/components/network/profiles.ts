import { NetworkUser } from '@/actions/users'
import { getTaxonomy, type TaxonomyKind } from '@/lib/taxonomy'

import { ProfileType } from '../ProfileCard'
import { getProfileTypeId } from './data'
import { normalizeCountryValue, normalizeLabelKey } from './filters'

const fallbackProfileImage = '/assets/profile/profile.png'

// O perfil guarda ids das listas geridas em Configuracoes (registos antigos
// podem ter o nome). Os filtros comparam ids; a pesquisa livre e as tags usam
// os nomes.

const toIds = (values: (string | undefined)[], kinds: TaxonomyKind[]): string[] => {
  const taxonomy = getTaxonomy()

  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value)).map((value) => taxonomy.id(value, kinds))),
  )
}

const toLabels = (values: (string | undefined)[], kinds?: TaxonomyKind[]): string[] => {
  const taxonomy = getTaxonomy()

  return values.filter((value): value is string => Boolean(value)).map((value) => taxonomy.label(value, kinds))
}

const skillKinds: TaxonomyKind[] = ['profile-subcategory', 'profile-category']

// Equivalencia definida pelo cliente para a pesquisa: a Categoria e o que o
// perfil guarda em coreSkills (as competencias principais) e a Sub-categoria
// e o que guarda em skills (a lista completa).
const buildSubCategories = (user: NetworkUser): string[] => toIds(user.profileData?.skills ?? [], skillKinds)

// Quem declara uma sub-categoria pertence tambem a categoria dela. Sem isto,
// filtrar por sub-categoria (que preenche a categoria a que pertence) nunca
// encontrava o perfil, a nao ser que essa categoria fosse mesmo uma das
// competencias principais.
const buildCategories = (user: NetworkUser, subCategories: string[]): string[] => {
  const { categoryBySubCategory } = getTaxonomy()
  const coreSkills = toIds(user.profileData?.coreSkills ?? [], ['profile-category', 'profile-subcategory'])

  const impliedBySubCategories = subCategories
    .map((subCategory) => categoryBySubCategory[subCategory])
    .filter(Boolean)

  return Array.from(new Set([...coreSkills, ...impliedBySubCategories]))
}

// Tudo o que o perfil declara sobre o que faz. E contra isto que a pesquisa
// livre compara, para alem do que se ve no cartao.
const buildTerms = (user: NetworkUser, categories: string[], subCategories: string[]): string[] => {
  const profileData = user.profileData

  return Array.from(
    new Set(
      [
        ...toLabels([...categories, ...subCategories]),
        ...toLabels(profileData?.services ?? [], ['service']),
        profileData?.otherService,
        profileData?.profession,
      ]
        .filter((term): term is string => Boolean(term))
        .map(normalizeLabelKey)
        .filter(Boolean),
    ),
  )
}

const buildTags = (user: NetworkUser): string[] => {
  const profileData = user.profileData

  const tags = [
    ...toLabels([profileData?.country], ['country']),
    ...toLabels([profileData?.city], ['city']),
    ...toLabels(profileData?.services ?? [], ['service']),
    ...toLabels(profileData?.coreSkills ?? [], skillKinds),
  ].filter(Boolean)

  return Array.from(new Set(tags))
}

const getProfileTitle = (user: NetworkUser): string => {
  const profileData = user.profileData

  return (
    profileData?.commercialName ||
    profileData?.artisticName ||
    user.name ||
    profileData?.username ||
    'Perfil'
  )
}

export const toProfileCardData = (user: NetworkUser, index: number): ProfileType => {
  const taxonomy = getTaxonomy()
  const profileData = user.profileData
  const country = normalizeCountryValue(profileData?.country)
  const city = profileData?.city ? taxonomy.id(profileData.city, ['city'], country || null) : ''

  // O perfil so guarda pais e cidade; a provincia e a da cidade.
  const province = taxonomy.ancestorOfKind(taxonomy.byId.get(city), 'region')?.id ?? ''

  // Individual, ou o sub-tipo da conta de empresa (empresa, festival, instituicao).
  const type = getProfileTypeId(profileData)

  const subCategories = buildSubCategories(user)
  const categories = buildCategories(user, subCategories)

  return {
    id: user.id ?? user._id ?? user.email ?? `user-${index}`,
    title: getProfileTitle(user),
    tags: buildTags(user),
    bio: profileData?.bio,
    cover: profileData?.imageUrl || user.imageUrl || fallbackProfileImage,
    country,
    province,
    city,
    type,
    categories,
    subCategories,
    terms: buildTerms(user, categories, subCategories),
    username: profileData?.username,
  }
}

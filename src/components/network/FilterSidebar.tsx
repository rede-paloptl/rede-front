'use client'


import { useEffect, useState } from 'react'

import { SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Heading } from '../ui/heading'
import { Input } from '../ui/Input'
import { Select, withAllOption } from '../ui/select'
import type { ProfileTypeCounts } from './actions'
import { countriesList, normalizeLabelKey, SelectItemType } from './filters'
import {
  categoriesByType,
  citiesByCountryAndProvince,
  CountryCode,
  profileTypesList,
  provincesByCountry,
  sortByLabel,
  subCategoriesByType,
} from './data'

export type NetworkFilters = {
  search: string
  country: string
  province: string
  city: string
  type: string
  category: string
  subCategory: string
}

export const defaultNetworkFilters: NetworkFilters = {
  search: '',
  country: '',
  province: '',
  city: '',
  type: '',
  category: '',
  subCategory: '',
}

type NetworkFilterKey = keyof NetworkFilters

type FilterSidebarProps = {
  filters: NetworkFilters
  // Resultados por tipo; ausente enquanto os perfis nao carregam.
  typeCounts?: ProfileTypeCounts
  onFiltersChange: (filters: NetworkFilters) => void
  onClear: () => void
}

// Uma so implementacao para toda a rede: o value de uma opcao, o texto que
// vem da API e o que vem do URL tem de dar sempre a mesma chave.
export const normalizeNetworkValue = normalizeLabelKey

// Cada lista de origem já vem ordenada, mas juntar várias (todas as categorias,
// todas as cidades) devolveria um bloco alfabético por lista em vez de uma
// ordem só, por isso o resultado volta a ser ordenado aqui. O filter devolve um
// array novo, portanto o sort não mexe nas listas originais.
const uniqueOptions = (options: SelectItemType[]) => {
  const seen = new Set<string>()

  return options
    .filter((option) => {
      if (seen.has(option.value)) return false

      seen.add(option.value)
      return true
    })
    .sort(sortByLabel)
}

const optionMatches = (option: SelectItemType, value: string) => {
  const normalizedValue = normalizeNetworkValue(value)

  return (
    normalizeNetworkValue(option.value) === normalizedValue ||
    normalizeNetworkValue(option.label) === normalizedValue
  )
}

const countryAliases: Record<string, string> = {
  angola: 'angola',
  'cabo-verde': 'cabo-verde',
  'guine-bissau': 'guine-bissau',
  mocambique: 'mocambique',
  mozambique: 'mocambique',
  'sao-tome': 'sao-tome-e-principe',
  'sao-tome-e-principe': 'sao-tome-e-principe',
  'sao-tome-principe': 'sao-tome-e-principe',
  'timor-leste': 'timor-leste',
}

const findCountryByValue = (value: string) => {
  const normalizedValue = normalizeNetworkValue(value)
  const alias = countryAliases[normalizedValue]

  if (alias) {
    return countriesList.find((country) => country.value === alias)
  }

  return countriesList.find((country) => optionMatches(country, value))
}

const findProvinceParent = (provinceValue: string) => {
  const normalizedProvince = normalizeNetworkValue(provinceValue)

  for (const [country, provinces] of Object.entries(provincesByCountry)) {
    const province = provinces.find((item) =>
      optionMatches(item, normalizedProvince),
    )

    if (province) {
      return {
        country,
        province: province.value,
      }
    }
  }

  return null
}

const findCityParent = (cityValue: string) => {
  const normalizedCity = normalizeNetworkValue(cityValue)

  for (const [country, provinces] of Object.entries(
    citiesByCountryAndProvince,
  )) {
    for (const [province, cities] of Object.entries(provinces)) {
      const city = cities.find((item) => optionMatches(item, normalizedCity))

      if (city) {
        return {
          country,
          province,
          city: city.value,
        }
      }
    }
  }

  return null
}


const profileTypeValues = profileTypesList.map((item) => item.value)

// Ordena os tipos a percorrer pondo o tipo já escolhido em primeiro, para que
// um valor que exista em dois tipos (por exemplo "VFX", que é categoria de
// Empresa e de Profissionais) não faça saltar a escolha do utilizador.
const typesToSearch = (preferredType?: string) =>
  preferredType
    ? [
        preferredType,
        ...profileTypeValues.filter((type) => type !== preferredType),
      ]
    : profileTypeValues

const getCategoryOptions = (selectedType: string) =>
  categoriesByType[selectedType] ??
  uniqueOptions(
    profileTypeValues.flatMap((type) => categoriesByType[type] ?? []),
  )

const findCategoryParent = (
  categoryValue: string,
  preferredType?: string,
) => {
  for (const type of typesToSearch(preferredType)) {
    const category = (categoriesByType[type] ?? []).find((item) =>
      optionMatches(item, categoryValue),
    )

    if (category) {
      return {
        type,
        category: category.value,
      }
    }
  }

  return null
}

const getSubCategoryOptions = (
  selectedType: string,
  selectedCategory: string,
) => {
  if (selectedType && selectedCategory) {
    return subCategoriesByType[selectedType]?.[selectedCategory] ?? []
  }

  if (selectedType) {
    return uniqueOptions(
      Object.values(subCategoriesByType[selectedType] ?? {}).flat(),
    )
  }

  return uniqueOptions(
    profileTypeValues.flatMap((type) =>
      Object.values(subCategoriesByType[type] ?? {}).flat(),
    ),
  )
}

// Vai do mais específico para o mais genérico: primeiro dentro do par
// tipo/categoria já escolhido, depois dentro do tipo, e só então em tudo.
// Escolher uma sub-categoria preenche sozinho a categoria e o tipo a que
// pertence.
const findSubCategoryParent = (
  subCategoryValue: string,
  preferredType?: string,
  preferredCategory?: string,
) => {
  if (preferredType && preferredCategory) {
    const subCategory = (
      subCategoriesByType[preferredType]?.[preferredCategory] ?? []
    ).find((item) => optionMatches(item, subCategoryValue))

    if (subCategory) {
      return {
        type: preferredType,
        category: preferredCategory,
        subCategory: subCategory.value,
      }
    }
  }

  for (const type of typesToSearch(preferredType)) {
    const categoryMap = subCategoriesByType[type] ?? {}

    for (const [category, subCategories] of Object.entries(categoryMap)) {
      const subCategory = subCategories.find((item) =>
        optionMatches(item, subCategoryValue),
      )

      if (subCategory) {
        return {
          type,
          category,
          subCategory: subCategory.value,
        }
      }
    }
  }

  return null
}

const filterKeys: NetworkFilterKey[] = [
  'subCategory',
  'category',
  'type',
  'city',
  'province',
  'country',
]

export const getNetworkFiltersFromParams = (
  params: Partial<Record<NetworkFilterKey | 'tag', string>>,
): NetworkFilters => {
  const filters: NetworkFilters = { ...defaultNetworkFilters }

  const country = params.country
    ? findCountryByValue(params.country)
    : null

  if (country) {
    filters.country = country.value
  }

  if (params.province) {
    const provinceParent = findProvinceParent(params.province)

    if (provinceParent) {
      filters.country = provinceParent.country
      filters.province = provinceParent.province
    }
  }

  if (params.city) {
    const cityParent = findCityParent(params.city)

    if (cityParent) {
      filters.country = cityParent.country
      filters.province = cityParent.province
      filters.city = cityParent.city
    }
  }

  const type =
    params.type &&
    profileTypesList.find((item) => optionMatches(item, params.type ?? ''))

  if (type) {
    filters.type = type.value
  }

  if (params.category) {
    const categoryParent = findCategoryParent(params.category, filters.type)

    if (categoryParent) {
      filters.type = categoryParent.type
      filters.category = categoryParent.category
    }
  }

  if (params.subCategory) {
    const subCategoryParent = findSubCategoryParent(
      params.subCategory,
      filters.type,
      filters.category,
    )

    if (subCategoryParent) {
      filters.type = subCategoryParent.type
      filters.category = subCategoryParent.category
      filters.subCategory = subCategoryParent.subCategory
    }
  }

  if (params.search) {
    filters.search = params.search.trim()
  }

  if (params.tag) {
    const tagFilters = getNetworkFiltersFromTag(params.tag, filters)
    Object.assign(filters, tagFilters)
  }

  return filters
}

export const getNetworkFiltersFromTag = (
  tag: string,
  currentFilters: NetworkFilters = defaultNetworkFilters,
): Partial<NetworkFilters> => {
  const country = findCountryByValue(tag)

  if (country) {
    return { country: country.value }
  }

  const provinceParent = findProvinceParent(tag)

  if (provinceParent) {
    return {
      country: provinceParent.country,
      province: provinceParent.province,
    }
  }

  const cityParent = findCityParent(tag)

  if (cityParent) {
    return {
      country: cityParent.country,
      province: cityParent.province,
      city: cityParent.city,
    }
  }

  const type = profileTypesList.find((item) => optionMatches(item, tag))

  if (type) {
    return { type: type.value }
  }

  const categoryParent = findCategoryParent(tag, currentFilters.type)

  if (categoryParent) {
    return {
      type: categoryParent.type,
      category: categoryParent.category,
    }
  }

  const subCategoryParent = findSubCategoryParent(
    tag,
    currentFilters.type,
    currentFilters.category,
  )

  if (subCategoryParent) {
    return {
      type: subCategoryParent.type,
      category: subCategoryParent.category,
      subCategory: subCategoryParent.subCategory,
    }
  }

  return { search: tag }
}

export const getNetworkTagHref = (tag: string) => {
  const filters = getNetworkFiltersFromTag(tag)
  const entry = filterKeys.find((key) => filters[key])

  if (entry) {
    return `/network?${entry}=${encodeURIComponent(filters[entry] ?? '')}`
  }

  return `/network?tag=${encodeURIComponent(tag)}`
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  typeCounts,
  onFiltersChange,
  onClear,
}) => {
  const {
    search,
    country: selectedCountry,
    province: selectedProvince,
    city: selectedCity,
    type: selectedType,
    category: selectedCategory,
    subCategory: selectedSubCategory,
  } = filters

  const provinceOptions = selectedCountry
    ? provincesByCountry[selectedCountry as CountryCode] ?? []
    : uniqueOptions(Object.values(provincesByCountry).flat())

  const cityOptions =
    selectedCountry && selectedProvince
      ? citiesByCountryAndProvince[selectedCountry as CountryCode]?.[
          selectedProvince
        ] ?? []
      : selectedCountry
        ? uniqueOptions(
            Object.values(
              citiesByCountryAndProvince[selectedCountry as CountryCode] ?? {},
            ).flat(),
          )
        : uniqueOptions(
            Object.values(citiesByCountryAndProvince).flatMap((provinceMap) =>
              Object.values(provinceMap).flat(),
            ),
          )

  const categoryOptions = getCategoryOptions(selectedType)
  const subCategoryOptions = getSubCategoryOptions(
    selectedType,
    selectedCategory,
  )

  const hasSubCategories = subCategoryOptions.length > 0

  const typeOptions = withAllOption(
    typeCounts
      ? profileTypesList.map((option) => ({
          ...option,
          count: typeCounts.byType[option.value] ?? 0,
        }))
      : profileTypesList,
    'Todos os tipos',
    typeCounts?.total,
  )

  const categoryAllLabel =
    selectedType === 'profissionais'
      ? 'Todas as profissões'
      : 'Todas as categorias'

  const subCategoryPlaceholder = hasSubCategories
    ? 'Selecione a sub-categoria'
    : selectedCategory
      ? 'Esta categoria não tem sub-categorias'
      : 'Este tipo não tem sub-categorias'

  // O input responde a cada tecla, mas o filtro (e com ele o URL, o mapa e
  // a lista) so muda quando o utilizador faz uma pausa.
  const [searchDraft, setSearchDraft] = useState(search)
  const [appliedSearch, setAppliedSearch] = useState(search)

  // O input tem de acompanhar o filtro quando este muda por fora (limpar
  // filtros, clicar numa tag de um cartao). Ajustar durante o render, e nao
  // num efeito, evita o render extra com o valor antigo.
  if (search !== appliedSearch) {
    setAppliedSearch(search)
    setSearchDraft(search)
  }

  useEffect(() => {
    if (searchDraft === search) return

    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchDraft })
    }, 300)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft, search])

  const handleCountryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      country: value,
      province: '',
      city: '',
    })
  }

  const handleProvinceChange = (value: string) => {
    const provinceParent = findProvinceParent(value)

    onFiltersChange({
      ...filters,
      country: provinceParent?.country ?? filters.country,
      province: provinceParent?.province ?? value,
      city: '',
    })
  }

  const handleCityChange = (value: string) => {
    const cityParent = findCityParent(value)

    onFiltersChange({
      ...filters,
      country: cityParent?.country ?? filters.country,
      province: cityParent?.province ?? filters.province,
      city: cityParent?.city ?? value,
    })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value,
      category: '',
      subCategory: '',
    })
  }

  const handleCategoryChange = (value: string) => {
    const categoryParent = findCategoryParent(value, selectedType)

    onFiltersChange({
      ...filters,
      type: categoryParent?.type ?? selectedType,
      category: categoryParent?.category ?? value,
      // As sub-categorias sao as daquela categoria: mudar de categoria
      // invalida a que estivesse escolhida.
      subCategory: '',
    })
  }

  // Escolher a sub-categoria preenche a categoria e o tipo a que pertence.
  const handleSubCategoryChange = (value: string) => {
    const subCategoryParent = findSubCategoryParent(
      value,
      selectedType,
      selectedCategory,
    )

    onFiltersChange({
      ...filters,
      type: subCategoryParent?.type ?? selectedType,
      category: subCategoryParent?.category ?? selectedCategory,
      subCategory: subCategoryParent?.subCategory ?? value,
    })
  }

  const selectTriggerClassName =
    'w-full border-[1.3px] border-white px-3 text-rede-white outline-none'

  const selectPopoverClassName =
    'mt-2.5 max-w-[calc(100vw-2rem)] rounded-[8px] border-[1.3px] border-white px-3 text-rede-white outline-none sm:max-w-none'

  return (
    <aside className="flex h-auto w-full min-w-0 flex-col gap-6 px-4 py-6 sm:px-6 lg:w-82.75 lg:p-6">
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="flex w-full min-w-0 items-center lg:-mt-5">
          <Input
            placeholder="Pesquisar..."
            value={searchDraft}
            onChange={({ target }) => setSearchDraft(target.value)}
            className="h-10 w-full min-w-0 border-[1.3px] border-white bg-transparent px-3 text-rede-white outline-none placeholder:text-rede-white"
            icon={<SearchIcon size={18} className="text-rede-white" />}
            iconPosition="right"
            iconContainerClassName="h-10 w-10 shrink-0 border-[1.3px] border-white p-2.5"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Heading className="text-lg font-medium leading-7 text-rede-white sm:text-[20px]">
            País
          </Heading>

          <Select
            variant="primary"
            value={selectedCountry}
            placeholder="Selecione o país"
            options={withAllOption(countriesList, 'Todos os países')}
            triggerClassName={selectTriggerClassName}
            popoverClassName={selectPopoverClassName}
            satelliteClassName="border-[1.3px] border-white"
            onChange={handleCountryChange}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Heading className="text-lg font-medium leading-7 text-rede-white sm:text-[20px]">
            Província
          </Heading>

          <Select
            variant="primary"
            value={selectedProvince}
            placeholder="Selecione a província"
            options={withAllOption(provinceOptions, 'Todas as províncias')}
            triggerClassName={selectTriggerClassName}
            popoverClassName={selectPopoverClassName}
            satelliteClassName="border-[1.3px] border-white"
            onChange={handleProvinceChange}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Heading className="text-lg font-medium leading-7 text-rede-white sm:text-[20px]">
            Localidade/Cidade
          </Heading>

          <Select
            variant="primary"
            value={selectedCity}
            placeholder="Selecione a localidade"
            options={withAllOption(cityOptions, 'Todas as localidades')}
            triggerClassName={selectTriggerClassName}
            popoverClassName={selectPopoverClassName}
            satelliteClassName="border-[1.3px] border-white"
            onChange={handleCityChange}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Heading className="text-lg font-medium leading-7 text-rede-white sm:text-[20px]">
            Tipo
          </Heading>

          <Select
            variant="primary"
            value={selectedType}
            placeholder="Selecione o tipo"
            options={typeOptions}
            triggerClassName={selectTriggerClassName}
            popoverClassName={selectPopoverClassName}
            satelliteClassName="border-[1.3px] border-white"
            onChange={handleTypeChange}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Heading className="text-lg font-medium leading-7 text-rede-white sm:text-[20px]">
            Categoria
          </Heading>

          <Select
            variant="primary"
            value={selectedCategory}
            placeholder={categoryAllLabel}
            options={withAllOption(categoryOptions, categoryAllLabel)}
            triggerClassName={selectTriggerClassName}
            popoverClassName={selectPopoverClassName}
            satelliteClassName="border-[1.3px] border-white"
            onChange={handleCategoryChange}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Heading className="text-lg font-medium leading-7 text-rede-white sm:text-[20px]">
            Sub-categoria
          </Heading>

          <Select
            variant="primary"
            value={selectedSubCategory}
            placeholder={subCategoryPlaceholder}
            disabled={!hasSubCategories}
            // Sem sub-categorias o campo fica desactivado e o placeholder
            // explica porque; um "Todas" ali seria enganador.
            options={
              hasSubCategories
                ? withAllOption(subCategoryOptions, 'Todas as sub-categorias')
                : []
            }
            triggerClassName={selectTriggerClassName}
            popoverClassName={selectPopoverClassName}
            satelliteClassName="border-[1.3px] border-white"
            onChange={handleSubCategoryChange}
          />
        </div>

        <div className="mt-3 flex w-full gap-2 sm:mt-5">
          <Button
            containerClassName="w-full"
            variant="primary"
            onClick={onClear}
          >
            Limpar filtros
          </Button>
        </div>
      </div>
    </aside>
  )
}
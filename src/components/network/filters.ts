import { normalizeText } from '@/lib/utils'
import { getTaxonomy } from '@/lib/taxonomy'

// As listas (países, províncias, cidades, categorias, ...) vêm da API e são
// geridas no painel, em Configurações: ver lib/taxonomy.ts.
export type { SelectItemType } from '@/lib/taxonomy'

// O mesmo sitio pode chegar de formas diferentes: o id do termo, o slug
// antigo ('mocambique'), o texto da API ('Moçambique') ou variantes sem acento
// ('Guine-Bissau'). A chave normalizada faz com que todas cheguem ao mesmo sitio.
export const normalizeLabelKey = (value: string): string =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const getCountryLabel = (value?: string): string => getTaxonomy().label(value, ['country'])

// O pais chega em varias formas conforme a origem do registo (id, 'Mocambique',
// 'Mozambique', 'Guinea-Bissau'). Devolve sempre o id do termo; um pais
// desconhecido devolve a propria chave normalizada, para os dados antigos nao
// desaparecerem dos filtros.
const countryValueAliases: Record<string, string> = {
  'cape-verde': 'cabo-verde',
  'guinea-bissau': 'guine-bissau',
  mozambique: 'mocambique',
  'sao-tome': 'sao-tome-e-principe',
  'sao-tome-principe': 'sao-tome-e-principe',
  'sao-tome-and-principe': 'sao-tome-e-principe',
  'east-timor': 'timor-leste',
}

export const normalizeCountryValue = (value?: string): string => {
  if (!value) return ''

  const taxonomy = getTaxonomy()
  const direct = taxonomy.find(value, ['country'])
  if (direct) return direct.id

  const key = normalizeLabelKey(value)
  const alias = countryValueAliases[key]

  return (alias && taxonomy.find(alias, ['country'])?.id) || key
}

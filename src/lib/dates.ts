const shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const parseIsoDate = (value?: string) => {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null

  return { year: match[1], month: Number(match[2]) - 1, day: Number(match[3]) }
}

/**
 * A API guarda as datas em ISO (yyyy-mm-dd). Formatamos à mão, e não com Intl,
 * para servidor e browser devolverem exactamente o mesmo texto. Um valor que
 * não seja ISO (texto antigo, ex: "Agosto") passa tal como está.
 */
export function formatShortDate(value?: string) {
  const date = parseIsoDate(value)
  if (!date) return value ?? ''

  return `${date.day} ${shortMonths[date.month]} ${date.year}`
}

/** "2026-02-05" -> "Fev de 2026", como os cartões da newsletter mostram. */
export function formatMonthOfYear(value?: string) {
  const date = parseIsoDate(value)
  if (!date) return value ?? ''

  return `${shortMonths[date.month]} de ${date.year}`
}

export const formatPeriod = (startDate?: string, endDate?: string) =>
  [formatShortDate(startDate), formatShortDate(endDate)].filter(Boolean).join(' - ')

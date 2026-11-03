const pluralRules = new Intl.PluralRules('ru-RU')
// Неразрывный пробел: «1 500 ₽» и «1 ч» не разрываются переносом.
const NBSP = String.fromCharCode(160)
const rubles = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

/** Форма слова для числа: [1 пространство, 2 пространства, 5 пространств]. */
export function plural(count: number, forms: [one: string, few: string, many: string]): string {
  const rule = pluralRules.select(count)
  const word = rule === 'one' ? forms[0] : rule === 'few' ? forms[1] : forms[2]
  return `${count} ${word}`
}

export function formatRubles(amount: number): string {
  return `${rubles.format(amount)}${NBSP}₽`
}

/** Цена часа помещения; null — пространство называет её по запросу. */
export function formatPricePerHour(amount: number | null): string {
  return amount === null ? 'по запросу' : `${formatRubles(amount)}/час`
}

/** 90 → «1 ч 30 мин». */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) {
    return `${rest}${NBSP}мин`
  }
  return rest === 0 ? `${hours}${NBSP}ч` : `${hours}${NBSP}ч ${rest}${NBSP}мин`
}

/** Адрес в API — без города, город приходит отдельно. */
export function formatAddress(space: { city: { name: string }, address: string }): string {
  const address = space.address.trim()
  return address ? `${space.city.name}, ${address}` : space.city.name
}

/** Две буквы для аватара без фото. */
export function nameInitials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
  return letters || '?'
}

/** +79990000002 → «+7 999 000-00-02»; остальное — как ввёл специалист. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const match = /^[78](\d{3})(\d{3})(\d{2})(\d{2})$/.exec(digits)
  return match ? `+7 ${match[1]} ${match[2]}-${match[3]}-${match[4]}` : phone
}

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

/** Ссылки пишут специалисты, поэтому пускаем только http и https. */
export function safeExternalUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

/** Подпись ссылки без протокола и www: vk.com/ivan_drums. */
export function externalLinkLabel(url: URL): string {
  const host = url.hostname.replace(/^www\./, '')
  let path = url.pathname
  try {
    path = decodeURI(path)
  } catch {
    // Битая кодировка в ссылке — покажем как есть.
  }
  const label = `${host}${path.replace(/\/+$/, '')}`
  return label.length > 48 ? `${label.slice(0, 47)}…` : label
}

/** Обрезка по слову для description в метатегах. */
export function excerpt(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) {
    return flat
  }
  const cut = flat.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:—-]+$/, '')}…`
}

import type { SpaceHour } from '#shared/types/site'

// Тонкие пробелы вокруг тире в «10:00 – 22:00».
const THIN = String.fromCharCode(0x2009)

export interface OpeningHoursRow {
  weekday: number
  name: string
  text: string
  closed: boolean
}

/**
 * Неделя с понедельника. Дня нет в списке — выходной. Закрытие не позже
 * открытия — на следующий день, 00:00–00:00 — круглосуточно.
 */
export function openingHoursRows(hours: SpaceHour[]): OpeningHoursRow[] {
  return [1, 2, 3, 4, 5, 6, 7].map((weekday) => {
    const day = hours.find(hour => hour.weekday === weekday)
    const name = weekdayName(weekday)
    if (!day?.opens_at || !day.closes_at) {
      return { weekday, name, text: 'выходной', closed: true }
    }
    if (day.opens_at === day.closes_at) {
      return { weekday, name, text: 'круглосуточно', closed: false }
    }
    return { weekday, name, text: `${day.opens_at}${THIN}–${THIN}${day.closes_at}`, closed: false }
  })
}

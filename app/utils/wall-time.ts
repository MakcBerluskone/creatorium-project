/*
 * Время пространства приходит строками «2026-11-05 18:00» в его поясе.
 * Показываем как есть и в пояс браузера не переводим. Для арифметики
 * считаем такие строки «часами на стене» и складываем их в UTC, где нет
 * переходов на летнее время.
 */

const WEEKDAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

/** Название дня недели по ISO: 1 — понедельник. */
export function weekdayName(isoWeekday: number): string {
  return WEEKDAYS[isoWeekday - 1] ?? ''
}

/** Сегодняшняя дата YYYY-MM-DD в поясе пространства. */
export function todayInTimeZone(timeZone: string, now = new Date()): string {
  try {
    // en-CA форматирует дату как YYYY-MM-DD.
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  } catch {
    return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  }
}

function dateToUtc(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1))
}

function utcToDate(value: Date): string {
  return value.toISOString().slice(0, 10)
}

export function addDays(date: string, days: number): string {
  const value = dateToUtc(date)
  value.setUTCDate(value.getUTCDate() + days)
  return utcToDate(value)
}

/** День недели даты по ISO: 1 — понедельник, 7 — воскресенье. */
export function isoWeekdayOf(date: string): number {
  return ((dateToUtc(date).getUTCDay() + 6) % 7) + 1
}

const shortWeekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', timeZone: 'UTC' })
const dayMonth = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const longDate = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

/** Подписи для выбора дня: «ср», «5 нояб.». */
export function dayChipParts(date: string): { weekday: string, day: string } {
  const value = dateToUtc(date)
  return { weekday: shortWeekday.format(value), day: dayMonth.format(value).replace(/\.$/, '') }
}

/** «среда, 5 ноября». */
export function formatLongDate(date: string): string {
  return longDate.format(dateToUtc(date))
}

/** «2026-11-05 18:00» → «18:00». */
export function wallTime(value: string): string {
  return value.slice(11, 16)
}

/** Прибавить минуты к строке «YYYY-MM-DD HH:mm», не выходя из часов пространства. */
export function addMinutesToWall(value: string, minutes: number): string {
  const [date = '', time = '00:00'] = value.split(' ')
  const [h, m] = time.split(':').map(Number)
  const result = dateToUtc(date)
  result.setUTCMinutes((h ?? 0) * 60 + (m ?? 0) + minutes)
  return `${utcToDate(result)} ${result.toISOString().slice(11, 16)}`
}

export interface FreeWindow {
  from: string
  to: string
}

/**
 * Свободные окна из списка начал. У начал внутри одного окна общий конец:
 * начало + самая длинная бронь от него.
 */
export function freeWindows(slots: { starts_at: string, max_minutes: number }[]): FreeWindow[] {
  const windows: FreeWindow[] = []
  let lastEnd = ''
  for (const slot of slots) {
    const end = addMinutesToWall(slot.starts_at, slot.max_minutes)
    if (end !== lastEnd) {
      windows.push({ from: wallTime(slot.starts_at), to: wallTime(end) })
      lastEnd = end
    }
  }
  return windows
}

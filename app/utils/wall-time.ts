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

/** Сегодняшняя дата YYYY-MM-DD по часам браузера. */
export function todayLocal(now = new Date()): string {
  // en-CA форматирует дату как YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** Сегодняшняя дата YYYY-MM-DD в поясе пространства. */
export function todayInTimeZone(timeZone: string, now = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  } catch {
    return todayLocal(now)
  }
}

/** Сейчас «на стене» в поясе: «2026-11-05 18:42». Такие строки сравниваются как строки. */
export function nowInTimeZone(timeZone: string, now = new Date()): string {
  let parts: Intl.DateTimeFormatPart[]
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }
  try {
    parts = new Intl.DateTimeFormat('en-CA', { ...options, timeZone }).formatToParts(now)
  } catch {
    parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(now)
  }
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value ?? '00'
  return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')}`
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

/*
 * События. Начало и конец — тоже «часы на стене» пространства. Год пишем,
 * только если он не текущий: афиша — на полгода вперёд.
 */

// Тонкие пробелы вокруг тире в «19:00 – 22:00».
const THIN = String.fromCharCode(0x2009)
const weekdayShort = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', timeZone: 'UTC' })
const weekdayLong = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', timeZone: 'UTC' })
const dayMonthLong = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' })
const monthShort = new Intl.DateTimeFormat('ru-RU', { month: 'short', timeZone: 'UTC' })

/** «2026-11-20 19:00» → «2026-11-20». */
export function wallDate(value: string): string {
  return value.slice(0, 10)
}

/** «2026-11-20 19:00» → «2026-11-20T19:00»: ISO без пояса, для datetime и schema.org. */
export function wallToIso(value: string): string {
  return value.replace(' ', 'T').slice(0, 16)
}

function withYear(date: string, text: string): string {
  const year = date.slice(0, 4)
  return year === String(new Date().getFullYear()) ? text : `${text} ${year}`
}

/** «13 ноября», «8 января 2027». */
export function formatDayMonth(date: string): string {
  return withYear(date, dayMonthLong.format(dateToUtc(date)))
}

/** «пт, 13 ноября» или «пятница, 13 ноября». */
export function formatEventDay(date: string, weekday: 'short' | 'long' = 'short'): string {
  const value = dateToUtc(date)
  const name = (weekday === 'short' ? weekdayShort : weekdayLong).format(value)
  return `${name}, ${formatDayMonth(date)}`
}

/** «19:00 – 22:00»; кончается в другой день — «19:00 – 14 ноября, 02:00». */
export function formatEventTimeRange(startsAt: string, endsAt: string): string {
  const end = wallDate(endsAt) === wallDate(startsAt) ? wallTime(endsAt) : `${formatDayMonth(wallDate(endsAt))}, ${wallTime(endsAt)}`
  return `${wallTime(startsAt)}${THIN}–${THIN}${end}`
}

/** Листок календаря: «пт», «13», «нояб». */
export function dateTileParts(date: string): { weekday: string, day: string, month: string } {
  const value = dateToUtc(date)
  return {
    weekday: weekdayShort.format(value),
    day: String(value.getUTCDate()),
    month: monthShort.format(value).replace(/\.$/, '')
  }
}

export type EventDatePreset = 'today' | 'tomorrow' | 'weekend' | 'week'

/** Быстрые даты афиши от сегодняшнего дня: «с» и «по» включительно. */
export function eventDatePresets(today: string): Record<EventDatePreset, { from: string, to: string }> {
  const weekday = isoWeekdayOf(today)
  const tomorrow = addDays(today, 1)
  return {
    today: { from: today, to: today },
    tomorrow: { from: tomorrow, to: tomorrow },
    // В субботу выходные — с сегодня, в воскресенье — только сегодня.
    weekend: { from: weekday >= 6 ? today : addDays(today, 6 - weekday), to: addDays(today, 7 - weekday) },
    week: { from: today, to: addDays(today, 6) }
  }
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

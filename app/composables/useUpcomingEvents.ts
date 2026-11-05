import type { MaybeRefOrGetter } from 'vue'
import type { EventListItem } from '#shared/types/site'

// Самый западный пояс городов платформы. Если там событие уже кончилось,
// то в любом городе России тоже.
const WESTERNMOST_ZONE = 'Europe/Kaliningrad'

/**
 * Собранная страница показывает события на момент сборки. В браузере убираем
 * те, что уже кончились. Пояс площадки известен не везде: без него
 * сравниваем с самым западным поясом — прошедшее пропадёт на пару часов
 * позже, но будущее раньше времени не пропадёт никогда.
 *
 * До монтирования список не трогаем, чтобы он совпал с собранным HTML.
 */
export function useUpcomingEvents(
  events: MaybeRefOrGetter<EventListItem[] | undefined>,
  timeZone?: MaybeRefOrGetter<string | undefined>
) {
  const now = ref<Date | null>(null)
  onMounted(() => {
    now.value = new Date()
  })

  return computed(() => {
    const list = toValue(events) ?? []
    if (!now.value) {
      return list
    }
    const wall = nowInTimeZone(toValue(timeZone) || WESTERNMOST_ZONE, now.value)
    return list.filter(event => event.ends_at > wall)
  })
}

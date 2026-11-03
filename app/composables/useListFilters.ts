import type { LocationQuery, LocationQueryRaw } from 'vue-router'

function single(value: LocationQuery[string] | undefined): string {
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === 'string' ? first : ''
}

/**
 * Фильтры списка живут в query: ссылку на поиск можно отправить, а «назад»
 * в браузере возвращает прошлые фильтры. Смена фильтра сбрасывает страницу.
 */
export function useListFilters<Key extends string>(keys: readonly Key[]) {
  const route = useRoute()
  const router = useRouter()

  const filters = computed(() => {
    const result = {} as Record<Key, string>
    for (const key of keys) {
      result[key] = single(route.query[key]).trim()
    }
    return result
  })

  const page = computed(() => {
    const value = Number.parseInt(single(route.query.page), 10)
    return Number.isFinite(value) && value > 1 ? value : 1
  })

  const hasFilters = computed(() => keys.some(key => filters.value[key] !== ''))

  function buildQuery(patch: Partial<Record<Key | 'page', string | number | undefined>>): LocationQueryRaw {
    const merged: LocationQueryRaw = { ...route.query, ...patch }
    return Object.fromEntries(Object.entries(merged).filter(([key, value]) =>
      value !== undefined && value !== '' && !(key === 'page' && Number(value) <= 1)))
  }

  /** Поиск печатают по букве — такие шаги не копим в истории. */
  function setFilter(key: Key, value: string, options: { replace?: boolean } = {}) {
    const query = buildQuery({ [key]: value.trim() || undefined, page: undefined } as Partial<Record<Key | 'page', string>>)
    return options.replace ? router.replace({ query }) : router.push({ query })
  }

  function pageQuery(target: number): LocationQueryRaw {
    return buildQuery({ page: target > 1 ? target : undefined } as Partial<Record<Key | 'page', number>>)
  }

  function reset() {
    return router.push({ query: {} })
  }

  return { filters, page, hasFilters, setFilter, pageQuery, reset }
}

/** Строка поиска с задержкой: запрос уходит, когда человек перестал печатать. */
export function useDebouncedSearch(source: () => string, apply: (value: string) => void, delay = 400) {
  const input = ref(source())
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(input, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (value.trim() !== source()) {
        apply(value)
      }
    }, delay)
  })

  // «Назад» в браузере или сброс фильтров меняют query — подтягиваем поле.
  watch(source, (value) => {
    if (value !== input.value.trim()) {
      clearTimeout(timer)
      input.value = value
    }
  })

  onBeforeUnmount(() => clearTimeout(timer))

  return input
}

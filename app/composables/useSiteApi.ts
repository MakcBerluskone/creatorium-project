import type {
  Catalog,
  Collective,
  CollectiveListItem,
  CollectivesQuery,
  DaySlots,
  EventDetails,
  EventListItem,
  EventsQuery,
  Organizer,
  Paginated,
  Space,
  SpaceListItem,
  SpacesQuery,
  Specialist,
  SpecialistListItem,
  SpecialistsQuery,
  Wrapped
} from '#shared/types/site'

/** Пустые фильтры в запрос не отправляем: API и кеш видят один и тот же набор. */
function compactQuery<T extends object>(query: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== '')
  ) as Partial<T>
}

/**
 * Публичное API сайта, только GET и без авторизации. Вызывать в setup:
 * адрес API берётся из runtimeConfig.
 */
export function useSiteApi() {
  const { apiBase } = useRuntimeConfig().public

  const request = $fetch.create({
    baseURL: `${String(apiBase).replace(/\/+$/, '')}/api/site`,
    headers: { Accept: 'application/json' },
    // На сборке страниц запросов много: 429 и сбой сети переждём. В браузере
    // повторов нет — человек видит ошибку и кнопку «Повторить».
    retry: import.meta.server ? 3 : 0,
    retryDelay: 15_000,
    retryStatusCodes: [429, 502, 503, 504]
  })

  return {
    catalog: () => request<Wrapped<Catalog>>('/catalog').then(r => r.data),

    spaces: (query: SpacesQuery = {}, signal?: AbortSignal) =>
      request<Paginated<SpaceListItem>>('/spaces', { query: compactQuery(query), signal }),

    space: (id: number) => request<Wrapped<Space>>(`/spaces/${id}`).then(r => r.data),

    slots: (spaceId: number, roomId: number, date: string, signal?: AbortSignal) =>
      request<Wrapped<DaySlots>>(`/spaces/${spaceId}/rooms/${roomId}/slots`, { query: { date }, signal })
        .then(r => r.data),

    specialists: (query: SpecialistsQuery = {}, signal?: AbortSignal) =>
      request<Paginated<SpecialistListItem>>('/specialists', { query: compactQuery(query), signal }),

    specialist: (id: number) => request<Wrapped<Specialist>>(`/specialists/${id}`).then(r => r.data),

    collectives: (query: CollectivesQuery = {}, signal?: AbortSignal) =>
      request<Paginated<CollectiveListItem>>('/collectives', { query: compactQuery(query), signal }),

    collective: (id: number) => request<Wrapped<Collective>>(`/collectives/${id}`).then(r => r.data),

    events: (query: EventsQuery = {}, signal?: AbortSignal) =>
      request<Paginated<EventListItem>>('/events', { query: compactQuery(query), signal }),

    event: (id: number) => request<Wrapped<EventDetails>>(`/events/${id}`).then(r => r.data),

    organizer: (id: number) => request<Wrapped<Organizer>>(`/organizers/${id}`).then(r => r.data)
  }
}

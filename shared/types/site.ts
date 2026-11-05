import type { components, paths } from './api'

type Schemas = components['schemas']

export type Catalog = Schemas['CatalogResource']
export type City = Catalog['cities'][number]
export type SpaceType = Catalog['space_types'][number]
export type Specialization = Catalog['specializations'][number]
export type EventType = Catalog['event_types'][number]

export type Photo = Schemas['PhotoResource']
export type SpaceListItem = Schemas['SpaceListItemResource']
export type Space = Schemas['SpaceResource']
export type Room = Space['rooms'][number]
export type SpaceHour = Schemas['SpaceHourResource']
export type DaySlots = Schemas['DaySlotsResource']
export type Slot = DaySlots['slots'][number]

export type SpecialistListItem = Schemas['SpecialistListItemResource']
export type Specialist = Schemas['SpecialistResource']

// Не Event: это имя занято событиями DOM.
export type EventListItem = Schemas['EventListItemResource']
export type EventDetails = Schemas['EventResource']
export type EventParticipant = EventDetails['participants'][number]
export type Organizer = Schemas['OrganizerResource']

export type Sitemap = Schemas['SitemapResource']

export type SpacesQuery = NonNullable<paths['/spaces']['get']['parameters']['query']>
export type SpecialistsQuery = NonNullable<paths['/specialists']['get']['parameters']['query']>
export type EventsQuery = NonNullable<paths['/events']['get']['parameters']['query']>

/** Обёртка ресурса Laravel: ответ лежит в data. */
export interface Wrapped<T> {
  data: T
}

/**
 * Страница списка Laravel. В OpenAPI описан только data, meta дописываем сами —
 * из неё нужны номер страницы, число страниц и всего записей.
 */
export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  }
}

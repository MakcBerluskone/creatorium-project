import type { components, paths } from './api'

type Schemas = components['schemas']

export type Catalog = Schemas['CatalogResource']
export type City = Catalog['cities'][number]
export type SpaceType = Catalog['space_types'][number]
export type Specialization = Catalog['specializations'][number]
export type CollectiveKindItem = Catalog['collective_kinds'][number]
export type EventType = Catalog['event_types'][number]
/** Категория моделей техники: Звук, Свет, Барабаны и перкуссия… — коды заданы в API. */
export type EquipmentCategory = Catalog['equipment_categories'][number]

export type Photo = Schemas['PhotoResource']
export type SpaceListItem = Schemas['SpaceListItemResource']
export type Space = Schemas['SpaceResource']
export type Room = Space['rooms'][number]
/** Доп. оборудование площадки: название от модели, примечание площадки, фото — своё или модели. */
export type SpaceEquipmentItem = Space['equipment'][number]
export type SpaceHour = Schemas['SpaceHourResource']
export type DaySlots = Schemas['DaySlotsResource']
export type Slot = DaySlots['slots'][number]

export type SpecialistListItem = Schemas['SpecialistListItemResource']
export type Specialist = Schemas['SpecialistResource']

/** Вид коллектива: band, team, production. Список задан в API кодом, а не справочником. */
export type CollectiveKind = Schemas['CollectiveKind']
export type CollectiveListItem = Schemas['CollectiveListItemResource']
export type Collective = Schemas['CollectiveResource']
export type CollectiveMember = Collective['members'][number]

// Не Event: это имя занято событиями DOM.
export type EventListItem = Schemas['EventListItemResource']
export type EventDetails = Schemas['EventResource']
export type EventParticipant = EventDetails['participants'][number]
export type Organizer = Schemas['OrganizerResource']

export type RentalListItem = Schemas['RentalListItemResource']
/** Позиция техники, где нашлась строка поиска: приходит только при поиске. */
export type RentalMatch = NonNullable<RentalListItem['matches']>[number]
export type Rental = Schemas['RentalResource']
/** Категория техники проката с позициями: Звук, Свет, Барабаны и перкуссия… */
export type RentalEquipmentGroup = Rental['equipment'][number]
/** Позиция техники проката: название от модели, примечание проката, фото — своё или модели. */
export type RentalEquipmentItem = RentalEquipmentGroup['items'][number]
export type RentalService = Rental['services'][number]

export type Sitemap = Schemas['SitemapResource']

export type SpacesQuery = NonNullable<paths['/spaces']['get']['parameters']['query']>
export type SpecialistsQuery = NonNullable<paths['/specialists']['get']['parameters']['query']>
export type CollectivesQuery = NonNullable<paths['/collectives']['get']['parameters']['query']>
export type EventsQuery = NonNullable<paths['/events']['get']['parameters']['query']>
export type RentalsQuery = NonNullable<paths['/rentals']['get']['parameters']['query']>

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

<script setup lang="ts">
import type { EventParticipant } from '#shared/types/site'
import { CalendarDays, ChevronRight, ExternalLink, MapPin, Ticket, Users } from '@lucide/vue'

definePageMeta({
  validate: route => /^\d+$/.test(String(route.params.id))
})

const route = useRoute()
const id = Number(route.params.id)
const api = useSiteApi()
const links = useSiteLinks()

const notFound = {
  statusCode: 404,
  statusMessage: 'Event not found',
  data: {
    title: 'Событие не найдено',
    text: 'Возможно, его отменили или сняли с афиши. Посмотрите другие события на афише.',
    link: { label: 'Открыть афишу', to: '/events' }
  },
  fatal: true
}

// Данные пришли из API уже в браузере, а не со сборки: сверять их незачем.
let loadedInBrowser = false

// Как у пространства: данные со сборки, а новые события — из браузера через 200.html.
const { data: event, error, refresh } = await useAsyncData(`event:${id}`, () => {
  loadedInBrowser = import.meta.client
  return api.event(id)
})

if (error.value) {
  if (apiErrorStatus(error.value) === 404) {
    throw createError(notFound)
  }
  // На сборке ошибка API должна остановить сборку, а не попасть в статику.
  if (import.meta.server) {
    throw createError({ statusCode: 502, statusMessage: 'Site API error', fatal: true })
  }
}

// Собранная страница — снимок на момент сборки, а событие могли отменить или оно
// уже прошло. В браузере тихо сверяемся с API: не ответил — остаётся собранное.
onMounted(async () => {
  if (loadedInBrowser || !event.value) {
    return
  }
  try {
    event.value = await api.event(id)
  } catch (e) {
    if (apiErrorStatus(e) === 404) {
      showError(notFound)
    }
  }
})

const past = computed(() => event.value?.is_past ?? false)
const day = computed(() => (event.value ? formatEventDay(wallDate(event.value.starts_at), 'long') : ''))
const time = computed(() => (event.value ? formatEventTimeRange(event.value.starts_at, event.value.ends_at) : ''))
const address = computed(() => (event.value ? formatAddress({ city: event.value.city, address: event.value.space.address }) : ''))
const ticketUrl = computed(() => (event.value?.ticket_url && !past.value ? safeExternalUrl(event.value.ticket_url)?.href : undefined))

interface Performer {
  key: string
  name: string
  /** Карточка специалиста открыта на сайте. */
  to?: string
  note?: string
  /** Для schema.org: человек или группа. */
  group: boolean
}

function performer(item: EventParticipant, index: number): Performer | null {
  if (item.specialist) {
    return {
      key: `s${index}`,
      name: item.specialist.name,
      to: item.specialist.id ? `/specialists/${item.specialist.id}` : undefined,
      note: item.specialist.specializations.join(', ') || undefined,
      group: false
    }
  }
  if (item.collective) {
    return { key: `c${index}`, name: item.collective, note: 'Коллектив', group: true }
  }
  if (item.name) {
    return { key: `n${index}`, name: item.name, group: true }
  }
  return null
}

const lineup = computed(() => (event.value?.participants ?? [])
  .map(performer)
  .filter((item): item is Performer => item !== null))

usePageSeo({
  title: () => {
    const e = event.value
    return e ? `${e.title} — ${formatDayMonth(wallDate(e.starts_at))}, ${e.city.name}` : 'Событие'
  },
  description: () => {
    const e = event.value
    if (!e) {
      return undefined
    }
    const facts = [
      `${e.type.name}, ${day.value}, ${wallTime(e.starts_at)}`,
      `${e.space.name}, ${address.value}`,
      e.entry,
      e.description
    ]
    return excerpt(facts.filter(Boolean).join('. '), 200)
  },
  image: () => event.value?.poster_url,
  type: 'article'
})

// Разметка Event для поисковиков. Пояса в ответе нет, поэтому время — местное, без смещения.
const jsonLd = computed(() => {
  const e = event.value
  if (!e) {
    return ''
  }
  const organizer = e.organizer
    ? { '@type': 'Organization', 'name': e.organizer.name, 'url': links.absolute(`/organizers/${e.organizer.id}`) }
    : { '@type': 'Organization', 'name': e.space.name, 'url': links.absolute(`/spaces/${e.space.id}`) }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': e.title,
    'url': links.absolute(`/events/${e.id}`),
    'startDate': wallToIso(e.starts_at),
    'endDate': wallToIso(e.ends_at),
    'eventStatus': 'https://schema.org/EventScheduled',
    'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
    'description': e.description ? excerpt(e.description, 500) : undefined,
    'image': e.poster_url ? [e.poster_url] : undefined,
    'location': {
      '@type': 'Place',
      'name': e.space.name,
      'url': links.absolute(`/spaces/${e.space.id}`),
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': e.space.address || undefined,
        'addressLocality': e.city.name,
        'addressCountry': 'RU'
      }
    },
    organizer,
    'performer': lineup.value.length
      ? lineup.value.map(p => ({
          '@type': p.group ? 'PerformingGroup' : 'Person',
          'name': p.name,
          'url': p.to ? links.absolute(p.to) : undefined
        }))
      : undefined,
    'offers': ticketUrl.value ? { '@type': 'Offer', 'url': ticketUrl.value } : undefined
  })
})

// Unhead сам экранирует «<» в JSON: закрывающий тег скрипта в описании разметку не сломает.
useHead({
  script: () => (jsonLd.value ? [{ key: 'event-jsonld', type: 'application/ld+json', innerHTML: jsonLd.value }] : [])
})

const factLabel = 'flex items-center gap-2 text-sm text-fg-muted'
</script>

<template>
  <div
    v-if="event"
    class="container-page flex flex-col gap-6 pt-6 pb-16 md:pt-8"
  >
    <nav aria-label="Навигация по разделам">
      <ol class="flex flex-wrap items-center gap-1 text-sm text-fg-muted">
        <li>
          <NuxtLink
            to="/events"
            class="hover:text-primary-text"
          >Афиша</NuxtLink>
        </li>
        <li aria-hidden="true">
          <ChevronRight class="size-3.5" />
        </li>
        <li>
          <NuxtLink
            :to="{ path: '/events', query: { type: event.type.slug } }"
            class="hover:text-primary-text"
          >{{ event.type.name }}</NuxtLink>
        </li>
      </ol>
    </nav>

    <!-- Телефон: название, когда и где, потом афиша. Шире — афиша слева, остальное справа. -->
    <div class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:grid-rows-[auto_auto_1fr] md:gap-x-10 lg:gap-x-12">
      <header class="flex flex-col gap-3 md:col-start-2 md:row-start-1">
        <p class="flex flex-wrap gap-2">
          <span class="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary-soft-fg">
            {{ event.type.name }}
          </span>
          <span
            v-if="past"
            class="rounded-full bg-surface-100 px-3 py-1 text-sm font-medium text-fg-muted"
          >Прошло</span>
        </p>
        <h1 class="font-display text-2xl leading-tight font-semibold text-balance md:text-4xl">
          {{ event.title }}
        </h1>
      </header>

      <div class="flex flex-col gap-4 md:col-start-2 md:row-start-2">
        <UiNotice
          v-if="past"
          tone="warn"
        >
          <p class="font-semibold">
            Событие прошло
          </p>
          <p>
            Ближайшие события —
            <NuxtLink
              to="/events"
              class="font-medium underline underline-offset-2"
            >на афише</NuxtLink>
          </p>
        </UiNotice>

        <dl class="flex flex-col divide-y divide-line rounded-card border border-line">
          <div class="flex flex-col gap-1 p-4">
            <dt :class="factLabel">
              <CalendarDays
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              Когда
            </dt>
            <dd
              class="text-lg font-semibold first-letter:uppercase"
              :class="past ? 'text-fg-muted' : 'text-fg'"
            >
              <time :datetime="wallToIso(event.starts_at)">{{ day }}</time>
            </dd>
            <dd class="text-fg">
              <span class="font-semibold tabular-nums">{{ time }}</span>
              <span class="text-sm text-fg-muted"> · время местное</span>
            </dd>
          </div>

          <div class="flex flex-col gap-1 p-4">
            <dt :class="factLabel">
              <MapPin
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              Где
            </dt>
            <dd>
              <NuxtLink
                :to="`/spaces/${event.space.id}`"
                class="font-semibold text-primary-text hover:underline"
              >{{ event.space.name }}</NuxtLink>
            </dd>
            <dd class="text-fg">
              Помещение «{{ event.room }}»
            </dd>
            <dd class="text-fg-muted">
              {{ address }}
            </dd>
          </div>

          <div
            v-if="event.entry"
            class="flex flex-col gap-1 p-4"
          >
            <dt :class="factLabel">
              <Ticket
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              Вход
            </dt>
            <dd class="font-semibold text-fg">
              {{ event.entry }}
            </dd>
          </div>

          <div class="flex flex-col gap-1 p-4">
            <dt :class="factLabel">
              <Users
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              Организатор
            </dt>
            <dd v-if="event.organizer">
              <NuxtLink
                :to="`/organizers/${event.organizer.id}`"
                class="group mt-1 flex items-center gap-3"
              >
                <OrganizerLogo
                  :name="event.organizer.name"
                  :src="event.organizer.logo_thumb_url"
                  class="size-10 [--logo-size:2.5rem]"
                />
                <span class="font-semibold text-primary-text group-hover:underline">{{ event.organizer.name }}</span>
              </NuxtLink>
            </dd>
            <dd
              v-else
              class="text-fg"
            >
              Событие пространства
            </dd>
          </div>
        </dl>

        <UiButton
          v-if="ticketUrl"
          :href="ticketUrl"
          target="_blank"
          rel="noopener nofollow"
          size="lg"
          block
        >
          Билеты
          <ExternalLink
            class="size-4"
            aria-hidden="true"
          />
        </UiButton>
      </div>

      <div class="md:col-start-1 md:row-span-3 md:row-start-1">
        <div
          class="flex flex-col gap-2 md:sticky md:top-24"
          :class="{ 'hidden md:flex': !event.poster_url }"
        >
          <div class="aspect-[4/5] overflow-hidden rounded-card bg-surface-100">
            <EventPoster
              :src="event.poster_url"
              :alt="`Афиша: ${event.title}`"
              :type="event.type.slug"
              eager
            />
          </div>
          <a
            v-if="event.poster_url"
            :href="event.poster_url"
            target="_blank"
            rel="noopener"
            class="self-start text-sm font-medium text-primary-text hover:underline"
          >Открыть афишу целиком</a>
        </div>
      </div>

      <div class="flex min-w-0 flex-col gap-10 pt-4 md:col-start-2 md:row-start-3">
        <section
          v-if="lineup.length"
          aria-labelledby="lineup-title"
          class="flex flex-col gap-3"
        >
          <h2
            id="lineup-title"
            class="font-display text-xl font-semibold"
          >
            Состав
          </h2>
          <ul class="flex flex-col divide-y divide-line">
            <li
              v-for="item in lineup"
              :key="item.key"
              class="relative flex items-center gap-3 py-3"
            >
              <SpecialistAvatar
                :name="item.name"
                class="size-11 [--avatar-size:2.75rem]"
              />
              <div class="flex min-w-0 flex-col">
                <NuxtLink
                  v-if="item.to"
                  :to="item.to"
                  class="font-semibold text-primary-text after:absolute after:inset-0 hover:underline"
                >{{ item.name }}</NuxtLink>
                <span
                  v-else
                  class="font-semibold text-fg"
                >{{ item.name }}</span>
                <span
                  v-if="item.note"
                  class="text-sm text-fg-muted"
                >{{ item.note }}</span>
              </div>
            </li>
          </ul>
        </section>

        <section
          v-if="event.description"
          aria-labelledby="about-title"
          class="flex flex-col gap-3"
        >
          <h2
            id="about-title"
            class="font-display text-xl font-semibold"
          >
            О событии
          </h2>
          <p class="max-w-prose text-[1.0625rem] leading-relaxed whitespace-pre-line text-fg">
            {{ event.description }}
          </p>
        </section>
      </div>
    </div>
  </div>

  <div
    v-else-if="error"
    class="container-page py-16"
  >
    <ListError
      :message="apiErrorMessage(error)"
      @retry="refresh()"
    />
  </div>
</template>

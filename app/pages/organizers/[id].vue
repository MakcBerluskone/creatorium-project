<script setup lang="ts">
import { ChevronRight, ExternalLink, MapPin, Send } from '@lucide/vue'

definePageMeta({
  validate: route => /^\d+$/.test(String(route.params.id))
})

const route = useRoute()
const id = Number(route.params.id)
const api = useSiteApi()

// Как у пространства: данные со сборки, а новые организаторы — из браузера через 200.html.
const { data: organizer, error, refresh } = await useAsyncData(`organizer:${id}`, () => api.organizer(id))

if (error.value) {
  if (apiErrorStatus(error.value) === 404) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Organizer not found',
      data: {
        title: 'Организатор не найден',
        text: 'Страница организатора видна, пока у него есть события на афише. Посмотрите другие события.',
        link: { label: 'Открыть афишу', to: '/events' }
      },
      fatal: true
    })
  }
  if (import.meta.server) {
    throw createError({ statusCode: 502, statusMessage: 'Site API error', fatal: true })
  }
}

const events = useUpcomingEvents(() => organizer.value?.events)

const links = computed(() => (organizer.value?.links ?? [])
  .map(safeExternalUrl)
  .filter((url): url is URL => url !== null))

const telegram = computed(() => organizer.value?.telegram?.replace(/^@/, '') || null)
const hasContacts = computed(() => !!(telegram.value || links.value.length))

usePageSeo({
  title: () => {
    const o = organizer.value
    if (!o) {
      return 'Организатор'
    }
    return `${o.name} — организатор событий${o.city ? `, ${o.city.name}` : ''}`
  },
  description: () => {
    const o = organizer.value
    if (!o) {
      return undefined
    }
    return excerpt(o.about || `Ближайшие события организатора «${o.name}» на афише Креаториума.`, 200)
  },
  image: () => organizer.value?.logo_url,
  type: 'profile'
})

const contactClass = 'flex items-center gap-3 rounded-control px-3 py-2.5 text-fg transition-colors hover:bg-hover'
</script>

<template>
  <div
    v-if="organizer"
    class="container-page flex flex-col gap-8 pt-6 pb-16 md:pt-8"
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
        <li>Организатор</li>
      </ol>
    </nav>

    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
      <div class="flex min-w-0 flex-col gap-8">
        <header class="flex flex-col gap-5 sm:flex-row sm:items-center">
          <OrganizerLogo
            :name="organizer.name"
            :src="organizer.logo_url"
            :pixels="512"
            eager
            class="size-28 [--logo-size:7rem] sm:size-32 sm:[--logo-size:8rem]"
          />
          <div class="flex min-w-0 flex-col gap-2">
            <p class="text-sm font-medium text-fg-muted">
              Организатор событий
            </p>
            <h1 class="font-display text-2xl leading-tight font-semibold text-balance md:text-4xl">
              {{ organizer.name }}
            </h1>
            <p
              v-if="organizer.city"
              class="flex items-center gap-1.5 text-fg-muted"
            >
              <MapPin
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              {{ organizer.city.name }}
            </p>
          </div>
        </header>

        <section
          v-if="organizer.about"
          aria-labelledby="about-title"
          class="flex flex-col gap-3"
        >
          <h2
            id="about-title"
            class="font-display text-xl font-semibold"
          >
            Об организаторе
          </h2>
          <p class="max-w-prose text-[1.0625rem] leading-relaxed whitespace-pre-line text-fg">
            {{ organizer.about }}
          </p>
        </section>
      </div>

      <aside aria-labelledby="contacts-title">
        <div class="flex flex-col gap-3 rounded-card border border-line p-4 lg:sticky lg:top-24">
          <h2
            id="contacts-title"
            class="px-3 pt-1 font-display text-lg font-semibold"
          >
            Контакты
          </h2>
          <ul
            v-if="hasContacts"
            class="flex flex-col"
          >
            <li v-if="telegram">
              <a
                :href="`https://t.me/${encodeURIComponent(telegram)}`"
                target="_blank"
                rel="noopener"
                :class="contactClass"
              >
                <Send
                  class="size-4 shrink-0 text-fg-muted"
                  aria-hidden="true"
                />
                <span class="min-w-0 truncate">
                  <span class="sr-only">Telegram: </span>@{{ telegram }}
                </span>
              </a>
            </li>
            <li
              v-for="link in links"
              :key="link.href"
            >
              <a
                :href="link.href"
                target="_blank"
                rel="noopener nofollow ugc"
                :class="contactClass"
              >
                <ExternalLink
                  class="size-4 shrink-0 text-fg-muted"
                  aria-hidden="true"
                />
                <span class="min-w-0 truncate">{{ externalLinkLabel(link) }}</span>
              </a>
            </li>
          </ul>
          <p
            v-else
            class="px-3 pb-2 text-sm text-fg-muted"
          >
            Организатор не оставил контактов на сайте.
          </p>
        </div>
      </aside>
    </div>

    <section
      aria-labelledby="events-title"
      class="flex flex-col gap-6"
    >
      <h2
        id="events-title"
        class="font-display text-xl font-semibold md:text-2xl"
      >
        Ближайшие события
      </h2>
      <ul
        v-if="events.length"
        class="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <li
          v-for="item in events"
          :key="item.id"
        >
          <EventCard :event="item" />
        </li>
      </ul>
      <p
        v-else
        class="text-fg-muted"
      >
        Новых событий пока нет. Другие события —
        <NuxtLink
          to="/events"
          class="font-medium text-primary-text hover:underline"
        >на афише</NuxtLink>
      </p>
    </section>
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

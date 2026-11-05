<script setup lang="ts">
import { ChevronRight, MapPin } from '@lucide/vue'

definePageMeta({
  validate: route => /^\d+$/.test(String(route.params.id))
})

const route = useRoute()
const id = Number(route.params.id)
const api = useSiteApi()

// На сборке данные попадают в страницу. Если пространство одобрили после
// сборки, страница открывается через 200.html и грузит их уже в браузере.
const { data: space, error, refresh } = await useAsyncData(`space:${id}`, () => api.space(id))

if (error.value) {
  if (apiErrorStatus(error.value) === 404) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Space not found',
      data: {
        title: 'Пространство не найдено',
        text: 'Возможно, его скрыли или ссылка устарела. Посмотрите другие пространства в поиске.'
      },
      fatal: true
    })
  }
  // На сборке ошибка API должна остановить сборку, а не попасть в статику.
  if (import.meta.server) {
    throw createError({ statusCode: 502, statusMessage: 'Site API error', fatal: true })
  }
}

// Пояс пространства известен — прошедшие события убираем точно по его часам.
const events = useUpcomingEvents(() => space.value?.upcoming_events, () => space.value?.timezone)

const address = computed(() => (space.value ? formatAddress(space.value) : ''))
const cover = computed(() => space.value?.photos[0] ?? space.value?.rooms.find(r => r.photos[0])?.photos[0])
const hasHours = computed(() => (space.value?.hours.length ?? 0) > 0)

const seoDescription = computed(() => {
  const s = space.value
  if (!s) {
    return undefined
  }
  const prices = s.rooms.map(r => r.price_per_hour).filter((p): p is number => p !== null)
  const facts = [
    `${s.type.name}, ${formatAddress(s)}`,
    plural(s.rooms.length, ['помещение', 'помещения', 'помещений']) + (prices.length ? `, от ${formatRubles(Math.min(...prices))}/час` : ''),
    s.description ?? 'Свободное время и онлайн-бронь'
  ]
  return excerpt(facts.join('. '), 200)
})

usePageSeo({
  title: () => (space.value ? `${space.value.name} — ${space.value.city.name}` : 'Пространство'),
  description: seoDescription,
  image: () => cover.value?.url,
  type: 'article'
})
</script>

<template>
  <div v-if="space">
    <div class="container-page flex flex-col gap-6 pt-6 pb-10 md:pt-8 md:pb-16">
      <nav aria-label="Навигация по разделам">
        <ol class="flex flex-wrap items-center gap-1 text-sm text-fg-muted">
          <li>
            <NuxtLink
              to="/spaces"
              class="hover:text-primary-text"
            >Пространства</NuxtLink>
          </li>
          <li
            class="flex items-center gap-1"
            aria-hidden="true"
          >
            <ChevronRight class="size-3.5" />
          </li>
          <li>
            <NuxtLink
              :to="{ path: '/spaces', query: { type: space.type.slug } }"
              class="hover:text-primary-text"
            >{{ space.type.name }}</NuxtLink>
          </li>
        </ol>
      </nav>

      <header class="flex flex-col gap-2">
        <h1 class="font-display text-2xl leading-tight font-semibold text-balance md:text-4xl">
          {{ space.name }}
        </h1>
        <p class="flex items-start gap-1.5 text-fg-muted md:text-lg">
          <MapPin
            class="mt-1 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>{{ address }}</span>
        </p>
      </header>

      <SpaceGallery
        :photos="space.photos"
        :name="space.name"
        :type="space.type.slug"
      />

      <div class="mt-2 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div class="flex min-w-0 flex-col gap-12">
          <section
            v-if="space.description"
            aria-labelledby="about-title"
            class="flex flex-col gap-3"
          >
            <h2
              id="about-title"
              class="font-display text-xl font-semibold"
            >
              О пространстве
            </h2>
            <p class="max-w-prose text-[1.0625rem] leading-relaxed whitespace-pre-line text-fg">
              {{ space.description }}
            </p>
          </section>

          <section
            aria-labelledby="rooms-title"
            class="flex flex-col gap-4"
          >
            <h2
              id="rooms-title"
              class="font-display text-xl font-semibold"
            >
              Помещения
            </h2>
            <SpaceRoomCard
              v-for="room in space.rooms"
              :key="room.id"
              :room="room"
              :type="space.type.slug"
              :space-name="space.name"
            />
            <p
              v-if="space.rooms.length === 0"
              class="text-fg-muted"
            >
              Пространство ещё не добавило помещения.
            </p>
          </section>

          <section
            v-if="space.rooms.length"
            id="free-time"
            aria-labelledby="free-time-title"
            class="flex flex-col gap-4"
          >
            <div class="flex flex-col gap-1">
              <h2
                id="free-time-title"
                class="font-display text-xl font-semibold"
              >
                Свободное время
              </h2>
              <p class="text-fg-muted">
                Онлайн-бронь — на {{ plural(space.booking_horizon_days, ['день', 'дня', 'дней']) }} вперёд.
              </p>
            </div>
            <ClientOnly>
              <SpaceFreeTime :space="space" />
              <template #fallback>
                <div
                  class="h-64 animate-pulse rounded-card bg-muted"
                  aria-hidden="true"
                />
              </template>
            </ClientOnly>
          </section>

          <section
            aria-labelledby="hours-title"
            class="flex flex-col gap-4"
          >
            <h2
              id="hours-title"
              class="font-display text-xl font-semibold"
            >
              Часы работы
            </h2>
            <SpaceOpeningHours
              v-if="hasHours"
              :hours="space.hours"
              :timezone="space.timezone"
            />
            <p
              v-else
              class="text-fg-muted"
            >
              Пространство не указало часы работы — уточните их при брони.
            </p>
          </section>

          <section
            v-if="events.length"
            aria-labelledby="events-title"
            class="flex flex-col gap-4"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2
                id="events-title"
                class="font-display text-xl font-semibold"
              >
                События здесь
              </h2>
              <NuxtLink
                :to="{ path: '/events', query: { city: space.city.slug } }"
                class="text-sm font-medium text-primary-text hover:underline"
              >
                Афиша города
              </NuxtLink>
            </div>
            <ul class="grid gap-3 xl:grid-cols-2">
              <li
                v-for="item in events"
                :key="item.id"
              >
                <EventRow
                  :event="item"
                  hide-place
                  class="h-full"
                />
              </li>
            </ul>
          </section>
        </div>

        <aside
          class="hidden lg:block"
          aria-label="Бронь"
        >
          <div class="sticky top-24">
            <SpaceBookingPanel :space="space" />
          </div>
        </aside>
      </div>
    </div>

    <!-- Телефон: цена и кнопка всегда под рукой, у подвала полоса останавливается. -->
    <div class="sticky bottom-0 z-20 border-t border-line bg-panel/95 py-3 backdrop-blur lg:hidden">
      <div class="container-page flex flex-col gap-1">
        <SpaceBookingPanel
          :space="space"
          compact
        />
        <p
          v-if="space.requires_confirmation"
          class="text-xs text-fg-muted"
        >
          Бронь подтверждает пространство
        </p>
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

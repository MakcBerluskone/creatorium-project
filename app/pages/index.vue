<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

const api = useSiteApi()
const links = useSiteLinks()

// Главная собирается целиком на сборке: поисковикам видны виды, пространства, события и специалисты.
const [catalogResult, spacesResult, eventsResult, specialistsResult] = await Promise.all([
  useCatalog(),
  useAsyncData('home:spaces', () => api.spaces({ per_page: 8 })),
  useAsyncData('home:events', () => api.events({ per_page: 4 })),
  useAsyncData('home:specialists', () => api.specialists({ per_page: 4 }))
])

if (import.meta.server && (catalogResult.error.value || spacesResult.error.value || eventsResult.error.value || specialistsResult.error.value)) {
  throw createError({ statusCode: 502, statusMessage: 'Site API error', fatal: true })
}

const catalog = catalogResult.data
const spaces = computed(() => spacesResult.data.value?.data ?? [])
const spacesTotal = computed(() => spacesResult.data.value?.meta.total ?? 0)
const specialists = computed(() => specialistsResult.data.value?.data ?? [])
// Полоса собрана на день сборки: прошедшие события браузер уберёт сам.
const events = useUpcomingEvents(() => eventsResult.data.value?.data)
const heroPhotos = computed(() => spaces.value.filter(s => s.cover).slice(0, 3))

// Сетка 2×2: одно фото — на всю, два — по столбцу, три — крупное слева и два справа.
function heroCellClass(index: number): string {
  const count = heroPhotos.value.length
  if (count === 1) {
    return 'col-span-2 row-span-2'
  }
  return index === 0 || count === 2 ? 'row-span-2' : ''
}

usePageSeo({
  title: 'Репетиционные базы, студии и залы по часам',
  description: 'Репетиционные базы, студии звукозаписи, фотостудии и залы для событий по часам. Свободное время на странице пространства и онлайн-бронь. Афиша событий, карточки музыкантов, фотографов, ведущих и диджеев.',
  image: () => heroPhotos.value[0]?.cover?.url
})
</script>

<template>
  <div>
    <section class="border-b border-line bg-muted">
      <div class="container-page grid items-center gap-10 py-10 md:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:py-20">
        <div class="flex flex-col gap-6 md:gap-8">
          <div class="flex flex-col gap-4">
            <h1 class="font-display text-[1.75rem] leading-[1.15] font-semibold text-balance sm:text-4xl md:text-5xl">
              Репетиционные базы, студии и&nbsp;залы по&nbsp;часам
            </h1>
            <p class="max-w-xl text-lg text-fg-muted md:text-xl">
              Найдите помещение для репетиции, записи, съёмки или события, посмотрите свободное время и забронируйте онлайн.
            </p>
          </div>
          <HomeSearch :catalog="catalog" />
        </div>

        <div
          v-if="heroPhotos.length"
          class="hidden h-[26rem] grid-cols-2 grid-rows-2 gap-3 lg:grid"
          aria-hidden="true"
        >
          <div
            v-for="(space, index) in heroPhotos"
            :key="space.id"
            class="overflow-hidden rounded-card bg-surface-100"
            :class="heroCellClass(index)"
          >
            <UiPhoto
              v-if="space.cover"
              :photo="space.cover"
              alt=""
              sizes="(min-width: 1216px) 280px, 25vw"
              :eager="index === 0"
            />
          </div>
        </div>
      </div>
    </section>

    <div class="container-page flex flex-col gap-16 py-12 md:gap-24 md:py-20">
      <section
        aria-labelledby="types-title"
        class="flex flex-col gap-6"
      >
        <HomeSectionHeader
          id="types-title"
          title="Что ищете"
        />
        <HomeTypeTiles :types="catalog.space_types" />
      </section>

      <section
        aria-labelledby="spaces-title"
        class="flex flex-col gap-6"
      >
        <HomeSectionHeader
          id="spaces-title"
          title="Пространства"
          to="/spaces"
          :link-label="spacesTotal > spaces.length ? `Все ${spacesTotal}` : 'Все пространства'"
        >
          Фото, помещения и цены. Свободное время — на странице пространства.
        </HomeSectionHeader>

        <ul
          v-if="spaces.length"
          class="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:grid-cols-4"
        >
          <li
            v-for="space in spaces"
            :key="space.id"
            class="w-[80%] shrink-0 snap-start sm:w-auto"
          >
            <SpaceCard
              :space="space"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
            />
          </li>
        </ul>
        <p
          v-else
          class="text-fg-muted"
        >
          Пространства появятся здесь после проверки.
        </p>

        <UiButton
          to="/spaces"
          variant="secondary"
          class="self-start sm:hidden"
        >
          Все пространства
          <ArrowRight
            class="size-4"
            aria-hidden="true"
          />
        </UiButton>
      </section>

      <section
        v-if="events.length"
        aria-labelledby="events-title"
        class="flex flex-col gap-6"
      >
        <HomeSectionHeader
          id="events-title"
          title="Ближайшие события"
          to="/events"
          link-label="Вся афиша"
        >
          Концерты, джемы, мастер-классы и вечеринки в пространствах.
        </HomeSectionHeader>

        <ul class="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          <li
            v-for="event in events"
            :key="event.id"
            class="w-[80%] shrink-0 snap-start sm:w-auto"
          >
            <EventCard :event="event" />
          </li>
        </ul>

        <UiButton
          to="/events"
          variant="secondary"
          class="self-start sm:hidden"
        >
          Вся афиша
          <ArrowRight
            class="size-4"
            aria-hidden="true"
          />
        </UiButton>
      </section>

      <section
        aria-labelledby="specialists-title"
        class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-12"
      >
        <div class="flex flex-col gap-5">
          <h2
            id="specialists-title"
            class="font-display text-xl font-semibold md:text-2xl"
          >
            Специалисты
          </h2>
          <p class="text-fg-muted">
            Музыканты, вокалисты, звукорежиссёры, фотографы, ведущие и диджеи ведут на Креаториуме публичные карточки: чем занимаются, в каком городе и как связаться.
          </p>
          <ul
            class="flex flex-wrap gap-2"
            aria-label="Специализации"
          >
            <li
              v-for="item in catalog.specializations"
              :key="item.slug"
            >
              <NuxtLink
                :to="{ path: '/specialists', query: { specialization: item.slug } }"
                class="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-3.5 text-sm text-fg transition-colors hover:border-primary-300 hover:text-primary-text"
              >
                {{ item.name }}
                <span
                  v-if="item.specialists_count"
                  class="text-fg-muted"
                >{{ item.specialists_count }}</span>
              </NuxtLink>
            </li>
          </ul>
          <UiButton
            to="/specialists"
            variant="secondary"
            class="self-start"
          >
            Все специалисты
            <ArrowRight
              class="size-4"
              aria-hidden="true"
            />
          </UiButton>
        </div>

        <ul
          v-if="specialists.length"
          class="grid gap-4 sm:grid-cols-2"
        >
          <li
            v-for="specialist in specialists"
            :key="specialist.id"
          >
            <SpecialistCard
              :specialist="specialist"
              class="h-full"
            />
          </li>
        </ul>
      </section>

      <section
        aria-labelledby="join-title"
        class="flex flex-col gap-6"
      >
        <h2
          id="join-title"
          class="sr-only"
        >
          Участникам
        </h2>
        <div class="grid gap-4 md:grid-cols-2 md:gap-6">
          <HomeCtaCard
            title="Для пространств"
            to="/for-spaces"
            :href="links.spaceRegister"
            action="Зарегистрировать пространство"
          >
            Расписание помещений, онлайн-брони и брони по телефону в одной сетке, база клиентов. В первой версии бесплатно.
          </HomeCtaCard>
          <HomeCtaCard
            title="Для специалистов"
            to="/for-specialists"
            :href="links.specialistRegister"
            action="Создать карточку"
          >
            Свободное время пространств и онлайн-бронь, брони коллектива и публичная карточка на сайте.
          </HomeCtaCard>
        </div>
      </section>
    </div>
  </div>
</template>

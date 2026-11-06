<script setup lang="ts">
import { ChevronRight, ExternalLink, MapPin, Send, Users } from '@lucide/vue'

definePageMeta({
  validate: route => /^\d+$/.test(String(route.params.id))
})

const route = useRoute()
const id = Number(route.params.id)
const api = useSiteApi()

// Как у специалиста: данные со сборки, а новые коллективы — из браузера через 200.html.
const { data: collective, error, refresh } = await useAsyncData(`collective:${id}`, () => api.collective(id))

if (error.value) {
  if (apiErrorStatus(error.value) === 404) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Collective not found',
      data: {
        title: 'Коллектив не найден',
        text: 'Возможно, его страницу скрыли или ссылка устарела. Посмотрите другие коллективы.',
        link: { label: 'Все коллективы', to: '/collectives' }
      },
      fatal: true
    })
  }
  // На сборке ошибка API должна остановить сборку, а не попасть в статику.
  if (import.meta.server) {
    throw createError({ statusCode: 502, statusMessage: 'Site API error', fatal: true })
  }
}

const performances = useUpcomingEvents(() => collective.value?.upcoming_performances)
const membersCount = computed(() => plural(collective.value?.members.length ?? 0, ['участник', 'участника', 'участников']))

const links = computed(() => (collective.value?.links ?? [])
  .map(safeExternalUrl)
  .filter((url): url is URL => url !== null))

const telegram = computed(() => collective.value?.telegram?.replace(/^@/, '') || null)
const hasContacts = computed(() => !!(telegram.value || links.value.length))

usePageSeo({
  title: () => {
    const c = collective.value
    if (!c) {
      return 'Коллектив'
    }
    return `${c.name} — ${[c.kind.name, c.city?.name].filter(Boolean).join(', ')}`
  },
  description: () => {
    const c = collective.value
    if (!c) {
      return undefined
    }
    const head = [c.kind.name, c.city?.name, membersCount.value].filter(Boolean).join(', ')
    return excerpt([head, c.about || `Состав и ближайшие выступления коллектива «${c.name}» на Креаториуме`].join('. '), 200)
  },
  // Обложка крупнее логотипа и лучше смотрится в превью ссылки.
  image: () => collective.value?.photos[0]?.url ?? collective.value?.logo_url,
  type: 'profile'
})

const contactClass = 'flex items-center gap-3 rounded-control px-3 py-2.5 text-fg transition-colors hover:bg-hover'
</script>

<template>
  <div
    v-if="collective"
    class="container-page flex flex-col gap-8 pt-6 pb-16 md:pt-8"
  >
    <nav aria-label="Навигация по разделам">
      <ol class="flex flex-wrap items-center gap-1 text-sm text-fg-muted">
        <li>
          <NuxtLink
            to="/collectives"
            class="hover:text-primary-text"
          >Коллективы</NuxtLink>
        </li>
        <li aria-hidden="true">
          <ChevronRight class="size-3.5" />
        </li>
        <li>
          <NuxtLink
            :to="{ path: '/collectives', query: { kind: collective.kind.slug } }"
            class="hover:text-primary-text"
          >{{ collective.kind.name }}</NuxtLink>
        </li>
      </ol>
    </nav>

    <header class="flex flex-col gap-5 sm:flex-row sm:items-center">
      <OrganizerLogo
        :name="collective.name"
        :src="collective.logo_url"
        :pixels="512"
        eager
        class="size-28 [--logo-size:7rem] sm:size-32 sm:[--logo-size:8rem]"
      />
      <div class="flex min-w-0 flex-col gap-2">
        <p>
          <span class="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary-soft-fg">
            {{ collective.kind.name }}
          </span>
        </p>
        <h1 class="font-display text-2xl leading-tight font-semibold text-balance md:text-4xl">
          {{ collective.name }}
        </h1>
        <p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-fg-muted">
          <span
            v-if="collective.city"
            class="flex items-center gap-1.5"
          >
            <MapPin
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            {{ collective.city.name }}
          </span>
          <span class="flex items-center gap-1.5">
            <Users
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            {{ membersCount }}
          </span>
        </p>
      </div>
    </header>

    <SpaceGallery
      v-if="collective.photos.length"
      :photos="collective.photos"
      :name="collective.name"
      label="Фото коллектива"
    />

    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
      <div class="flex min-w-0 flex-col gap-10">
        <section
          v-if="collective.about"
          aria-labelledby="about-title"
          class="flex flex-col gap-3"
        >
          <h2
            id="about-title"
            class="font-display text-xl font-semibold"
          >
            О коллективе
          </h2>
          <p class="max-w-prose text-[1.0625rem] leading-relaxed whitespace-pre-line text-fg">
            {{ collective.about }}
          </p>
        </section>

        <section
          v-if="collective.members.length"
          aria-labelledby="members-title"
          class="flex flex-col gap-3"
        >
          <h2
            id="members-title"
            class="font-display text-xl font-semibold"
          >
            Состав
          </h2>
          <!-- Руководитель — первым, так отдаёт API. Закрытая карточка — без ссылки и без фото. -->
          <ul class="flex flex-col divide-y divide-line">
            <li
              v-for="(member, index) in collective.members"
              :key="member.id ?? `hidden-${index}`"
              class="relative flex items-center gap-3 py-3"
            >
              <SpecialistAvatar
                :name="member.name"
                :src="member.avatar_thumb_url"
                class="size-11 [--avatar-size:2.75rem]"
              />
              <div class="flex min-w-0 flex-col">
                <p class="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <NuxtLink
                    v-if="member.id"
                    :to="`/specialists/${member.id}`"
                    class="font-semibold text-primary-text after:absolute after:inset-0 hover:underline"
                  >{{ member.name }}</NuxtLink>
                  <span
                    v-else
                    class="font-semibold text-fg"
                  >{{ member.name }}</span>
                  <span
                    v-if="member.is_leader"
                    class="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-soft-fg"
                  >Руководитель</span>
                </p>
                <span
                  v-if="member.specializations.length"
                  class="text-sm text-fg-muted"
                >{{ member.specializations.join(', ') }}</span>
              </div>
            </li>
          </ul>
        </section>

        <section
          v-if="performances.length"
          aria-labelledby="performances-title"
          class="flex flex-col gap-4"
        >
          <h2
            id="performances-title"
            class="font-display text-xl font-semibold"
          >
            Ближайшие выступления
          </h2>
          <ul class="grid gap-3 xl:grid-cols-2">
            <li
              v-for="item in performances"
              :key="item.id"
            >
              <EventRow
                :event="item"
                class="h-full"
              />
            </li>
          </ul>
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
            Коллектив не оставил контактов на сайте.
          </p>
        </div>
      </aside>
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

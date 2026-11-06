<script setup lang="ts">
import { ChevronRight, ExternalLink, Mail, MapPin, Phone, Send } from '@lucide/vue'

definePageMeta({
  validate: route => /^\d+$/.test(String(route.params.id))
})

const route = useRoute()
const id = Number(route.params.id)
const api = useSiteApi()

// Как у площадки: данные со сборки, а новые карточки — из браузера через 200.html.
const { data: specialist, error, refresh } = await useAsyncData(`specialist:${id}`, () => api.specialist(id))

if (error.value) {
  if (apiErrorStatus(error.value) === 404) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Specialist not found',
      data: {
        title: 'Карточка не найдена',
        text: 'Возможно, специалист её скрыл или ссылка устарела. Посмотрите других специалистов в поиске.'
      },
      fatal: true
    })
  }
  if (import.meta.server) {
    throw createError({ statusCode: 502, statusMessage: 'Site API error', fatal: true })
  }
}

const specializations = computed(() => specialist.value?.specializations.map(s => s.name).join(', ') ?? '')
const performances = useUpcomingEvents(() => specialist.value?.upcoming_performances)

const links = computed(() => (specialist.value?.links ?? [])
  .map(safeExternalUrl)
  .filter((url): url is URL => url !== null))

const telegram = computed(() => specialist.value?.telegram?.replace(/^@/, '') || null)
const hasContacts = computed(() => !!(telegram.value || specialist.value?.phone || specialist.value?.email || links.value.length))

usePageSeo({
  title: () => {
    const s = specialist.value
    if (!s) {
      return 'Специалист'
    }
    return [s.name, [specializations.value, s.city?.name].filter(Boolean).join(', ')].filter(Boolean).join(' — ')
  },
  description: () => {
    const s = specialist.value
    if (!s) {
      return undefined
    }
    const head = [specializations.value, s.city?.name].filter(Boolean).join(', ')
    return excerpt([head, s.about ?? 'Карточка специалиста на Креаториуме'].filter(Boolean).join('. '), 200)
  },
  image: () => specialist.value?.avatar_url,
  type: 'profile'
})

const contactClass = 'flex items-center gap-3 rounded-control px-3 py-2.5 text-fg transition-colors hover:bg-hover'
</script>

<template>
  <div
    v-if="specialist"
    class="container-page flex flex-col gap-8 pt-6 pb-16 md:pt-8"
  >
    <nav aria-label="Навигация по разделам">
      <ol class="flex flex-wrap items-center gap-1 text-sm text-fg-muted">
        <li>
          <NuxtLink
            to="/specialists"
            class="hover:text-primary-text"
          >Специалисты</NuxtLink>
        </li>
        <template v-if="specialist.specializations[0]">
          <li aria-hidden="true">
            <ChevronRight class="size-3.5" />
          </li>
          <li>
            <NuxtLink
              :to="{ path: '/specialists', query: { specialization: specialist.specializations[0].slug } }"
              class="hover:text-primary-text"
            >{{ specialist.specializations[0].name }}</NuxtLink>
          </li>
        </template>
      </ol>
    </nav>

    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
      <div class="flex min-w-0 flex-col gap-8">
        <header class="flex flex-col gap-5 sm:flex-row sm:items-center">
          <SpecialistAvatar
            :name="specialist.name"
            :src="specialist.avatar_url"
            :pixels="512"
            eager
            class="size-28 [--avatar-size:7rem] sm:size-32 sm:[--avatar-size:8rem]"
          />
          <div class="flex min-w-0 flex-col gap-2">
            <h1 class="font-display text-2xl leading-tight font-semibold text-balance md:text-4xl">
              {{ specialist.name }}
            </h1>
            <ul
              v-if="specialist.specializations.length"
              class="flex flex-wrap gap-2"
              aria-label="Специализации"
            >
              <li
                v-for="item in specialist.specializations"
                :key="item.slug"
                class="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary-soft-fg"
              >
                {{ item.name }}
              </li>
            </ul>
            <p
              v-if="specialist.city"
              class="flex items-center gap-1.5 text-fg-muted"
            >
              <MapPin
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              {{ specialist.city.name }}
            </p>
          </div>
        </header>

        <section
          aria-labelledby="about-title"
          class="flex flex-col gap-3"
        >
          <h2
            id="about-title"
            class="font-display text-xl font-semibold"
          >
            О себе
          </h2>
          <p
            v-if="specialist.about"
            class="max-w-prose text-[1.0625rem] leading-relaxed whitespace-pre-line text-fg"
          >
            {{ specialist.about }}
          </p>
          <p
            v-else
            class="text-fg-muted"
          >
            Специалист пока ничего о себе не написал.
          </p>
        </section>

        <section
          v-if="specialist.collectives.length"
          aria-labelledby="collectives-title"
          class="flex flex-col gap-4"
        >
          <h2
            id="collectives-title"
            class="font-display text-xl font-semibold"
          >
            Коллективы
          </h2>
          <ul class="grid gap-3 sm:grid-cols-2">
            <li
              v-for="item in specialist.collectives"
              :key="item.id"
            >
              <NuxtLink
                :to="`/collectives/${item.id}`"
                class="group flex h-full items-center gap-3 rounded-card border border-line bg-panel p-3 transition-colors hover:border-line-strong"
              >
                <OrganizerLogo
                  :name="item.name"
                  :src="item.logo_thumb_url"
                  class="size-12 [--logo-size:3rem]"
                />
                <span class="flex min-w-0 flex-col">
                  <span class="truncate font-semibold text-fg group-hover:text-primary-text">{{ item.name }}</span>
                  <span class="text-sm text-fg-muted">{{ item.kind.name }}</span>
                </span>
              </NuxtLink>
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
            <li v-if="specialist.phone">
              <a
                :href="phoneHref(specialist.phone)"
                :class="contactClass"
              >
                <Phone
                  class="size-4 shrink-0 text-fg-muted"
                  aria-hidden="true"
                />
                <span class="tabular-nums"><span class="sr-only">Телефон: </span>{{ formatPhone(specialist.phone) }}</span>
              </a>
            </li>
            <li v-if="specialist.email">
              <a
                :href="`mailto:${specialist.email}`"
                :class="contactClass"
              >
                <Mail
                  class="size-4 shrink-0 text-fg-muted"
                  aria-hidden="true"
                />
                <span class="min-w-0 truncate"><span class="sr-only">Почта: </span>{{ specialist.email }}</span>
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
            Специалист не оставил контактов на сайте.
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

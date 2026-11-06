<script setup lang="ts">
import { CalendarCheck, CalendarRange, ChevronDown, ChevronRight, ExternalLink, Hourglass, MapPin, Package, Phone, Send, Undo2 } from '@lucide/vue'

definePageMeta({
  validate: route => /^\d+$/.test(String(route.params.id))
})

const route = useRoute()
const id = Number(route.params.id)
const api = useSiteApi()

// Как у площадки: данные со сборки, а новые прокаты — из браузера через 200.html.
const { data: rental, error, refresh } = await useAsyncData(`rental:${id}`, () => api.rental(id))

if (error.value) {
  if (apiErrorStatus(error.value) === 404) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Rental not found',
      data: {
        title: 'Прокат не найден',
        text: 'Возможно, его скрыли или ссылка устарела. Посмотрите другие прокаты звука и света.',
        link: { label: 'Все прокаты', to: '/rentals' }
      },
      fatal: true
    })
  }
  // На сборке ошибка API должна остановить сборку, а не попасть в статику.
  if (import.meta.server) {
    throw createError({ statusCode: 502, statusMessage: 'Site API error', fatal: true })
  }
}

const address = computed(() => (rental.value ? formatAddress(rental.value) : ''))
const gearCount = computed(() => rental.value?.gear.reduce((sum, group) => sum + group.items.length, 0) ?? 0)
const gearCountLabel = computed(() => plural(gearCount.value, ['позиция', 'позиции', 'позиций']))

// Бесплатные позиции в «от N ₽» не считаем.
const priceFrom = computed(() => {
  const prices = (rental.value?.gear ?? []).flatMap(group => group.items.map(item => item.price_per_day)).filter(price => price > 0)
  return prices.length ? Math.min(...prices) : null
})

const links = computed(() => (rental.value?.links ?? [])
  .map(safeExternalUrl)
  .filter((url): url is URL => url !== null))

const telegram = computed(() => rental.value?.telegram?.replace(/^@/, '') || null)
const telegramUrl = computed(() => (telegram.value ? `https://t.me/${encodeURIComponent(telegram.value)}` : null))
const hasContacts = computed(() => !!(rental.value?.phone || telegram.value || links.value.length))

// Заказ — в кабинете специалиста, организатора или площадки. Справа выбор раскрывается
// под кнопкой, на телефоне — в листе снизу.
const orderOpen = ref(false)
const orderSheetOpen = ref(false)
const orderNote = computed(() => `Заказ — в кабинете: выберите даты и технику, ${rental.value?.requires_confirmation ? 'прокат подтвердит' : 'подтверждение сразу'}.`)

const cancellation = computed(() => {
  const hours = rental.value?.cancellation_hours ?? 0
  return hours > 0
    ? `Бесплатная отмена — не позже чем за ${hours}${String.fromCharCode(160)}ч до начала аренды`
    : 'Бесплатная отмена — до начала аренды'
})

usePageSeo({
  title: () => (rental.value ? `${rental.value.name} — прокат звука и света, ${rental.value.city.name}` : 'Прокат'),
  description: () => {
    const r = rental.value
    if (!r) {
      return undefined
    }
    const facts = [
      `Прокат звука и света, ${address.value}`,
      gearCount.value ? gearCountLabel.value + (priceFrom.value !== null ? `, от ${formatRubles(priceFrom.value)}/сутки` : '') : '',
      r.description ?? 'Техника с ценами за сутки, залог, услуги и условия аренды'
    ]
    return excerpt(facts.filter(Boolean).join('. '), 200)
  },
  // Фото крупнее логотипа и лучше смотрится в превью ссылки.
  image: () => rental.value?.photos[0]?.url ?? rental.value?.logo_url,
  type: 'article'
})

const contactClass = 'flex items-center gap-3 rounded-control px-3 py-2.5 text-fg transition-colors hover:bg-hover'
// На узком телефоне — только значок, подпись — с sm.
const barContactClass = 'inline-flex size-11 items-center justify-center gap-2 rounded-control border border-line-strong bg-panel text-[0.9375rem] font-medium whitespace-nowrap text-fg transition-colors hover:border-fg-subtle hover:bg-hover sm:w-auto sm:px-5'
</script>

<template>
  <div v-if="rental">
    <div class="container-page flex flex-col gap-8 pt-6 pb-10 md:pt-8 md:pb-16">
      <nav aria-label="Навигация по разделам">
        <ol class="flex flex-wrap items-center gap-1 text-sm text-fg-muted">
          <li>
            <NuxtLink
              to="/rentals"
              class="hover:text-primary-text"
            >Прокат</NuxtLink>
          </li>
          <li aria-hidden="true">
            <ChevronRight class="size-3.5" />
          </li>
          <li>
            <NuxtLink
              :to="{ path: '/rentals', query: { city: rental.city.slug } }"
              class="hover:text-primary-text"
            >{{ rental.city.name }}</NuxtLink>
          </li>
        </ol>
      </nav>

      <header class="flex flex-col gap-5 sm:flex-row sm:items-center">
        <OrganizerLogo
          :name="rental.name"
          :src="rental.logo_url"
          :pixels="512"
          eager
          class="size-28 [--logo-size:7rem] sm:size-32 sm:[--logo-size:8rem]"
        />
        <div class="flex min-w-0 flex-col gap-2">
          <p>
            <span class="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary-soft-fg">
              Прокат звука и света
            </span>
          </p>
          <h1 class="font-display text-2xl leading-tight font-semibold text-balance md:text-4xl">
            {{ rental.name }}
          </h1>
          <p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-fg-muted">
            <span class="flex items-start gap-1.5">
              <MapPin
                class="mt-1 size-4 shrink-0"
                aria-hidden="true"
              />
              {{ address }}
            </span>
            <span
              v-if="gearCount"
              class="flex items-center gap-1.5"
            >
              <Package
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              {{ gearCountLabel }}
            </span>
          </p>
        </div>
      </header>

      <SpaceGallery
        v-if="rental.photos.length"
        :photos="rental.photos"
        :name="rental.name"
        label="Фото проката"
      />

      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div class="flex min-w-0 flex-col gap-12">
          <section
            v-if="rental.description"
            aria-labelledby="about-title"
            class="flex flex-col gap-3"
          >
            <h2
              id="about-title"
              class="font-display text-xl font-semibold"
            >
              О прокате
            </h2>
            <p class="max-w-prose text-[1.0625rem] leading-relaxed whitespace-pre-line text-fg">
              {{ rental.description }}
            </p>
          </section>

          <section
            id="gear"
            aria-labelledby="gear-title"
            class="flex flex-col gap-4"
          >
            <div class="flex flex-col gap-1">
              <h2
                id="gear-title"
                class="font-display text-xl font-semibold"
              >
                Техника
              </h2>
              <p
                v-if="gearCount"
                class="text-fg-muted"
              >
                Цены — за сутки аренды, оплата и залог — на месте.
              </p>
            </div>
            <RentalGear
              v-if="gearCount"
              :groups="rental.gear"
            />
            <p
              v-else
              class="text-fg-muted"
            >
              Прокат ещё не добавил технику — уточните, что есть, по контактам.
            </p>
          </section>

          <section
            v-if="rental.services.length"
            aria-labelledby="services-title"
            class="flex flex-col gap-4"
          >
            <h2
              id="services-title"
              class="font-display text-xl font-semibold"
            >
              Услуги
            </h2>
            <RentalServices :items="rental.services" />
          </section>

          <section
            v-if="rental.terms"
            aria-labelledby="terms-title"
            class="flex flex-col gap-3"
          >
            <h2
              id="terms-title"
              class="font-display text-xl font-semibold"
            >
              Условия аренды
            </h2>
            <p class="max-w-prose leading-relaxed whitespace-pre-line text-fg">
              {{ rental.terms }}
            </p>
          </section>
        </div>

        <aside aria-label="Заказ, контакты и правила">
          <div class="flex flex-col gap-5 rounded-card border border-line p-4 lg:sticky lg:top-24">
            <div class="flex flex-col gap-3">
              <UiButton
                size="lg"
                block
                :aria-expanded="orderOpen"
                aria-controls="rental-order-roles"
                @click="orderOpen = !orderOpen"
              >
                Заказать технику
                <ChevronDown
                  class="size-4 transition-transform"
                  :class="{ 'rotate-180': orderOpen }"
                  aria-hidden="true"
                />
              </UiButton>
              <RentalOrderRoles
                v-show="orderOpen"
                id="rental-order-roles"
                :rental-id="rental.id"
              />
              <p class="px-3 text-sm text-fg-muted">
                {{ orderNote }}
              </p>
            </div>

            <div class="flex flex-col gap-3 border-t border-line pt-4">
              <div class="flex flex-col gap-1 px-3">
                <h2 class="font-display text-lg font-semibold">
                  Контакты
                </h2>
                <p
                  v-if="hasContacts"
                  class="text-sm text-fg-muted"
                >
                  Заказать можно онлайн или напрямую у проката: позвоните или напишите.
                </p>
              </div>
              <ul
                v-if="hasContacts"
                class="flex flex-col"
              >
                <li v-if="rental.phone">
                  <a
                    :href="phoneHref(rental.phone)"
                    :class="contactClass"
                  >
                    <Phone
                      class="size-4 shrink-0 text-fg-muted"
                      aria-hidden="true"
                    />
                    <span class="tabular-nums"><span class="sr-only">Телефон: </span>{{ formatPhone(rental.phone) }}</span>
                  </a>
                </li>
                <li v-if="telegram && telegramUrl">
                  <a
                    :href="telegramUrl"
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
                Прокат не оставил контактов на сайте.
              </p>
            </div>

            <div class="flex flex-col gap-3 border-t border-line px-3 pt-4">
              <h2 class="text-sm font-semibold text-fg">
                Правила заказа
              </h2>
              <ul class="flex flex-col gap-3 pb-1 text-sm text-fg-muted">
                <li class="flex gap-2.5">
                  <component
                    :is="rental.requires_confirmation ? Hourglass : CalendarCheck"
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ rental.requires_confirmation ? 'Прокат подтверждает заказ вручную' : 'Заказ подтверждается сразу' }}</span>
                </li>
                <li class="flex gap-2.5">
                  <Undo2
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ cancellation }}</span>
                </li>
                <li class="flex gap-2.5">
                  <CalendarRange
                    class="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Заказ — не дальше чем на {{ plural(rental.order_horizon_days, ['день', 'дня', 'дней']) }} вперёд</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Телефон: техника длинным списком, заказ и звонок всегда под рукой. У подвала полоса останавливается. -->
    <div class="sticky bottom-0 z-20 border-t border-line bg-panel/95 py-3 backdrop-blur lg:hidden">
      <div class="container-page flex items-center justify-between gap-3">
        <p class="min-w-0 text-sm leading-tight text-fg-muted">
          <template v-if="priceFrom !== null">
            от <span class="text-base font-semibold text-fg">{{ formatRubles(priceFrom) }}</span>/сутки
          </template>
        </p>
        <div class="flex shrink-0 items-center gap-2">
          <a
            v-if="rental.phone"
            :href="phoneHref(rental.phone)"
            :class="barContactClass"
          >
            <Phone
              class="size-4"
              aria-hidden="true"
            />
            <span class="max-sm:sr-only">Позвонить</span>
          </a>
          <a
            v-else-if="telegramUrl"
            :href="telegramUrl"
            target="_blank"
            rel="noopener"
            :class="barContactClass"
          >
            <Send
              class="size-4"
              aria-hidden="true"
            />
            <span class="max-sm:sr-only">Написать в Telegram</span>
          </a>
          <UiButton
            aria-haspopup="dialog"
            @click="orderSheetOpen = true"
          >
            Заказать
          </UiButton>
        </div>
      </div>
    </div>
    <RentalOrderSheet
      v-model:open="orderSheetOpen"
      :rental-id="rental.id"
      :note="orderNote"
    />
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

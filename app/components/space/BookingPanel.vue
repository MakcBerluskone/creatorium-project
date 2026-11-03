<script setup lang="ts">
import type { Space } from '#shared/types/site'
import { CalendarCheck, Hourglass } from '@lucide/vue'

const props = defineProps<{
  space: Space
  /** Узкая полоса внизу экрана на телефоне. */
  compact?: boolean
}>()

const links = useSiteLinks()
const bookUrl = computed(() => links.bookSpace(props.space.id))

const priceFrom = computed(() => {
  const prices = props.space.rooms.map(r => r.price_per_hour).filter((p): p is number => p !== null)
  return prices.length ? Math.min(...prices) : null
})
</script>

<template>
  <div
    v-if="compact"
    class="flex items-center justify-between gap-4"
  >
    <p class="min-w-0 text-sm leading-tight text-fg-muted">
      <template v-if="priceFrom !== null">
        от <span class="text-base font-semibold text-fg">{{ formatRubles(priceFrom) }}</span>/час
      </template>
      <template v-else>
        Цена по запросу
      </template>
    </p>
    <UiButton :href="bookUrl">
      Забронировать
    </UiButton>
  </div>

  <div
    v-else
    class="flex flex-col gap-5 rounded-card border border-line p-5 shadow-card"
  >
    <div>
      <p class="text-sm text-fg-muted">
        {{ space.rooms.length > 1 ? 'Цена часа' : 'Цена' }}
      </p>
      <p class="text-2xl font-semibold text-fg">
        <template v-if="priceFrom !== null">
          {{ space.rooms.length > 1 ? 'от ' : '' }}{{ formatRubles(priceFrom) }}<span class="text-base font-normal text-fg-muted">/час</span>
        </template>
        <template v-else>
          по запросу
        </template>
      </p>
    </div>

    <UiButton
      :href="bookUrl"
      size="lg"
      block
    >
      Забронировать
    </UiButton>

    <ul class="flex flex-col gap-3 text-sm text-fg-muted">
      <li class="flex gap-2.5">
        <component
          :is="space.requires_confirmation ? Hourglass : CalendarCheck"
          class="mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <span v-if="space.requires_confirmation">
          Онлайн-бронь подтверждает пространство. До ответа время держится за вами, без ответа за сутки бронь отменится.
        </span>
        <span v-else>
          Онлайн-бронь сразу занимает время.
        </span>
      </li>
      <li>
        Бронь оформляется в кабинете специалиста. Если аккаунта ещё нет, его можно завести там же.
      </li>
    </ul>
  </div>
</template>

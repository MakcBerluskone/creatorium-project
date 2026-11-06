<script setup lang="ts">
import type { RentalListItem } from '#shared/types/site'
import { MapPin } from '@lucide/vue'

const props = defineProps<{
  rental: RentalListItem
}>()

const equipmentCount = computed(() => plural(props.rental.equipment_count, ['позиция', 'позиции', 'позиций']))
</script>

<template>
  <article class="group relative flex gap-4 rounded-card border border-line bg-panel p-4 transition-colors hover:border-line-strong sm:p-5">
    <!-- Логотипа нет — обложка: так карточка не остаётся с одними буквами. -->
    <div
      v-if="!rental.logo_thumb_url && rental.cover"
      class="size-16 shrink-0 overflow-hidden rounded-card border border-line bg-surface-100"
    >
      <UiPhoto
        :photo="rental.cover"
        :alt="rental.name"
        sizes="64px"
      />
    </div>
    <OrganizerLogo
      v-else
      :name="rental.name"
      :src="rental.logo_thumb_url"
      class="size-16 [--logo-size:4rem]"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <h3 class="text-lg leading-snug font-semibold text-fg">
        <NuxtLink
          :to="`/rentals/${rental.id}`"
          class="after:absolute after:inset-0 after:rounded-card group-hover:text-primary-text focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
        >
          {{ rental.name }}
        </NuxtLink>
      </h3>
      <p class="flex items-start gap-1.5 text-sm text-fg-muted">
        <MapPin
          class="mt-0.5 size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span>{{ formatAddress(rental) }}</span>
      </p>
      <p class="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.9375rem]">
        <!-- 0 — в каталоге есть бесплатная позиция: «от 0 ₽» не пишем. -->
        <span
          v-if="rental.price_from"
          class="text-fg"
        >
          от <span class="font-semibold">{{ formatRubles(rental.price_from) }}</span>/сутки
        </span>
        <span class="text-sm text-fg-muted">
          {{ rental.equipment_count ? equipmentCount : 'Техники пока нет' }}
        </span>
      </p>

      <div
        v-if="rental.matches?.length"
        class="mt-1.5 flex flex-col gap-1 rounded-control bg-muted px-3 py-2"
      >
        <p class="text-xs font-medium text-fg-muted">
          Нашлось в каталоге
        </p>
        <ul class="flex flex-col gap-1 text-sm">
          <li
            v-for="(match, index) in rental.matches"
            :key="index"
            class="flex items-baseline justify-between gap-3"
          >
            <!-- Строка могла найтись и в примечании проката: «XLR» — показываем его под моделью. -->
            <span class="flex min-w-0 flex-col">
              <span class="truncate text-fg">{{ match.display_name }}</span>
              <span
                v-if="match.note"
                class="line-clamp-2 text-xs wrap-break-word text-fg-muted"
              >{{ match.note }}</span>
            </span>
            <span class="shrink-0 font-medium whitespace-nowrap text-fg">{{ formatPricePerDay(match.price_per_day) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>

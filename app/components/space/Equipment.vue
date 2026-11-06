<script setup lang="ts">
import type { Equipment } from '#shared/types/site'

defineProps<{
  /** Порядок задаёт площадка, API отдаёт его как есть. */
  items: Equipment[]
}>()
</script>

<template>
  <ul class="flex flex-col divide-y divide-line rounded-card border border-line">
    <li
      v-for="(item, index) in items"
      :key="index"
      class="flex flex-col gap-0.5 px-3 py-3 sm:px-4"
    >
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <p class="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <span class="min-w-0 font-medium wrap-break-word text-fg">{{ item.name }}</span>
          <span class="text-sm whitespace-nowrap text-fg-muted">{{ formatPieces(item.quantity) }}</span>
        </p>
        <p class="text-[0.9375rem] font-semibold whitespace-nowrap text-fg">
          {{ formatEquipmentPrice(item.price, item.price_unit) }}
        </p>
      </div>
      <p
        v-if="item.description"
        class="text-sm leading-relaxed whitespace-pre-line wrap-break-word text-fg-muted"
      >
        {{ item.description }}
      </p>
    </li>
  </ul>
</template>

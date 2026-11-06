<script setup lang="ts">
import type { RentalService } from '#shared/types/site'

defineProps<{
  /** Порядок задаёт прокат, API отдаёт его как есть. */
  items: RentalService[]
}>()
</script>

<template>
  <ul class="flex flex-col divide-y divide-line rounded-card border border-line">
    <li
      v-for="service in items"
      :key="service.id"
      class="flex flex-col gap-0.5 px-3 py-3 sm:px-4"
    >
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <p class="min-w-0 font-medium wrap-break-word text-fg">
          {{ service.name }}
        </p>
        <p class="text-[0.9375rem] font-semibold whitespace-nowrap text-fg">
          {{ formatEquipmentPrice(service.price, service.price_unit) }}
        </p>
      </div>
      <p
        v-if="service.description"
        class="text-sm leading-relaxed whitespace-pre-line wrap-break-word text-fg-muted"
      >
        {{ service.description }}
      </p>
    </li>
  </ul>
</template>

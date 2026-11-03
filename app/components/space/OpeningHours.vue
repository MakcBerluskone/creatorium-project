<script setup lang="ts">
import type { SpaceHour } from '#shared/types/site'

const props = defineProps<{
  hours: SpaceHour[]
  timezone: string
}>()

const rows = computed(() => openingHoursRows(props.hours))

// «Сегодня» зависит от дня просмотра, а не сборки — считаем уже в браузере.
const today = ref<number | null>(null)
onMounted(() => {
  today.value = isoWeekdayOf(todayInTimeZone(props.timezone))
})
</script>

<template>
  <table class="w-full max-w-md text-[0.9375rem]">
    <caption class="sr-only">
      Часы работы по дням недели
    </caption>
    <tbody>
      <tr
        v-for="row in rows"
        :key="row.weekday"
        class="border-b border-line last:border-0"
        :class="{ 'font-semibold': row.weekday === today }"
      >
        <th
          scope="row"
          class="py-2.5 pr-4 text-left font-[inherit] text-fg"
        >
          {{ row.name }}
          <span
            v-if="row.weekday === today"
            class="ml-1.5 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-soft-fg"
          >сегодня</span>
        </th>
        <td
          class="py-2.5 text-right tabular-nums"
          :class="row.closed ? 'text-fg-muted' : 'text-fg'"
        >
          {{ row.text }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

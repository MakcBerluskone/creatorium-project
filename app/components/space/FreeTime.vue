<script setup lang="ts">
import type { DaySlots, Space } from '#shared/types/site'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const props = defineProps<{
  space: Space
}>()

const api = useSiteApi()

// Компонент живёт только в браузере (ClientOnly): «сегодня» — по часам площадки на момент просмотра.
const today = todayInTimeZone(props.space.timezone)
const tomorrow = addDays(today, 1)
const dates = Array.from({ length: props.space.booking_horizon_days + 1 }, (_, i) => addDays(today, i))

const roomId = ref(props.space.rooms[0]?.id ?? 0)
const date = ref(today)
const room = computed(() => props.space.rooms.find(r => r.id === roomId.value))

const slots = ref<DaySlots | null>(null)
const loading = ref(false)
const error = ref<unknown>(null)
let controller: AbortController | undefined

async function load() {
  if (!roomId.value) {
    return
  }
  controller?.abort()
  const current = new AbortController()
  controller = current
  loading.value = true
  error.value = null
  try {
    const result = await api.slots(props.space.id, roomId.value, date.value, current.signal)
    if (!current.signal.aborted) {
      slots.value = result
    }
  } catch (e) {
    if (!current.signal.aborted) {
      slots.value = null
      error.value = e
    }
  } finally {
    if (!current.signal.aborted) {
      loading.value = false
    }
  }
}

watch([roomId, date], load, { immediate: true })
onBeforeUnmount(() => controller?.abort())

const windows = computed(() => (slots.value ? freeWindows(slots.value.slots) : []))

const heading = computed(() => {
  const day = formatLongDate(date.value)
  return room.value && props.space.rooms.length > 1 ? `${day} · ${room.value.name}` : day
})

// Человек из другого пояса должен понимать, что время — не его.
const differentZone = Intl.DateTimeFormat().resolvedOptions().timeZone !== props.space.timezone
const note = `Время местное, по часам площадки${differentZone ? ` (${props.space.city.name})` : ''}. Выбрать время и забронировать можно в кабинете специалиста.`

function dayLabel(value: string) {
  const parts = dayChipParts(value)
  if (value === today) {
    return { ...parts, weekday: 'сегодня' }
  }
  if (value === tomorrow) {
    return { ...parts, weekday: 'завтра' }
  }
  return parts
}

const strip = useTemplateRef('strip')
function scrollStrip(direction: number) {
  strip.value?.scrollBy({ left: direction * strip.value.clientWidth * 0.8, behavior: 'smooth' })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <fieldset
      v-if="space.rooms.length > 1"
      class="flex flex-col gap-2"
    >
      <legend class="mb-2 text-sm font-medium text-fg">
        Зал
      </legend>
      <div class="flex flex-wrap gap-2">
        <label
          v-for="item in space.rooms"
          :key="item.id"
          class="cursor-pointer"
        >
          <input
            v-model="roomId"
            type="radio"
            name="free-time-room"
            :value="item.id"
            class="peer sr-only"
          >
          <span
            class="flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-fg transition-colors peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary-soft-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring hover:border-fg-subtle"
          >
            {{ item.name }}
          </span>
        </label>
      </div>
    </fieldset>

    <fieldset class="flex min-w-0 flex-col gap-2">
      <legend class="mb-2 text-sm font-medium text-fg">
        День
      </legend>
      <div class="relative flex items-center gap-2">
        <button
          type="button"
          class="hidden size-9 shrink-0 items-center justify-center rounded-full border border-line text-fg-muted hover:bg-hover hover:text-fg sm:flex"
          aria-label="Раньше"
          @click="scrollStrip(-1)"
        >
          <ChevronLeft
            class="size-4"
            aria-hidden="true"
          />
        </button>
        <div
          ref="strip"
          class="scrollbar-none relative -mx-1 flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto px-1 py-1"
        >
          <label
            v-for="value in dates"
            :key="value"
            class="shrink-0 cursor-pointer snap-start"
          >
            <input
              v-model="date"
              type="radio"
              name="free-time-date"
              :value="value"
              class="peer sr-only"
            >
            <span
              class="flex w-[4.5rem] flex-col items-center rounded-control border border-line-strong py-2 transition-colors peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary-soft-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring hover:border-fg-subtle"
            >
              <span class="text-xs text-fg-muted">{{ dayLabel(value).weekday }}</span>
              <span class="text-sm font-semibold">{{ dayLabel(value).day }}</span>
            </span>
          </label>
        </div>
        <button
          type="button"
          class="hidden size-9 shrink-0 items-center justify-center rounded-full border border-line text-fg-muted hover:bg-hover hover:text-fg sm:flex"
          aria-label="Позже"
          @click="scrollStrip(1)"
        >
          <ChevronRight
            class="size-4"
            aria-hidden="true"
          />
        </button>
      </div>
    </fieldset>

    <div
      class="flex flex-col gap-4 rounded-card bg-muted p-4 sm:p-5"
      aria-live="polite"
      :aria-busy="loading"
    >
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p class="font-semibold text-fg first-letter:uppercase">
          {{ heading }}
        </p>
        <p
          v-if="room"
          class="text-sm text-fg-muted"
        >
          Бронь от {{ formatDuration(slots?.min_minutes ?? room.min_booking_minutes) }}
        </p>
      </div>

      <div
        v-if="loading && !slots"
        class="flex animate-pulse flex-wrap gap-2"
        aria-hidden="true"
      >
        <span
          v-for="n in 10"
          :key="n"
          class="h-9 w-16 rounded-control bg-surface-200"
        />
      </div>

      <div
        v-else-if="error"
        class="flex flex-wrap items-center justify-between gap-3"
        role="alert"
      >
        <p class="text-danger-text">
          {{ apiErrorMessage(error) }}
        </p>
        <UiButton
          variant="secondary"
          size="sm"
          @click="load()"
        >
          Повторить
        </UiButton>
      </div>

      <template v-else-if="slots">
        <p
          v-if="!slots.opens_at"
          class="text-fg-muted"
        >
          В этот день площадка не работает.
        </p>
        <p
          v-else-if="slots.slots.length === 0"
          class="text-fg-muted"
        >
          Свободного времени на этот день нет. Посмотрите другой день или другой зал.
        </p>
        <div
          v-else
          class="flex flex-col gap-4 transition-opacity"
          :class="{ 'opacity-60': loading }"
        >
          <div class="flex flex-col gap-2">
            <p class="text-sm text-fg-muted">
              Свободно
            </p>
            <ul class="flex flex-wrap gap-2">
              <li
                v-for="window in windows"
                :key="window.from"
                class="rounded-control bg-success-soft px-3 py-1.5 text-sm font-semibold tabular-nums text-success-soft-fg"
              >
                {{ window.from }}–{{ window.to }}
              </li>
            </ul>
          </div>
          <div class="flex flex-col gap-2">
            <p class="text-sm text-fg-muted">
              Можно начать в
            </p>
            <ul class="grid grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-2">
              <li
                v-for="slot in slots.slots"
                :key="slot.starts_at"
                class="flex h-9 items-center justify-center rounded-control border border-line bg-panel text-sm font-medium tabular-nums text-fg"
                :title="`Можно занять до ${formatDuration(slot.max_minutes)}`"
              >
                {{ wallTime(slot.starts_at) }}
              </li>
            </ul>
          </div>
        </div>
      </template>

      <p class="text-xs text-fg-muted">
        {{ note }}
      </p>
    </div>
  </div>
</template>

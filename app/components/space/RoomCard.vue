<script setup lang="ts">
import type { Room } from '#shared/types/site'
import { Clock, Images } from '@lucide/vue'

const props = defineProps<{
  room: Room
  /** Вид площадки — для заглушки без фото. */
  type: string
  spaceName: string
}>()

const opened = ref<number | null>(null)
const title = computed(() => `${props.spaceName}, зал «${props.room.name}»`)
</script>

<template>
  <article class="flex flex-col gap-4 rounded-card border border-line p-3 sm:flex-row sm:p-4">
    <div class="relative aspect-[4/3] shrink-0 overflow-hidden rounded-control bg-surface-100 sm:w-56">
      <button
        v-if="room.photos[0]"
        type="button"
        class="group size-full"
        :aria-label="`Фото зала «${room.name}»: ${room.photos.length}`"
        @click="opened = 0"
      >
        <UiPhoto
          :photo="room.photos[0]"
          :alt="`Зал «${room.name}»`"
          sizes="(min-width: 640px) 224px, 100vw"
          class="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span
          v-if="room.photos.length > 1"
          class="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-surface-950/70 px-2 py-0.5 text-xs font-medium text-white"
          aria-hidden="true"
        >
          <Images class="size-3.5" />
          {{ room.photos.length }}
        </span>
      </button>
      <SpacePlaceholder
        v-else
        :type="type"
      />
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-2 sm:py-1">
      <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 class="text-lg font-semibold text-fg">
          {{ room.name }}
        </h3>
        <p class="text-[0.9375rem] font-semibold whitespace-nowrap text-fg">
          {{ formatPricePerHour(room.price_per_hour) }}
        </p>
      </div>
      <p
        v-if="room.description"
        class="leading-relaxed whitespace-pre-line text-fg-muted"
      >
        {{ room.description }}
      </p>
      <p class="mt-auto flex items-center gap-1.5 pt-1 text-sm text-fg-muted">
        <Clock
          class="size-4 shrink-0"
          aria-hidden="true"
        />
        Бронь от {{ formatDuration(room.min_booking_minutes) }}
      </p>
    </div>

    <UiLightbox
      v-if="room.photos.length"
      v-model="opened"
      :photos="room.photos"
      :title="title"
    />
  </article>
</template>

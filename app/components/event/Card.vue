<script setup lang="ts">
import type { EventListItem } from '#shared/types/site'
import { MapPin } from '@lucide/vue'

const props = withDefaults(defineProps<{
  event: EventListItem
  eager?: boolean
}>(), {
  eager: false
})

const day = computed(() => formatEventDay(wallDate(props.event.starts_at)))
</script>

<template>
  <article class="group relative flex flex-col gap-3">
    <div class="relative aspect-[4/3] overflow-hidden rounded-card bg-surface-100">
      <EventPoster
        :src="event.poster_thumb_url"
        :alt="`Афиша: ${event.title}`"
        :type="event.type.slug"
        :eager="eager"
        class="transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <span class="absolute top-3 left-3 rounded-full bg-panel/90 px-2.5 py-1 text-xs font-medium text-fg shadow-card">
        {{ event.type.name }}
      </span>
    </div>
    <div class="flex flex-col gap-1">
      <p class="text-[0.9375rem] font-semibold text-primary-text first-letter:uppercase">
        <time :datetime="wallToIso(event.starts_at)">{{ day }} · {{ wallTime(event.starts_at) }}</time>
      </p>
      <h3 class="text-lg leading-snug font-semibold text-fg">
        <!-- Ссылка растянута на всю карточку: кликается и афиша. -->
        <NuxtLink
          :to="`/events/${event.id}`"
          class="after:absolute after:inset-0 after:rounded-card group-hover:text-primary-text focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ring"
        >
          {{ event.title }}
        </NuxtLink>
      </h3>
      <p class="flex items-start gap-1.5 text-sm text-fg-muted">
        <MapPin
          class="mt-0.5 size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span>{{ event.space.name }}, {{ event.city.name }}</span>
      </p>
      <p
        v-if="event.entry"
        class="mt-1 text-[0.9375rem] text-fg"
      >
        {{ event.entry }}
      </p>
    </div>
  </article>
</template>

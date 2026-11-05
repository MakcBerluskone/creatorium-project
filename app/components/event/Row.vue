<script setup lang="ts">
import type { EventListItem } from '#shared/types/site'

const props = withDefaults(defineProps<{
  event: EventListItem
  /** На странице площадки место и так понятно. */
  hidePlace?: boolean
}>(), {
  hidePlace: false
})

const tile = computed(() => dateTileParts(wallDate(props.event.starts_at)))
const fullDay = computed(() => formatEventDay(wallDate(props.event.starts_at), 'long'))
</script>

<template>
  <article class="group relative flex gap-4 rounded-card border border-line bg-panel p-3 transition-colors hover:border-line-strong sm:p-4">
    <!-- Листок календаря: день виден раньше названия. -->
    <time
      :datetime="wallToIso(event.starts_at)"
      class="flex w-14 shrink-0 flex-col items-center self-start rounded-control bg-primary-soft py-2 text-primary-soft-fg"
    >
      <span class="sr-only">{{ fullDay }}</span>
      <span
        class="text-xs font-medium"
        aria-hidden="true"
      >{{ tile.weekday }}</span>
      <span
        class="font-display text-xl leading-tight font-semibold"
        aria-hidden="true"
      >{{ tile.day }}</span>
      <span
        class="text-xs"
        aria-hidden="true"
      >{{ tile.month }}</span>
    </time>
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <h3 class="leading-snug font-semibold text-fg">
        <NuxtLink
          :to="`/events/${event.id}`"
          class="after:absolute after:inset-0 after:rounded-card group-hover:text-primary-text focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
        >
          {{ event.title }}
        </NuxtLink>
      </h3>
      <p class="text-sm text-fg-muted">
        <span class="tabular-nums">{{ wallTime(event.starts_at) }}</span> · {{ event.type.name }}
      </p>
      <p
        v-if="!hidePlace"
        class="text-sm text-fg-muted"
      >
        {{ event.space.name }}, {{ event.city.name }}
      </p>
      <p
        v-if="event.entry"
        class="text-sm text-fg"
      >
        {{ event.entry }}
      </p>
    </div>
  </article>
</template>

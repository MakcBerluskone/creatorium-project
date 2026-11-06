<script setup lang="ts">
import type { CollectiveListItem } from '#shared/types/site'
import { MapPin, Users } from '@lucide/vue'

defineProps<{
  collective: CollectiveListItem
}>()
</script>

<template>
  <article class="group relative flex gap-4 rounded-card border border-line bg-panel p-4 transition-colors hover:border-line-strong sm:p-5">
    <!-- Логотип квадратный, как у организатора: так коллектив не спутать со специалистом. -->
    <OrganizerLogo
      :name="collective.name"
      :src="collective.logo_thumb_url"
      class="size-16 [--logo-size:4rem]"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <h3 class="text-lg leading-snug font-semibold text-fg">
        <NuxtLink
          :to="`/collectives/${collective.id}`"
          class="after:absolute after:inset-0 after:rounded-card group-hover:text-primary-text focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
        >
          {{ collective.name }}
        </NuxtLink>
      </h3>
      <p class="text-sm text-fg">
        {{ collective.kind.name }}
      </p>
      <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
        <span
          v-if="collective.city"
          class="flex items-center gap-1.5"
        >
          <MapPin
            class="size-3.5 shrink-0"
            aria-hidden="true"
          />
          {{ collective.city.name }}
        </span>
        <span class="flex items-center gap-1.5">
          <Users
            class="size-3.5 shrink-0"
            aria-hidden="true"
          />
          {{ plural(collective.members_count, ['участник', 'участника', 'участников']) }}
        </span>
      </p>
      <p
        v-if="collective.about"
        class="mt-1 line-clamp-3 text-sm leading-relaxed text-fg-muted"
      >
        {{ collective.about }}
      </p>
    </div>
  </article>
</template>

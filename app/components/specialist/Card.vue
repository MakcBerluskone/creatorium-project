<script setup lang="ts">
import type { SpecialistListItem } from '#shared/types/site'
import { MapPin } from '@lucide/vue'

defineProps<{
  specialist: SpecialistListItem
}>()
</script>

<template>
  <article class="group relative flex gap-4 rounded-card border border-line bg-panel p-4 transition-colors hover:border-line-strong sm:p-5">
    <SpecialistAvatar
      :name="specialist.name"
      :src="specialist.avatar_thumb_url"
      class="size-16 [--avatar-size:4rem]"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <h3 class="text-lg leading-snug font-semibold text-fg">
        <NuxtLink
          :to="`/specialists/${specialist.id}`"
          class="after:absolute after:inset-0 after:rounded-card group-hover:text-primary-text focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
        >
          {{ specialist.name }}
        </NuxtLink>
      </h3>
      <p
        v-if="specialist.specializations.length"
        class="text-sm text-fg"
      >
        {{ specialist.specializations.map(s => s.name).join(', ') }}
      </p>
      <p
        v-if="specialist.city"
        class="flex items-center gap-1.5 text-sm text-fg-muted"
      >
        <MapPin
          class="size-3.5 shrink-0"
          aria-hidden="true"
        />
        {{ specialist.city.name }}
      </p>
      <p
        v-if="specialist.about"
        class="mt-1 line-clamp-3 text-sm leading-relaxed text-fg-muted"
      >
        {{ specialist.about }}
      </p>
    </div>
  </article>
</template>

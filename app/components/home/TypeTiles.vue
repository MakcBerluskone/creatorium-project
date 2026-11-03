<script setup lang="ts">
import type { SpaceType } from '#shared/types/site'
import { ArrowRight } from '@lucide/vue'

defineProps<{
  types: SpaceType[]
}>()
</script>

<template>
  <ul class="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
    <li
      v-for="type in types"
      :key="type.slug"
    >
      <NuxtLink
        :to="{ path: '/spaces', query: { type: type.slug } }"
        class="group flex h-full flex-col gap-6 rounded-card border border-line bg-panel p-4 transition-colors hover:border-primary-300 sm:p-5"
      >
        <span class="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-text">
          <component
            :is="spaceTypeIcon(type.slug)"
            class="size-5"
            aria-hidden="true"
          />
        </span>
        <span class="mt-auto flex flex-col gap-1">
          <span class="leading-snug font-semibold text-fg group-hover:text-primary-text">{{ type.name }}</span>
          <span class="flex items-center justify-between gap-2 text-sm text-fg-muted">
            {{ type.spaces_count ? plural(type.spaces_count, ['пространство', 'пространства', 'пространств']) : 'Пока нет' }}
            <ArrowRight
              class="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </span>
      </NuxtLink>
    </li>
  </ul>
</template>

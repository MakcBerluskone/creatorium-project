<script setup lang="ts">
import type { SpaceListItem } from '#shared/types/site'
import { MapPin } from '@lucide/vue'

const props = withDefaults(defineProps<{
  space: SpaceListItem
  sizes?: string
  eager?: boolean
}>(), {
  sizes: '(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  eager: false
})

const rooms = computed(() => plural(props.space.rooms_count, ['помещение', 'помещения', 'помещений']))
</script>

<template>
  <article class="group relative flex flex-col gap-3">
    <div class="aspect-[4/3] overflow-hidden rounded-card bg-surface-100">
      <UiPhoto
        v-if="space.cover"
        :photo="space.cover"
        :alt="space.name"
        :sizes="sizes"
        :eager="eager"
        class="transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <SpacePlaceholder
        v-else
        :type="space.type.slug"
      />
    </div>
    <div class="flex flex-col gap-1">
      <p class="text-sm text-fg-muted">
        {{ space.type.name }} · {{ rooms }}
      </p>
      <h3 class="text-lg leading-snug font-semibold text-fg">
        <!-- Ссылка растянута на всю карточку: кликается и фото. -->
        <NuxtLink
          :to="`/spaces/${space.id}`"
          class="after:absolute after:inset-0 after:rounded-card group-hover:text-primary-text focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-ring"
        >
          {{ space.name }}
        </NuxtLink>
      </h3>
      <p class="flex items-start gap-1.5 text-sm text-fg-muted">
        <MapPin
          class="mt-0.5 size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span>{{ formatAddress(space) }}</span>
      </p>
      <p class="mt-1 text-[0.9375rem] text-fg">
        <template v-if="space.price_from !== null">
          от <span class="font-semibold">{{ formatRubles(space.price_from) }}</span>/час
        </template>
        <span
          v-else
          class="text-fg-muted"
        >Цена по запросу</span>
      </p>
    </div>
  </article>
</template>

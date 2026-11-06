<script setup lang="ts">
import type { GearGroup, GearItem, Photo } from '#shared/types/site'

defineProps<{
  /** Категории в порядке каталога, пустых нет — так отдаёт API. */
  groups: GearGroup[]
}>()

// Фото техники квадратное: thumb — 160 px, большое — 512 px. В просмотре — одно фото позиции.
const opened = ref<GearItem | null>(null)
const openedPhotos = computed<Photo[]>(() => {
  const item = opened.value
  if (!item?.photo_url) {
    return []
  }
  return [{ url: item.photo_url, thumb_url: item.photo_thumb_url ?? item.photo_url, width: 512, height: 512 }]
})
const openedIndex = computed({
  get: () => (openedPhotos.value.length ? 0 : null),
  set: (value: number | null) => {
    if (value === null) {
      opened.value = null
    }
  }
})

// Без единого фото в категории строки короче: место под заглушки не держим.
function hasPhotos(group: GearGroup): boolean {
  return group.items.some(item => item.photo_thumb_url)
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <nav
      v-if="groups.length > 1"
      aria-label="Категории техники"
    >
      <ul class="flex flex-wrap gap-2">
        <li
          v-for="group in groups"
          :key="group.slug"
        >
          <a
            :href="`#gear-${group.slug}`"
            class="flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-panel px-3.5 text-sm font-medium whitespace-nowrap text-fg transition-colors hover:border-fg-subtle"
          >
            {{ group.name }}
            <span class="font-normal text-fg-muted">{{ group.items.length }}</span>
          </a>
        </li>
      </ul>
    </nav>

    <section
      v-for="group in groups"
      :id="`gear-${group.slug}`"
      :key="group.slug"
      :aria-labelledby="`gear-${group.slug}-title`"
      class="flex flex-col gap-3"
    >
      <h3
        :id="`gear-${group.slug}-title`"
        class="flex flex-wrap items-baseline gap-x-2 text-lg font-semibold text-fg"
      >
        {{ group.name }}
        <span class="text-sm font-normal text-fg-muted">{{ plural(group.items.length, ['позиция', 'позиции', 'позиций']) }}</span>
      </h3>

      <ul class="flex flex-col divide-y divide-line rounded-card border border-line">
        <li
          v-for="item in group.items"
          :key="item.id"
          class="flex gap-3 px-3 py-3 sm:gap-4 sm:px-4"
        >
          <template v-if="hasPhotos(group)">
            <button
              v-if="item.photo_thumb_url"
              type="button"
              class="group size-16 shrink-0 overflow-hidden rounded-control bg-surface-100 sm:size-20"
              :aria-label="`Фото: ${item.name}`"
              @click="opened = item"
            >
              <img
                :src="item.photo_thumb_url"
                width="160"
                height="160"
                alt=""
                loading="lazy"
                decoding="async"
                class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              >
            </button>
            <div
              v-else
              class="flex size-16 shrink-0 items-center justify-center rounded-control bg-surface-100 text-surface-400 sm:size-20"
              aria-hidden="true"
            >
              <component
                :is="gearCategoryIcon(group.slug)"
                class="size-6"
                :stroke-width="1.5"
              />
            </div>
          </template>

          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <div class="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <p class="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <span class="min-w-0 font-medium wrap-break-word text-fg">{{ item.name }}</span>
                <span class="text-sm whitespace-nowrap text-fg-muted">{{ formatPieces(item.quantity) }}</span>
              </p>
              <div class="flex shrink-0 flex-wrap items-baseline gap-x-3 sm:flex-col sm:items-end sm:gap-0">
                <p class="text-[0.9375rem] font-semibold whitespace-nowrap text-fg">
                  {{ formatPricePerDay(item.price_per_day) }}
                </p>
                <p
                  v-if="item.deposit"
                  class="text-sm whitespace-nowrap text-fg-muted"
                >
                  залог {{ formatRubles(item.deposit) }}
                </p>
              </div>
            </div>
            <p
              v-if="item.description"
              class="text-sm leading-relaxed whitespace-pre-line wrap-break-word text-fg-muted"
            >
              {{ item.description }}
            </p>
          </div>
        </li>
      </ul>
    </section>

    <UiLightbox
      v-model="openedIndex"
      :photos="openedPhotos"
      :title="opened?.name ?? ''"
    />
  </div>
</template>

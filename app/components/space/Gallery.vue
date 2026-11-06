<script setup lang="ts">
import type { Photo } from '#shared/types/site'
import { Images } from '@lucide/vue'

// Та же галерея — у коллектива: он передаёт свою подпись ленты, а без фото галерею не показывает.
const props = withDefaults(defineProps<{
  photos: Photo[]
  name: string
  /** Код вида площадки — для заглушки без фото. */
  type?: string
  /** Подпись ленты фото для экранных читалок. */
  label?: string
}>(), {
  type: undefined,
  label: 'Фото площадки'
})

const opened = ref<number | null>(null)
const shown = computed(() => props.photos.slice(0, 5))

// Раскладка на планшете и шире: крупная обложка слева, остальные — сеткой справа.
function cellClass(index: number): string {
  const count = shown.value.length
  if (count === 1) {
    return 'col-span-4 row-span-2'
  }
  if (count === 2) {
    return 'col-span-2 row-span-2'
  }
  if (index === 0) {
    return 'col-span-2 row-span-2'
  }
  if (count === 3 || (count === 4 && index === 1)) {
    return 'col-span-2'
  }
  return 'col-span-1'
}
</script>

<template>
  <div class="relative">
    <div
      v-if="photos.length === 0"
      class="aspect-[16/9] overflow-hidden rounded-card md:aspect-[21/8]"
    >
      <SpacePlaceholder :type="type" />
    </div>

    <template v-else>
      <!-- Телефон: лента с прокруткой пальцем. -->
      <ul
        class="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:hidden"
        :aria-label="label"
      >
        <li
          v-for="(photo, index) in photos"
          :key="photo.url"
          class="aspect-[4/3] shrink-0 snap-center overflow-hidden rounded-card bg-surface-100"
          :class="photos.length === 1 ? 'w-full' : 'w-[85%]'"
        >
          <button
            type="button"
            class="size-full"
            :aria-label="`Открыть фото ${index + 1} из ${photos.length}`"
            @click="opened = index"
          >
            <UiPhoto
              :photo="photo"
              :alt="`${name}, фото ${index + 1}`"
              sizes="85vw"
              :eager="index === 0"
            />
          </button>
        </li>
      </ul>

      <!-- Планшет и шире: обложка и до четырёх фото рядом. -->
      <div class="hidden h-[26rem] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-card md:grid lg:h-[30rem]">
        <button
          v-for="(photo, index) in shown"
          :key="photo.url"
          type="button"
          class="group overflow-hidden bg-surface-100"
          :class="cellClass(index)"
          :aria-label="`Открыть фото ${index + 1} из ${photos.length}`"
          @click="opened = index"
        >
          <UiPhoto
            :photo="photo"
            :alt="`${name}, фото ${index + 1}`"
            :sizes="index === 0 ? '(min-width: 1216px) 600px, 50vw' : '(min-width: 1216px) 300px, 25vw'"
            :eager="index === 0"
            class="transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </button>
      </div>

      <UiButton
        v-if="photos.length > 1"
        variant="secondary"
        size="sm"
        class="absolute right-3 bottom-3 hidden shadow-card md:inline-flex"
        @click="opened = 0"
      >
        <Images
          class="size-4"
          aria-hidden="true"
        />
        Все фото · {{ photos.length }}
      </UiButton>
    </template>

    <UiLightbox
      v-model="opened"
      :photos="photos"
      :title="name"
    />
  </div>
</template>

<script setup lang="ts">
import type { SpaceEquipmentItem } from '#shared/types/site'
import { Package } from '@lucide/vue'

const props = defineProps<{
  /** Порядок задаёт площадка, API отдаёт его как есть. */
  items: SpaceEquipmentItem[]
}>()

const { opened, photos: openedPhotos, index: openedIndex, title: openedTitle } = useEquipmentLightbox()

// Без единого фото строки короче: место под заглушки не держим.
const hasPhotos = computed(() => props.items.some(item => item.photo_thumb_url))
</script>

<template>
  <div>
    <ul class="flex flex-col divide-y divide-line rounded-card border border-line">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="flex gap-3 px-3 py-3 sm:gap-4 sm:px-4"
      >
        <template v-if="hasPhotos">
          <button
            v-if="item.photo_thumb_url"
            type="button"
            class="group size-16 shrink-0 overflow-hidden rounded-control bg-surface-100"
            :aria-label="`Фото: ${item.display_name}`"
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
            class="flex size-16 shrink-0 items-center justify-center rounded-control bg-surface-100 text-surface-400"
            aria-hidden="true"
          >
            <Package
              class="size-6"
              :stroke-width="1.5"
            />
          </div>
        </template>

        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
            <p class="flex min-w-0 flex-wrap items-baseline gap-x-2">
              <span class="min-w-0 font-medium wrap-break-word text-fg">{{ item.display_name }}</span>
              <span class="text-sm whitespace-nowrap text-fg-muted">{{ formatPieces(item.quantity) }}</span>
            </p>
            <p class="text-[0.9375rem] font-semibold whitespace-nowrap text-fg">
              {{ formatEquipmentPrice(item.price, item.price_unit) }}
            </p>
          </div>
          <!-- Примечание площадки — про эту позицию, описание — общее у модели. -->
          <p
            v-if="item.note"
            class="text-sm whitespace-pre-line wrap-break-word text-fg"
          >
            {{ item.note }}
          </p>
          <p
            v-if="item.description"
            class="text-sm leading-relaxed whitespace-pre-line wrap-break-word text-fg-muted"
          >
            {{ item.description }}
          </p>
        </div>
      </li>
    </ul>

    <UiLightbox
      v-model="openedIndex"
      :photos="openedPhotos"
      :title="openedTitle"
    />
  </div>
</template>

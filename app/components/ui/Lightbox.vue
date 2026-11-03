<script setup lang="ts">
import type { Photo } from '#shared/types/site'
import { ChevronLeft, ChevronRight, X } from '@lucide/vue'

const props = defineProps<{
  photos: Photo[]
  /** Для alt: «Репбаза «Акустика», фото 2 из 5». */
  title: string
}>()

/** Номер открытого фото; null — просмотр закрыт. */
const index = defineModel<number | null>({ default: null })

const dialog = useTemplateRef('dialog')
const current = computed(() => (index.value === null ? undefined : props.photos[index.value]))

// Нативный dialog держит фокус внутри и закрывается по Esc сам.
watch(index, (value) => {
  const el = dialog.value
  if (!el) {
    return
  }
  if (value !== null && !el.open) {
    el.showModal()
    document.documentElement.style.overflow = 'hidden'
  } else if (value === null && el.open) {
    el.close()
  }
}, { flush: 'post' })

function onClose() {
  document.documentElement.style.overflow = ''
  index.value = null
}

function step(delta: number) {
  if (index.value === null || props.photos.length < 2) {
    return
  }
  index.value = (index.value + delta + props.photos.length) % props.photos.length
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    step(-1)
  } else if (event.key === 'ArrowRight') {
    step(1)
  }
}

// Листание пальцем на телефоне.
let touchX: number | null = null
function onTouchStart(event: TouchEvent) {
  touchX = event.touches[0]?.clientX ?? null
}
function onTouchEnd(event: TouchEvent) {
  const endX = event.changedTouches[0]?.clientX
  if (touchX !== null && endX !== undefined && Math.abs(endX - touchX) > 50) {
    step(endX < touchX ? 1 : -1)
  }
  touchX = null
}

onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <dialog
    ref="dialog"
    class="m-0 size-full max-h-none max-w-none bg-transparent p-0 text-white backdrop:bg-backdrop"
    :aria-label="`Фото: ${title}`"
    @close="onClose"
    @keydown="onKeydown"
    @click.self="index = null"
  >
    <div
      v-if="current && index !== null"
      class="relative flex size-full flex-col"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <div class="flex items-center justify-between gap-4 px-4 py-3">
        <p
          class="text-sm text-white/80"
          aria-live="polite"
        >
          {{ index + 1 }} из {{ photos.length }}
        </p>
        <button
          type="button"
          class="flex size-11 items-center justify-center rounded-full text-white hover:bg-white/10"
          aria-label="Закрыть"
          @click="index = null"
        >
          <X
            class="size-6"
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        class="flex min-h-0 flex-1 items-center justify-center px-2 pb-6 sm:px-16"
        @click.self="index = null"
      >
        <img
          :key="current.url"
          :src="current.url"
          :width="current.width"
          :height="current.height"
          :alt="`${title}, фото ${index + 1} из ${photos.length}`"
          class="max-h-full w-auto max-w-full rounded-control object-contain"
        >
      </div>

      <template v-if="photos.length > 1">
        <button
          type="button"
          class="absolute top-1/2 left-2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex"
          aria-label="Предыдущее фото"
          @click="step(-1)"
        >
          <ChevronLeft
            class="size-6"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          class="absolute top-1/2 right-2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:flex"
          aria-label="Следующее фото"
          @click="step(1)"
        >
          <ChevronRight
            class="size-6"
            aria-hidden="true"
          />
        </button>
      </template>
    </div>
  </dialog>
</template>

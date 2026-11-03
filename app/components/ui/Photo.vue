<script setup lang="ts">
import type { Photo } from '#shared/types/site'

const props = withDefaults(defineProps<{
  photo: Photo
  alt: string
  /** Ширина картинки на экране — по ней браузер выбирает thumb или большое фото. */
  sizes?: string
  /** Первый экран грузим сразу, остальное — по мере прокрутки. */
  eager?: boolean
}>(), {
  sizes: '(min-width: 1024px) 33vw, 100vw',
  eager: false
})

// Ширина файлов по длинной стороне: thumb до 640 px, url до 1600 px.
function widthAt(longSide: number): number {
  const { width, height } = props.photo
  const scale = Math.min(1, longSide / Math.max(width, height, 1))
  return Math.max(1, Math.round(width * scale))
}

const srcset = computed(() => `${props.photo.thumb_url} ${widthAt(640)}w, ${props.photo.url} ${widthAt(1600)}w`)
</script>

<template>
  <img
    :src="photo.thumb_url"
    :srcset="srcset"
    :sizes="sizes"
    :width="photo.width"
    :height="photo.height"
    :alt="alt"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : undefined"
    decoding="async"
    class="size-full object-cover"
  >
</template>

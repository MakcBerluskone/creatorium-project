<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: string
  src?: string | null
  /** Размер файла: thumb — 160 px, большой — 512 px. */
  pixels?: number
  eager?: boolean
}>(), {
  src: null,
  pixels: 160,
  eager: false
})

const initials = computed(() => nameInitials(props.name))
</script>

<template>
  <!-- Логотип — квадрат со скруглением, а не круг, как аватар специалиста. -->
  <div class="relative aspect-square shrink-0 overflow-hidden rounded-card border border-line bg-surface-100">
    <img
      v-if="src"
      :src="src"
      :width="pixels"
      :height="pixels"
      :alt="name"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      class="size-full object-cover"
    >
    <span
      v-else
      class="flex size-full items-center justify-center font-display font-medium text-surface-500 select-none"
      :style="{ fontSize: 'calc(var(--logo-size, 4rem) * 0.36)' }"
      role="img"
      :aria-label="name"
    >{{ initials }}</span>
  </div>
</template>

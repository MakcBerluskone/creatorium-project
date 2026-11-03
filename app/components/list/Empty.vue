<script setup lang="ts">
import { SearchX } from '@lucide/vue'

defineProps<{
  title: string
  /** Есть фильтры — предлагаем их сбросить. */
  canReset?: boolean
}>()

defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="flex flex-col items-center gap-3 rounded-card border border-dashed border-line-strong px-6 py-14 text-center">
    <span class="flex size-12 items-center justify-center rounded-full bg-muted text-fg-muted">
      <SearchX
        class="size-5"
        aria-hidden="true"
      />
    </span>
    <p class="text-lg font-medium text-fg">
      {{ title }}
    </p>
    <div class="max-w-md text-fg-muted">
      <slot />
    </div>
    <UiButton
      v-if="canReset"
      variant="secondary"
      class="mt-2"
      @click="$emit('reset')"
    >
      Сбросить фильтры
    </UiButton>
  </div>
</template>

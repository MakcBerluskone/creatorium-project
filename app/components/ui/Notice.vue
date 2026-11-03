<script setup lang="ts">
import { CircleAlert, Info, TriangleAlert } from '@lucide/vue'

const props = withDefaults(defineProps<{
  tone?: 'info' | 'warn' | 'danger'
}>(), {
  tone: 'info'
})

const icon = computed(() => ({ info: Info, warn: TriangleAlert, danger: CircleAlert })[props.tone])
</script>

<template>
  <div
    class="flex gap-3 rounded-control px-4 py-3 text-sm leading-relaxed"
    :class="{
      'bg-muted text-fg': tone === 'info',
      'bg-warn-soft text-warn-soft-fg': tone === 'warn',
      'bg-danger-soft text-danger-soft-fg': tone === 'danger'
    }"
    :role="tone === 'danger' ? 'alert' : undefined"
  >
    <component
      :is="icon"
      class="mt-0.5 size-4 shrink-0"
      :class="{ 'text-fg-muted': tone === 'info' }"
      aria-hidden="true"
    />
    <div class="min-w-0">
      <slot />
    </div>
  </div>
</template>

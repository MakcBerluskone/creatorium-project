<script setup lang="ts">
import { WifiOff } from '@lucide/vue'

defineProps<{
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-4 rounded-card border border-line px-6 py-12 text-center"
    role="alert"
  >
    <span class="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger-text">
      <WifiOff
        class="size-5"
        aria-hidden="true"
      />
    </span>
    <p class="max-w-md text-fg">
      {{ message }}
    </p>
    <UiButton
      variant="secondary"
      @click="$emit('retry')"
    >
      Повторить
    </UiButton>
  </div>
</template>

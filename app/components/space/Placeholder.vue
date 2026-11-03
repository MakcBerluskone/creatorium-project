<script setup lang="ts">
const props = defineProps<{
  /** Код вида пространства — по нему иконка. */
  type?: string
  label?: string
}>()

const icon = computed(() => spaceTypeIcon(props.type))
</script>

<template>
  <div
    class="flex size-full flex-col items-center justify-center gap-2 bg-surface-100 text-surface-400"
    role="img"
    :aria-label="label ?? 'Фото пока нет'"
  >
    <component
      :is="icon"
      class="size-10"
      :stroke-width="1.5"
      aria-hidden="true"
    />
    <span
      class="text-xs"
      aria-hidden="true"
    >Фото пока нет</span>
  </div>
</template>

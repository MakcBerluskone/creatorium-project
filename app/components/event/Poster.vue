<script setup lang="ts">
const props = withDefaults(defineProps<{
  /** Афиша; null — не загружена, тогда заглушка по виду события. */
  src: string | null
  alt: string
  /** Код вида события — по нему иконка заглушки. */
  type?: string
  eager?: boolean
}>(), {
  type: undefined,
  eager: false
})

const icon = computed(() => eventTypeIcon(props.type))
</script>

<template>
  <!-- Афиши бывают любых пропорций: показываем целиком поверх размытой копии, без обрезки. -->
  <div
    v-if="src"
    class="relative size-full overflow-hidden bg-surface-100"
  >
    <img
      :src="src"
      alt=""
      aria-hidden="true"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      class="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-xl"
    >
    <img
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : undefined"
      decoding="async"
      class="relative size-full object-contain"
    >
  </div>
  <div
    v-else
    class="flex size-full items-center justify-center bg-surface-100 text-surface-400"
    aria-hidden="true"
  >
    <component
      :is="icon"
      class="size-10"
      :stroke-width="1.5"
    />
  </div>
</template>

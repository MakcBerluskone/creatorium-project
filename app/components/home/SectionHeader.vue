<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

defineProps<{
  title: string
  id: string
  /** Ссылка «смотреть все» справа от заголовка. */
  to?: string
  linkLabel?: string
}>()
</script>

<template>
  <div class="flex items-end justify-between gap-4">
    <div class="flex flex-col gap-1.5">
      <h2
        :id="id"
        class="font-display text-xl font-semibold md:text-2xl"
      >
        {{ title }}
      </h2>
      <p
        v-if="$slots.default"
        class="max-w-2xl text-fg-muted"
      >
        <slot />
      </p>
    </div>
    <NuxtLink
      v-if="to"
      :to="to"
      class="hidden shrink-0 items-center gap-1 rounded-control font-medium text-primary-text hover:underline sm:inline-flex"
    >
      {{ linkLabel }}
      <ArrowRight
        class="size-4"
        aria-hidden="true"
      />
    </NuxtLink>
  </div>
</template>

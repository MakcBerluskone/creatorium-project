<script setup lang="ts">
defineProps<{
  title: string
  /** Подробнее — страница для пространств или специалистов. */
  to: string
  /** Регистрация в кабинете. */
  href: string
  action: string
}>()
</script>

<template>
  <article class="flex flex-col gap-5 rounded-card border border-line bg-panel p-6 md:p-8">
    <h3 class="font-display text-xl font-semibold">
      {{ title }}
    </h3>
    <div class="flex-1 text-fg-muted">
      <slot />
    </div>
    <div class="flex flex-wrap gap-3">
      <UiButton :href="href">
        {{ action }}
      </UiButton>
      <UiButton
        :to="to"
        variant="secondary"
      >
        Подробнее
      </UiButton>
    </div>
  </article>
</template>

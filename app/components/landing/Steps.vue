<script setup lang="ts">
defineProps<{
  steps: { title: string, text: string }[]
}>()
</script>

<template>
  <ol class="grid gap-4 md:grid-cols-3 md:gap-6">
    <li
      v-for="(step, index) in steps"
      :key="step.title"
      class="flex flex-col gap-3 rounded-card border border-line bg-panel p-5 md:p-6"
    >
      <span
        class="font-display text-2xl font-semibold text-primary-text"
        aria-hidden="true"
      >{{ index + 1 }}</span>
      <h3 class="text-lg font-semibold text-fg">
        {{ step.title }}
      </h3>
      <p class="leading-relaxed text-fg-muted">
        {{ step.text }}
      </p>
    </li>
  </ol>
</template>

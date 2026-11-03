<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  items: { icon: Component, title: string, text: string }[]
}>()
</script>

<template>
  <ul class="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
    <li
      v-for="item in items"
      :key="item.title"
      class="flex flex-col gap-3"
    >
      <span class="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-text">
        <component
          :is="item.icon"
          class="size-5"
          aria-hidden="true"
        />
      </span>
      <h3 class="text-lg font-semibold text-fg">
        {{ item.title }}
      </h3>
      <p class="leading-relaxed text-fg-muted">
        {{ item.text }}
      </p>
    </li>
  </ul>
</template>

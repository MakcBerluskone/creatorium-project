<script setup lang="ts">
const { brand } = useAppConfig()
</script>

<template>
  <NuxtLink
    to="/"
    class="inline-flex items-center gap-2.5 rounded-control text-fg"
    :aria-label="`${brand} — на главную`"
  >
    <!-- Знак из favicon.svg: цвет — primary-700, как в файле. -->
    <svg
      viewBox="0 0 32 32"
      class="size-8 shrink-0"
      aria-hidden="true"
    >
      <rect
        width="32"
        height="32"
        rx="7"
        class="fill-primary-700"
      />
      <path
        d="M21.6 11a7.2 7.2 0 1 0 0 10"
        fill="none"
        stroke="#fff"
        stroke-width="3.2"
        stroke-linecap="round"
      />
    </svg>
    <span class="font-display text-[1.0625rem] font-semibold tracking-tight">{{ brand }}</span>
  </NuxtLink>
</template>

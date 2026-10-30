<script setup lang="ts">
const { brand } = useAppConfig()

useHead({
  title: brand,
  link: [
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }
  ],
  htmlAttrs: {
    lang: 'ru'
  }
})

useSeoMeta({
  ogSiteName: brand,
  ogLocale: 'ru_RU'
})
</script>

<template>
  <main class="flex min-h-dvh items-center justify-center bg-slate-50 text-slate-900">
    <h1 class="text-3xl font-semibold">
      {{ brand }}
    </h1>
  </main>
</template>

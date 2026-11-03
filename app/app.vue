<script setup lang="ts">
const { brand } = useAppConfig()
const { indexable } = useRuntimeConfig().public

useHead({
  titleTemplate: title => (title && title !== brand ? `${title} · ${brand}` : brand)
})

useSeoMeta({
  ogSiteName: brand,
  ogLocale: 'ru_RU',
  robots: indexable ? undefined : 'noindex, nofollow'
})
</script>

<template>
  <NuxtLoadingIndicator
    color="var(--color-primary)"
    :height="2"
  />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

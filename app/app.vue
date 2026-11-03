<script setup lang="ts">
const { brand } = useAppConfig()

useHead({
  titleTemplate: title => (title && title !== brand ? `${title} · ${brand}` : brand)
})

useSeoMeta({
  ogSiteName: brand,
  ogLocale: 'ru_RU'
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

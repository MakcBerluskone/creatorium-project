<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const notFound = computed(() => props.error.statusCode === 404)

// Страница площадки, специалиста или события передаёт своё объяснение в data,
// а вторая кнопка ведёт туда, куда советует текст.
const details = computed(() => {
  const data = props.error.data as { title?: string, text?: string, link?: { label: string, to: string } } | undefined
  const link = { label: 'Найти площадку', to: '/spaces' }
  if (notFound.value) {
    return {
      title: data?.title ?? 'Такой страницы нет',
      text: data?.text ?? 'Возможно, в ссылке опечатка или страницу убрали. Начните с главной или поиска.',
      link: data?.link ?? link
    }
  }
  return {
    title: 'Страница не открылась',
    text: 'Сервер не ответил или ответил с ошибкой. Попробуйте обновить страницу через минуту.',
    link
  }
})

// error.vue рисуется вместо app.vue, titleTemplate оттуда сюда не доходит.
const { brand } = useAppConfig()
useSeoMeta({
  title: () => `${details.value.title} · ${brand}`,
  robots: 'noindex'
})
</script>

<template>
  <NuxtLayout>
    <section class="container-page flex flex-col items-start gap-6 py-20 md:py-28">
      <p class="font-display text-6xl font-semibold text-primary-200 md:text-7xl">
        {{ error.statusCode || 500 }}
      </p>
      <div class="flex max-w-xl flex-col gap-3">
        <h1 class="font-display text-2xl font-semibold text-balance md:text-3xl">
          {{ details.title }}
        </h1>
        <p class="text-lg text-fg-muted">
          {{ details.text }}
        </p>
      </div>
      <div class="flex flex-wrap gap-3">
        <UiButton @click="clearError({ redirect: '/' })">
          На главную
        </UiButton>
        <UiButton
          variant="secondary"
          @click="clearError({ redirect: details.link.to })"
        >
          {{ details.link.label }}
        </UiButton>
      </div>
    </section>
  </NuxtLayout>
</template>

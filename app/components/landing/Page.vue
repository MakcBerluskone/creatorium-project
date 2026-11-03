<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  eyebrow: string
  title: string
  lead: string
  features: { icon: Component, title: string, text: string }[]
  steps: { title: string, text: string }[]
  /** Главная кнопка — регистрация в кабинете. */
  action: { label: string, href: string }
  /** Вторая кнопка — вход или поиск. */
  secondary: { label: string, href?: string, to?: string }
  ctaTitle: string
}>()
</script>

<template>
  <div>
    <section class="border-b border-line bg-muted">
      <div class="container-page flex flex-col gap-6 py-12 md:py-20">
        <p class="text-sm font-semibold text-primary-text">
          {{ eyebrow }}
        </p>
        <h1 class="max-w-3xl font-display text-[1.75rem] leading-[1.15] font-semibold text-balance sm:text-4xl md:text-5xl">
          {{ title }}
        </h1>
        <p class="max-w-2xl text-lg text-fg-muted md:text-xl">
          {{ lead }}
        </p>
        <div class="flex flex-wrap gap-3 pt-2">
          <UiButton
            :href="action.href"
            size="lg"
          >
            {{ action.label }}
          </UiButton>
          <UiButton
            :href="secondary.href"
            :to="secondary.to"
            variant="secondary"
            size="lg"
          >
            {{ secondary.label }}
          </UiButton>
        </div>
      </div>
    </section>

    <div class="container-page flex flex-col gap-16 py-12 md:gap-24 md:py-20">
      <section
        aria-labelledby="features-title"
        class="flex flex-col gap-8"
      >
        <h2
          id="features-title"
          class="font-display text-xl font-semibold md:text-2xl"
        >
          Что даёт Креаториум
        </h2>
        <LandingFeatures :items="features" />
      </section>

      <section
        aria-labelledby="steps-title"
        class="flex flex-col gap-8"
      >
        <h2
          id="steps-title"
          class="font-display text-xl font-semibold md:text-2xl"
        >
          Как начать
        </h2>
        <LandingSteps :steps="steps" />
        <slot name="after-steps" />
      </section>

      <section
        aria-labelledby="cta-title"
        class="flex flex-col items-start gap-5 rounded-card border border-line p-6 md:flex-row md:items-center md:justify-between md:p-10"
      >
        <div class="flex flex-col gap-2">
          <h2
            id="cta-title"
            class="font-display text-xl font-semibold md:text-2xl"
          >
            {{ ctaTitle }}
          </h2>
          <p class="text-fg-muted">
            <slot name="cta" />
          </p>
        </div>
        <UiButton
          :href="action.href"
          size="lg"
          class="shrink-0"
        >
          {{ action.label }}
        </UiButton>
      </section>
    </div>
  </div>
</template>

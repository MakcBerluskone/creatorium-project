<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(defineProps<{
  /** Ссылка внутри сайта. */
  to?: RouteLocationRaw
  /** Ссылка наружу — в кабинеты, Telegram. */
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit'
  block?: boolean
  disabled?: boolean
}>(), {
  to: undefined,
  href: undefined,
  variant: 'primary',
  size: 'md',
  type: 'button',
  block: false,
  disabled: false
})

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-colors',
  'disabled:pointer-events-none disabled:opacity-50',
  {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-5 text-[0.9375rem]',
    lg: 'h-12 px-6 text-base'
  }[props.size],
  {
    primary: 'bg-primary text-primary-contrast hover:bg-primary-hover active:bg-primary-active',
    secondary: 'border border-line-strong bg-panel text-fg hover:border-fg-subtle hover:bg-hover',
    ghost: 'text-primary-text hover:bg-primary-soft'
  }[props.variant],
  props.block ? 'w-full' : ''
])
</script>

<template>
  <NuxtLink
    v-if="to || href"
    :to="to ?? href"
    :external="!!href"
    :class="classes"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="disabled"
    :class="classes"
  >
    <slot />
  </button>
</template>

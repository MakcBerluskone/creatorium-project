<script setup lang="ts">
import type { LocationQueryRaw } from 'vue-router'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const props = defineProps<{
  page: number
  lastPage: number
  /** Query для ссылки на страницу: фильтры сохраняются. */
  queryFor: (page: number) => LocationQueryRaw
}>()

// Первая, последняя и две соседние с текущей; пропуски — многоточием.
const items = computed(() => {
  const pages = new Set([1, props.lastPage, props.page - 1, props.page, props.page + 1])
  const sorted = [...pages].filter(p => p >= 1 && p <= props.lastPage).sort((a, b) => a - b)
  const result: (number | 'gap')[] = []
  for (const [index, value] of sorted.entries()) {
    const previous = sorted[index - 1]
    if (previous !== undefined && value - previous > 1) {
      result.push('gap')
    }
    result.push(value)
  }
  return result
})

const linkClass = 'flex h-10 min-w-10 items-center justify-center rounded-control px-3 text-sm font-medium transition-colors'
</script>

<template>
  <nav
    v-if="lastPage > 1"
    aria-label="Страницы"
    class="flex items-center justify-center gap-1"
  >
    <NuxtLink
      v-if="page > 1"
      :to="{ query: queryFor(page - 1) }"
      :class="[linkClass, 'text-fg hover:bg-hover']"
      aria-label="Предыдущая страница"
    >
      <ChevronLeft
        class="size-4"
        aria-hidden="true"
      />
    </NuxtLink>
    <template
      v-for="(item, index) in items"
      :key="item === 'gap' ? `gap-${index}` : item"
    >
      <span
        v-if="item === 'gap'"
        class="px-1 text-fg-muted"
        aria-hidden="true"
      >…</span>
      <NuxtLink
        v-else
        :to="{ query: queryFor(item) }"
        :class="[linkClass, item === page ? 'bg-primary text-primary-contrast' : 'text-fg hover:bg-hover']"
        :aria-current="item === page ? 'page' : undefined"
        :aria-label="`Страница ${item}`"
      >
        {{ item }}
      </NuxtLink>
    </template>
    <NuxtLink
      v-if="page < lastPage"
      :to="{ query: queryFor(page + 1) }"
      :class="[linkClass, 'text-fg hover:bg-hover']"
      aria-label="Следующая страница"
    >
      <ChevronRight
        class="size-4"
        aria-hidden="true"
      />
    </NuxtLink>
  </nav>
</template>

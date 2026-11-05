<script setup lang="ts">
import type { Catalog } from '#shared/types/site'
import { Search } from '@lucide/vue'

const props = defineProps<{
  catalog: Catalog
}>()

const city = ref('')
const type = ref('')

const cityOptions = computed(() => props.catalog.cities.map(c => ({ value: c.slug, label: c.name })))
const typeOptions = computed(() => props.catalog.space_types.map(t => ({ value: t.slug, label: t.name })))

function submit() {
  const query: Record<string, string> = {}
  if (city.value) {
    query.city = city.value
  }
  if (type.value) {
    query.type = type.value
  }
  return navigateTo({ path: '/spaces', query })
}
</script>

<template>
  <!-- action и name — чтобы поиск работал и до загрузки скриптов. -->
  <form
    action="/spaces"
    method="get"
    role="search"
    aria-label="Поиск площадок"
    class="grid gap-3 rounded-card border border-line bg-panel p-3 shadow-overlay sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-4"
    @submit.prevent="submit"
  >
    <UiSelect
      v-model="city"
      name="city"
      label="Город"
      placeholder="Все города"
      :options="cityOptions"
    />
    <UiSelect
      v-model="type"
      name="type"
      label="Что ищете"
      placeholder="Все виды"
      :options="typeOptions"
    />
    <UiButton
      type="submit"
      class="sm:px-6"
    >
      <Search
        class="size-4"
        aria-hidden="true"
      />
      Найти
    </UiButton>
  </form>
</template>

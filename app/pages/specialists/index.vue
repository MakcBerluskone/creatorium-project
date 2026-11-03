<script setup lang="ts">
const api = useSiteApi()
const { data: catalog, error: catalogError, refresh: refreshCatalog } = await useCatalog()

const { filters, page, hasFilters, setFilter, pageQuery, reset } = useListFilters(['city', 'specialization', 'search'] as const)
const search = useDebouncedSearch(() => filters.value.search, value => setFilter('search', value, { replace: true }))

const params = computed(() => ({
  city: filters.value.city,
  specialization: filters.value.specialization,
  search: filters.value.search,
  page: page.value,
  per_page: 24
}))

// Как и пространства, список собирается в браузере по фильтрам из адреса.
const { data, status, error, refresh } = useAsyncData(
  () => `specialists:${JSON.stringify(params.value)}`,
  () => api.specialists(params.value),
  { server: false, lazy: true }
)

// Справочник мог не загрузиться вместе со списком: «Повторить» перезапрашивает и его.
function retry(): void {
  if (catalogError.value) {
    refreshCatalog()
  }
  refresh()
}

const loading = computed(() => status.value === 'idle' || status.value === 'pending')
const cityOptions = computed(() => catalog.value.cities.map(c => ({ value: c.slug, label: c.name })))
const specializationOptions = computed(() => catalog.value.specializations.map(s => ({ value: s.slug, label: s.name })))
const cityName = computed(() => catalog.value.cities.find(c => c.slug === filters.value.city)?.name)
const specializationName = computed(() => catalog.value.specializations.find(s => s.slug === filters.value.specialization)?.name)

const found = computed(() => {
  const total = data.value?.meta.total ?? 0
  return total === 0 ? 'Ничего не нашлось' : `Нашлось ${plural(total, ['специалист', 'специалиста', 'специалистов'])}`
})

const results = useTemplateRef('results')
watch(page, () => {
  const top = results.value?.getBoundingClientRect().top ?? 0
  if (top < 0) {
    results.value?.scrollIntoView({ block: 'start' })
  }
})

usePageSeo({
  title: () => {
    const parts = [specializationName.value, cityName.value].filter(Boolean)
    return parts.length ? `Специалисты — ${parts.join(', ')}` : 'Музыканты, фотографы, ведущие и диджеи'
  },
  description: 'Публичные карточки специалистов: музыканты, вокалисты, звукорежиссёры, фотографы, видеографы, ведущие, диджеи. Город, специализации и контакты.'
})
</script>

<template>
  <div class="container-page flex flex-col gap-8 py-8 md:py-12">
    <header class="flex flex-col gap-2">
      <h1 class="font-display text-2xl font-semibold md:text-4xl">
        Специалисты
      </h1>
      <p class="max-w-2xl text-fg-muted md:text-lg">
        Музыканты, фотографы, ведущие, диджеи и другие. В карточке — чем человек занимается, где работает и как с ним связаться.
      </p>
    </header>

    <div
      role="search"
      class="grid gap-3 rounded-card bg-muted p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]"
    >
      <UiSearchInput
        v-model="search"
        label="Имя"
        placeholder="Например, Иван"
        class="sm:col-span-2 lg:col-span-1"
      />
      <UiSelect
        :model-value="filters.city"
        label="Город"
        placeholder="Все города"
        :options="cityOptions"
        @update:model-value="setFilter('city', $event)"
      />
      <UiSelect
        :model-value="filters.specialization"
        label="Специализация"
        placeholder="Все специализации"
        :options="specializationOptions"
        @update:model-value="setFilter('specialization', $event)"
      />
    </div>

    <section
      ref="results"
      aria-labelledby="results-title"
      class="flex scroll-mt-24 flex-col gap-6"
      :aria-busy="loading"
    >
      <h2
        id="results-title"
        class="text-sm font-medium text-fg-muted"
        aria-live="polite"
      >
        <template v-if="loading && !data">
          Ищем специалистов…
        </template>
        <template v-else-if="data">
          {{ found }}
        </template>
        <span
          v-else
          class="sr-only"
        >Результаты поиска</span>
      </h2>

      <ListError
        v-if="error"
        :message="apiErrorMessage(error)"
        @retry="retry()"
      />

      <div
        v-else-if="loading && !data"
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <SpecialistCardSkeleton
          v-for="n in 6"
          :key="n"
        />
      </div>

      <ListEmpty
        v-else-if="data && data.data.length === 0"
        title="Таких специалистов пока нет"
        :can-reset="hasFilters || page > 1"
        @reset="reset()"
      >
        <template v-if="hasFilters">
          Попробуйте другой город или специализацию либо измените поиск.
        </template>
        <template v-else>
          Карточки появятся здесь, когда специалисты их заполнят.
        </template>
      </ListEmpty>

      <template v-else-if="data">
        <div
          class="grid gap-4 transition-opacity md:grid-cols-2 xl:grid-cols-3"
          :class="{ 'opacity-60': loading }"
        >
          <SpecialistCard
            v-for="specialist in data.data"
            :key="specialist.id"
            :specialist="specialist"
          />
        </div>
        <UiPagination
          :page="data.meta.current_page"
          :last-page="data.meta.last_page"
          :query-for="pageQuery"
        />
      </template>
    </section>
  </div>
</template>

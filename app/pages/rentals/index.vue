<script setup lang="ts">
const api = useSiteApi()
const { data: catalog, error: catalogError, refresh: refreshCatalog } = await useCatalog()

const { filters, page, hasFilters, setFilter, pageQuery, reset } = useListFilters(['city', 'search'] as const)
const search = useDebouncedSearch(() => filters.value.search, value => setFilter('search', value, { replace: true }))

const params = computed(() => ({
  city: filters.value.city,
  search: filters.value.search,
  page: page.value,
  per_page: 24
}))

// Как у коллективов, список собирается в браузере по фильтрам из адреса.
const { data, status, error, refresh } = useAsyncData(
  () => `rentals:${JSON.stringify(params.value)}`,
  () => api.rentals(params.value),
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
const cityName = computed(() => catalog.value.cities.find(c => c.slug === filters.value.city)?.name)

const found = computed(() => {
  const total = data.value?.meta.total ?? 0
  if (total === 0) {
    return 'Ничего не нашлось'
  }
  // «Нашёлся 1 прокат», но «нашлось 2 проката» и «нашлось 5 прокатов».
  const verb = total % 10 === 1 && total % 100 !== 11 ? 'Нашёлся' : 'Нашлось'
  return `${verb} ${plural(total, ['прокат', 'проката', 'прокатов'])}`
})

// Смена страницы — к началу списка, иначе человек остаётся у пагинации.
const results = useTemplateRef('results')
watch(page, () => {
  const top = results.value?.getBoundingClientRect().top ?? 0
  if (top < 0) {
    results.value?.scrollIntoView({ block: 'start' })
  }
})

usePageSeo({
  title: () => (cityName.value ? `Прокат звука и света — ${cityName.value}` : 'Прокат звука и света'),
  description: 'Прокат звука и света посуточно: микшерные пульты, микрофоны, колонки, световые приборы и сцена. Цены за сутки, залог, доставка и монтаж, условия аренды и контакты прокатов.'
})
</script>

<template>
  <div class="container-page flex flex-col gap-8 py-8 md:py-12">
    <header class="flex flex-col gap-2">
      <h1 class="font-display text-2xl font-semibold md:text-4xl">
        Прокат
      </h1>
      <p class="max-w-2xl text-fg-muted md:text-lg">
        Звук и свет посуточно: микшерные пульты, микрофоны, колонки, свет и сцена. На странице проката — техника с ценами и залогом, услуги и условия аренды.
      </p>
    </header>

    <div
      role="search"
      aria-label="Поиск техники и прокатов"
      class="grid gap-3 rounded-card bg-muted p-4 sm:grid-cols-[2fr_1fr]"
    >
      <UiSearchInput
        v-model="search"
        label="Что ищете"
        placeholder="Микшер, Shure, прожектор"
      />
      <UiSelect
        :model-value="filters.city"
        label="Город"
        placeholder="Все города"
        :options="cityOptions"
        @update:model-value="setFilter('city', $event)"
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
          Ищем прокаты…
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
        <RentalCardSkeleton
          v-for="n in 6"
          :key="n"
        />
      </div>

      <ListEmpty
        v-else-if="data && data.data.length === 0"
        title="Таких прокатов пока нет"
        :can-reset="hasFilters || page > 1"
        @reset="reset()"
      >
        <template v-if="hasFilters">
          Попробуйте другой город или слово попроще: «микшер» вместо модели пульта.
        </template>
        <template v-else>
          Прокаты появятся здесь после проверки.
        </template>
      </ListEmpty>

      <template v-else-if="data">
        <div
          class="grid gap-4 transition-opacity md:grid-cols-2 xl:grid-cols-3"
          :class="{ 'opacity-60': loading }"
        >
          <RentalCard
            v-for="rental in data.data"
            :key="rental.id"
            :rental="rental"
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

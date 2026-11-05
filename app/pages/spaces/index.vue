<script setup lang="ts">
const api = useSiteApi()
const { data: catalog, error: catalogError, refresh: refreshCatalog } = await useCatalog()

const { filters, page, hasFilters, setFilter, pageQuery, reset } = useListFilters(['city', 'type', 'search'] as const)
const search = useDebouncedSearch(() => filters.value.search, value => setFilter('search', value, { replace: true }))

const params = computed(() => ({
  city: filters.value.city,
  type: filters.value.type,
  search: filters.value.search,
  page: page.value,
  per_page: 24
}))

// Список зависит от фильтров в адресе, поэтому собирается только в браузере.
const { data, status, error, refresh } = useAsyncData(
  () => `spaces:${JSON.stringify(params.value)}`,
  () => api.spaces(params.value),
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
const typeOptions = computed(() => catalog.value.space_types.map(t => ({ value: t.slug, label: t.name })))
const cityName = computed(() => catalog.value.cities.find(c => c.slug === filters.value.city)?.name)
const typeName = computed(() => catalog.value.space_types.find(t => t.slug === filters.value.type)?.name)

const found = computed(() => {
  const total = data.value?.meta.total ?? 0
  if (total === 0) {
    return 'Ничего не нашлось'
  }
  // «Нашлась 1 площадка», но «нашлось 2 площадки» и «нашлось 5 площадок».
  const verb = total % 10 === 1 && total % 100 !== 11 ? 'Нашлась' : 'Нашлось'
  return `${verb} ${plural(total, ['площадка', 'площадки', 'площадок'])}`
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
  title: () => {
    const parts = [typeName.value, cityName.value].filter(Boolean)
    return parts.length ? `Площадки — ${parts.join(', ')}` : 'Площадки для репетиций, записи, съёмок и событий'
  },
  description: 'Репетиционные базы, студии звукозаписи, фотостудии и площадки для мероприятий по часам. Фото, цены, часы работы и свободное время, онлайн-бронь.'
})
</script>

<template>
  <div class="container-page flex flex-col gap-8 py-8 md:py-12">
    <header class="flex flex-col gap-2">
      <h1 class="font-display text-2xl font-semibold md:text-4xl">
        Площадки
      </h1>
      <p class="max-w-2xl text-fg-muted md:text-lg">
        Репетиционные базы, студии, фотостудии и площадки для мероприятий по часам. На странице площадки — залы, цены и свободное время.
      </p>
    </header>

    <div
      role="search"
      class="grid gap-3 rounded-card bg-muted p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]"
    >
      <UiSearchInput
        v-model="search"
        label="Название или адрес"
        placeholder="Например, «Акустика» или Бауманская"
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
        :model-value="filters.type"
        label="Вид"
        placeholder="Все виды"
        :options="typeOptions"
        @update:model-value="setFilter('type', $event)"
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
          Ищем площадки…
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
        class="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <SpaceCardSkeleton
          v-for="n in 8"
          :key="n"
        />
      </div>

      <ListEmpty
        v-else-if="data && data.data.length === 0"
        title="Таких площадок пока нет"
        :can-reset="hasFilters || page > 1"
        @reset="reset()"
      >
        <template v-if="hasFilters">
          Попробуйте другой город или вид либо уберите часть слов из поиска.
        </template>
        <template v-else>
          Площадки появятся здесь после проверки.
        </template>
      </ListEmpty>

      <template v-else-if="data">
        <div
          class="grid gap-x-6 gap-y-10 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          :class="{ 'opacity-60': loading }"
        >
          <SpaceCard
            v-for="(space, index) in data.data"
            :key="space.id"
            :space="space"
            :eager="index < 4"
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

<script setup lang="ts">
const api = useSiteApi()
const { data: catalog, error: catalogError, refresh: refreshCatalog } = await useCatalog()

const { filters, page, hasFilters, setFilter, pageQuery, reset } = useListFilters(['kind', 'city', 'search'] as const)
const search = useDebouncedSearch(() => filters.value.search, value => setFilter('search', value, { replace: true }))

// Чужой вид в адресе — без фильтра: иначе API ответит 422 вместо списка.
const kind = computed(() => collectiveKind(filters.value.kind))

const params = computed(() => ({
  kind: kind.value,
  city: filters.value.city,
  search: filters.value.search,
  page: page.value,
  per_page: 24
}))

// Как у специалистов, список собирается в браузере по фильтрам из адреса.
const { data, status, error, refresh } = useAsyncData(
  () => `collectives:${JSON.stringify(params.value)}`,
  () => api.collectives(params.value),
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
const kindOptions = computed(() => [
  { value: '', label: 'Все', count: 0 },
  ...catalog.value.collective_kinds.map(k => ({ value: k.slug, label: k.name, count: k.collectives_count }))
])
const cityName = computed(() => catalog.value.cities.find(c => c.slug === filters.value.city)?.name)
const kindName = computed(() => catalog.value.collective_kinds.find(k => k.slug === kind.value)?.name)

// Вид — чипы: их всего три, и счётчики видны сразу.
const kindModel = computed({
  get: () => kind.value ?? '',
  set: (value: string) => setFilter('kind', value)
})

const found = computed(() => {
  const total = data.value?.meta.total ?? 0
  if (total === 0) {
    return 'Ничего не нашлось'
  }
  // «Нашёлся 1 коллектив», но «нашлось 2 коллектива» и «нашлось 5 коллективов».
  const verb = total % 10 === 1 && total % 100 !== 11 ? 'Нашёлся' : 'Нашлось'
  return `${verb} ${plural(total, ['коллектив', 'коллектива', 'коллективов'])}`
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
    const parts = [kindName.value, cityName.value].filter(Boolean)
    return parts.length ? `Коллективы — ${parts.join(', ')}` : 'Коллективы: группы, команды и продакшн'
  },
  description: 'Коллективы на Креаториуме: музыкальные группы, сборные команды на событие — ведущий, диджей, фотограф — и фото- и видеопродакшн. Состав, город, контакты и ближайшие выступления.'
})

const chipClass = 'flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-panel px-4 text-sm font-medium whitespace-nowrap text-fg transition-colors peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary-soft-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring hover:border-fg-subtle'
</script>

<template>
  <div class="container-page flex flex-col gap-8 py-8 md:py-12">
    <header class="flex flex-col gap-2">
      <h1 class="font-display text-2xl font-semibold md:text-4xl">
        Коллективы
      </h1>
      <p class="max-w-2xl text-fg-muted md:text-lg">
        Группы, сборные команды на событие и фото- и видеопродакшн. На странице коллектива — состав, контакты и ближайшие выступления.
      </p>
    </header>

    <div
      role="search"
      aria-label="Фильтры коллективов"
      class="flex flex-col gap-4 rounded-card bg-muted p-4"
    >
      <div class="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <UiSearchInput
          v-model="search"
          label="Название"
          placeholder="Например, «Северный ветер»"
        />
        <UiSelect
          :model-value="filters.city"
          label="Город"
          placeholder="Все города"
          :options="cityOptions"
          @update:model-value="setFilter('city', $event)"
        />
      </div>

      <fieldset
        v-if="catalog.collective_kinds.length"
        class="flex min-w-0 flex-col gap-3"
      >
        <legend class="mb-1.5 text-sm font-medium text-fg">
          Вид
        </legend>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="option in kindOptions"
            :key="option.value"
            class="cursor-pointer"
          >
            <input
              v-model="kindModel"
              type="radio"
              name="collectives-kind"
              :value="option.value"
              class="peer sr-only"
            >
            <span :class="chipClass">
              {{ option.label }}
              <span
                v-if="option.count"
                class="font-normal text-fg-muted"
              >{{ option.count }}</span>
            </span>
          </label>
        </div>
      </fieldset>
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
          Ищем коллективы…
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
        <CollectiveCardSkeleton
          v-for="n in 6"
          :key="n"
        />
      </div>

      <ListEmpty
        v-else-if="data && data.data.length === 0"
        title="Таких коллективов пока нет"
        :can-reset="hasFilters || page > 1"
        @reset="reset()"
      >
        <template v-if="hasFilters">
          Попробуйте другой город или вид либо измените поиск.
        </template>
        <template v-else>
          Коллективы появятся здесь, когда специалисты их заведут.
        </template>
      </ListEmpty>

      <template v-else-if="data">
        <div
          class="grid gap-4 transition-opacity md:grid-cols-2 xl:grid-cols-3"
          :class="{ 'opacity-60': loading }"
        >
          <CollectiveCard
            v-for="collective in data.data"
            :key="collective.id"
            :collective="collective"
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

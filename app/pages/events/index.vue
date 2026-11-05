<script setup lang="ts">
import type { EventDatePreset } from '~/utils/wall-time'

const api = useSiteApi()
const { data: catalog, error: catalogError, refresh: refreshCatalog } = await useCatalog()

const { filters, page, hasFilters, setFilter, setFilters, pageQuery, reset } = useListFilters(['city', 'type', 'from', 'to'] as const)

function validDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) ? value : ''
}

// Даты из адреса: мусор отбрасываем, перепутанные «с» и «по» меняем местами — иначе API ответит 422.
const range = computed(() => {
  const from = validDate(filters.value.from)
  const to = validDate(filters.value.to)
  return from && to && to < from ? { from: to, to: from } : { from, to }
})

const params = computed(() => ({
  city: filters.value.city,
  type: filters.value.type,
  from: range.value.from,
  to: range.value.to,
  page: page.value,
  per_page: 24
}))

// Как поиск пространств: список зависит от фильтров в адресе и собирается в браузере.
const { data, status, error, refresh } = useAsyncData(
  () => `events:${JSON.stringify(params.value)}`,
  () => api.events(params.value),
  { server: false, lazy: true }
)

// Справочник мог не загрузиться вместе со списком: «Повторить» перезапрашивает и его.
function retry(): void {
  if (catalogError.value) {
    refreshCatalog()
  }
  refresh()
}

// «Сегодня» — по часам человека и в день просмотра, а не сборки: считаем уже в браузере.
const today = ref('')
onMounted(() => {
  today.value = todayLocal()
})

const presetOptions: { value: EventDatePreset | 'any', label: string }[] = [
  { value: 'any', label: 'Все даты' },
  { value: 'today', label: 'Сегодня' },
  { value: 'tomorrow', label: 'Завтра' },
  { value: 'weekend', label: 'Выходные' },
  { value: 'week', label: 'Неделя' }
]

// Быстрая дата — те же «с» и «по» в адресе. Свои даты, не совпавшие ни с одной, — ни одна не выбрана.
const preset = computed({
  get: (): string => {
    const { from, to } = range.value
    if (!from && !to) {
      return 'any'
    }
    if (!today.value) {
      return ''
    }
    const presets = eventDatePresets(today.value)
    return (Object.keys(presets) as EventDatePreset[]).find(key => presets[key].from === from && presets[key].to === to) ?? ''
  },
  set: (value: string) => {
    const chosen = today.value && value !== 'any' ? eventDatePresets(today.value)[value as EventDatePreset] : undefined
    setFilters({ from: chosen?.from ?? '', to: chosen?.to ?? '' })
  }
})

// «С» позже «по» — «по» сдвигается следом, и наоборот.
function setFrom(value: string): void {
  const to = range.value.to
  setFilters({ from: value, to: value && to && to < value ? value : to })
}

function setTo(value: string): void {
  const from = range.value.from
  setFilters({ from: value && from && value < from ? value : from, to: value })
}

const loading = computed(() => status.value === 'idle' || status.value === 'pending')
const cityOptions = computed(() => catalog.value.cities.map(c => ({ value: c.slug, label: c.name })))
const typeOptions = computed(() => catalog.value.event_types.map(t => ({ value: t.slug, label: t.name })))
const cityName = computed(() => catalog.value.cities.find(c => c.slug === filters.value.city)?.name)
const typeName = computed(() => catalog.value.event_types.find(t => t.slug === filters.value.type)?.name)

const found = computed(() => {
  const total = data.value?.meta.total ?? 0
  return total === 0 ? 'Ничего не нашлось' : `Нашлось ${plural(total, ['событие', 'события', 'событий'])}`
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
    return parts.length ? `Афиша — ${parts.join(', ')}` : 'Афиша: концерты, джемы, мастер-классы и вечеринки'
  },
  description: 'Концерты, джемы, мастер-классы и вечеринки в репетиционных базах, студиях и залах. Дата и время, место, состав и вход.'
})

const chipClass = 'flex h-10 items-center rounded-full border border-line-strong bg-panel px-4 text-sm font-medium whitespace-nowrap text-fg transition-colors peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-primary-soft-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring hover:border-fg-subtle'
</script>

<template>
  <div class="container-page flex flex-col gap-8 py-8 md:py-12">
    <header class="flex flex-col gap-2">
      <h1 class="font-display text-2xl font-semibold md:text-4xl">
        Афиша
      </h1>
      <p class="max-w-2xl text-fg-muted md:text-lg">
        Концерты, джемы, мастер-классы и вечеринки в пространствах Креаториума. На странице события — состав, место и вход.
      </p>
    </header>

    <div
      role="search"
      aria-label="Фильтры афиши"
      class="flex flex-col gap-4 rounded-card bg-muted p-4"
    >
      <div class="grid gap-3 sm:grid-cols-2">
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

      <fieldset class="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <legend class="mb-1.5 text-sm font-medium text-fg">
          Когда
        </legend>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="option in presetOptions"
            :key="option.value"
            class="cursor-pointer"
          >
            <input
              v-model="preset"
              type="radio"
              name="events-date"
              :value="option.value"
              class="peer sr-only"
            >
            <span :class="chipClass">{{ option.label }}</span>
          </label>
        </div>
        <div class="grid grid-cols-2 gap-3 lg:w-80 lg:shrink-0">
          <UiDateInput
            :model-value="range.from"
            label="С"
            :min="today || undefined"
            @update:model-value="setFrom"
          />
          <UiDateInput
            :model-value="range.to"
            label="По"
            :min="range.from || today || undefined"
            @update:model-value="setTo"
          />
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
          Ищем события…
        </template>
        <template v-else-if="data">
          {{ found }}
        </template>
        <span
          v-else
          class="sr-only"
        >События</span>
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
        <EventCardSkeleton
          v-for="n in 8"
          :key="n"
        />
      </div>

      <ListEmpty
        v-else-if="data && data.data.length === 0"
        :title="hasFilters ? 'Таких событий пока нет' : 'Событий пока нет'"
        :can-reset="hasFilters || page > 1"
        @reset="reset()"
      >
        <template v-if="hasFilters">
          Попробуйте другие даты, город или вид события.
        </template>
        <template v-else>
          События появятся здесь, когда пространства и организаторы их заведут.
        </template>
      </ListEmpty>

      <template v-else-if="data">
        <div
          class="grid gap-x-6 gap-y-10 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          :class="{ 'opacity-60': loading }"
        >
          <EventCard
            v-for="(event, index) in data.data"
            :key="event.id"
            :event="event"
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

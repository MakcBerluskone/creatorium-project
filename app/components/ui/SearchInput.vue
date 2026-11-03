<script setup lang="ts">
import { Search, X } from '@lucide/vue'

defineProps<{
  label: string
  placeholder?: string
  hideLabel?: boolean
}>()

const model = defineModel<string>({ default: '' })
const id = useId()
const input = useTemplateRef('input')

function clear() {
  model.value = ''
  input.value?.focus()
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      :for="id"
      class="text-sm font-medium text-fg"
      :class="{ 'sr-only': hideLabel }"
    >{{ label }}</label>
    <div class="relative">
      <Search
        class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted"
        aria-hidden="true"
      />
      <input
        :id="id"
        ref="input"
        v-model="model"
        type="search"
        enterkeyhint="search"
        autocomplete="off"
        maxlength="255"
        :placeholder="placeholder"
        class="h-11 w-full rounded-control border border-line-strong bg-panel pr-10 pl-9 text-[0.9375rem] text-fg transition-colors placeholder:text-fg-subtle hover:border-fg-subtle [&::-webkit-search-cancel-button]:hidden"
      >
      <button
        v-if="model"
        type="button"
        class="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-control text-fg-muted hover:bg-hover hover:text-fg"
        aria-label="Очистить поиск"
        @click="clear"
      >
        <X
          class="size-4"
          aria-hidden="true"
        />
      </button>
    </div>
  </div>
</template>

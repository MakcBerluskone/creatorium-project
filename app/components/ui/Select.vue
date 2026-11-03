<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

defineProps<{
  label: string
  /** Пункт «все» с пустым значением. */
  placeholder: string
  options: { value: string, label: string }[]
  name?: string
  /** Подпись видна только экранным читалкам. */
  hideLabel?: boolean
}>()

const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      :for="id"
      class="text-sm font-medium text-fg"
      :class="{ 'sr-only': hideLabel }"
    >{{ label }}</label>
    <div class="relative">
      <select
        :id="id"
        v-model="model"
        :name="name"
        class="h-11 w-full cursor-pointer rounded-control border border-line-strong bg-panel pr-10 pl-3 text-[0.9375rem] text-fg transition-colors hover:border-fg-subtle"
        :class="{ 'text-fg-muted': !model }"
      >
        <option value="">
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          class="text-fg"
        >
          {{ option.label }}
        </option>
      </select>
      <ChevronDown
        class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

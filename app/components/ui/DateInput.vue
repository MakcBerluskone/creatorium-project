<script setup lang="ts">
defineProps<{
  label: string
  /** YYYY-MM-DD. */
  min?: string
  max?: string
}>()

const model = defineModel<string>({ default: '' })
const id = useId()

// Собранный HTML — без дат, а в адресе они могут быть. Класс при гидратации
// не правится, поэтому серую «пустую» дату включаем уже после монтирования.
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <div class="flex min-w-0 flex-col gap-1.5">
    <label
      :for="id"
      class="text-sm font-medium text-fg"
    >{{ label }}</label>
    <!-- lazy: дата уходит в адрес, когда выбрана целиком, а не на каждую цифру. -->
    <input
      :id="id"
      v-model.lazy="model"
      type="date"
      :min="min"
      :max="max"
      class="h-11 w-full min-w-0 rounded-control border border-line-strong bg-panel px-3 text-left text-[0.9375rem] text-fg transition-colors hover:border-fg-subtle [&::-webkit-date-and-time-value]:text-left"
      :class="{ 'text-fg-muted': mounted && !model }"
    >
  </div>
</template>

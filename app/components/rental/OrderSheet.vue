<script setup lang="ts">
import { X } from '@lucide/vue'

defineProps<{
  rentalId: number
  /** Подпись под выбором: где и как идёт заказ. */
  note: string
}>()

/** Лист снизу экрана на телефоне: тот же выбор, что в блоке справа на компьютере. */
const open = defineModel<boolean>('open', { default: false })

const dialog = useTemplateRef('dialog')
const titleId = useId()

// Нативный dialog держит фокус внутри и закрывается по Esc сам — как у просмотра фото.
watch(open, (value) => {
  const el = dialog.value
  if (!el) {
    return
  }
  if (value && !el.open) {
    el.showModal()
    document.documentElement.style.overflow = 'hidden'
  } else if (!value && el.open) {
    el.close()
  }
}, { flush: 'post' })

function onClose() {
  document.documentElement.style.overflow = ''
  open.value = false
}

onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <dialog
    ref="dialog"
    :aria-labelledby="titleId"
    class="m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-card bg-panel p-0 text-fg shadow-overlay backdrop:bg-backdrop/60"
    @close="onClose"
    @click.self="open = false"
  >
    <div class="container-page flex flex-col gap-3 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div class="flex items-center justify-between gap-4">
        <h2
          :id="titleId"
          class="font-display text-lg font-semibold"
        >
          Заказать технику
        </h2>
        <button
          type="button"
          class="-mr-2 flex size-11 items-center justify-center rounded-control text-fg hover:bg-hover"
          aria-label="Закрыть"
          @click="open = false"
        >
          <X
            class="size-6"
            aria-hidden="true"
          />
        </button>
      </div>
      <RentalOrderRoles
        :rental-id="rentalId"
        class="-mx-3"
      />
      <p class="text-sm text-fg-muted">
        {{ note }}
      </p>
    </div>
  </dialog>
</template>

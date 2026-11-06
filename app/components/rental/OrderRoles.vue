<script setup lang="ts">
import { Building, ChevronRight, Guitar, Ticket } from '@lucide/vue'

const props = defineProps<{
  rentalId: number
}>()

const links = useSiteLinks()
const labelId = useId()

// Заказ живёт в кабинете того, кто заказывает: у каждого кабинета свой /rentals/{id}.
const roles = computed(() => [
  { label: 'Я музыкант или специалист', icon: Guitar, href: links.orderRental('specialist', props.rentalId) },
  { label: 'Я организатор событий', icon: Ticket, href: links.orderRental('organizer', props.rentalId) },
  { label: 'Я площадка', icon: Building, href: links.orderRental('space', props.rentalId) }
])
</script>

<template>
  <div class="flex flex-col gap-1">
    <p
      :id="labelId"
      class="px-3 text-sm font-medium text-fg"
    >
      Кто заказывает?
    </p>
    <ul
      :aria-labelledby="labelId"
      class="flex flex-col"
    >
      <li
        v-for="role in roles"
        :key="role.href"
      >
        <a
          :href="role.href"
          class="flex min-h-11 items-center gap-3 rounded-control px-3 py-2.5 text-fg transition-colors hover:bg-hover"
        >
          <component
            :is="role.icon"
            class="size-4 shrink-0 text-fg-muted"
            aria-hidden="true"
          />
          <span class="min-w-0 flex-1">{{ role.label }}</span>
          <ChevronRight
            class="size-4 shrink-0 text-fg-subtle"
            aria-hidden="true"
          />
        </a>
      </li>
    </ul>
  </div>
</template>

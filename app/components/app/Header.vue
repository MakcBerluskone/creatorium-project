<script setup lang="ts">
import { Menu, X } from '@lucide/vue'

// Пять пунктов помещаются в строку только с lg, уже — меню за кнопкой.
const links = [
  { to: '/spaces', label: 'Площадки' },
  { to: '/specialists', label: 'Специалисты' },
  { to: '/events', label: 'Афиша' },
  { to: '/for-spaces', label: 'Для площадок' },
  { to: '/for-specialists', label: 'Для специалистов' }
]

const open = ref(false)
const route = useRoute()

watch(() => route.fullPath, () => {
  open.value = false
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-line bg-panel/95 backdrop-blur supports-[backdrop-filter]:bg-panel/85"
    @keydown="onKeydown"
  >
    <div class="container-page flex h-16 items-center justify-between gap-6">
      <AppLogo />

      <nav
        aria-label="Основное меню"
        class="hidden lg:block"
      >
        <ul class="flex items-center gap-1">
          <li
            v-for="link in links"
            :key="link.to"
          >
            <NuxtLink
              :to="link.to"
              class="rounded-control px-3 py-2 text-[0.9375rem] font-medium text-fg-muted transition-colors hover:text-fg"
              active-class="!text-primary-text"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <button
        type="button"
        class="-mr-2 flex size-11 items-center justify-center rounded-control text-fg hover:bg-hover lg:hidden"
        :aria-expanded="open"
        aria-controls="mobile-menu"
        :aria-label="open ? 'Закрыть меню' : 'Открыть меню'"
        @click="open = !open"
      >
        <component
          :is="open ? X : Menu"
          class="size-6"
          aria-hidden="true"
        />
      </button>
    </div>

    <nav
      v-show="open"
      id="mobile-menu"
      aria-label="Основное меню"
      class="border-t border-line bg-panel lg:hidden"
    >
      <ul class="container-page flex flex-col py-2">
        <li
          v-for="link in links"
          :key="link.to"
        >
          <NuxtLink
            :to="link.to"
            class="flex h-12 items-center rounded-control px-1 text-base font-medium text-fg"
            active-class="!text-primary-text"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

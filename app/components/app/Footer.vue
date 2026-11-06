<script setup lang="ts">
const { brand } = useAppConfig()
const links = useSiteLinks()
const year = new Date().getFullYear()

interface FooterLink {
  label: string
  /** Страница сайта. */
  to?: string
  /** Кабинет — другое приложение. */
  href?: string
}

const columns: { title: string, items: FooterLink[] }[] = [
  {
    title: 'Каталог',
    items: [
      { label: 'Площадки', to: '/spaces' },
      { label: 'Специалисты', to: '/specialists' },
      { label: 'Коллективы', to: '/collectives' },
      { label: 'Афиша', to: '/events' }
    ]
  },
  {
    title: 'Участникам',
    items: [
      { label: 'Для площадок', to: '/for-spaces' },
      { label: 'Для специалистов', to: '/for-specialists' }
    ]
  },
  {
    title: 'Кабинеты',
    items: [
      { label: 'Кабинет площадки', href: links.spaceCabinet },
      { label: 'Кабинет специалиста', href: links.specialistCabinet }
    ]
  }
]
</script>

<template>
  <footer class="border-t border-line bg-muted">
    <div class="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
      <div class="flex flex-col gap-3">
        <AppLogo />
        <p class="max-w-xs text-sm text-fg-muted">
          Репетиционные базы, студии и площадки для мероприятий по часам. Свободное время и онлайн-бронь.
        </p>
      </div>
      <nav
        v-for="column in columns"
        :key="column.title"
        :aria-label="column.title"
      >
        <p class="mb-3 text-sm font-semibold text-fg">
          {{ column.title }}
        </p>
        <ul class="flex flex-col gap-2">
          <li
            v-for="item in column.items"
            :key="item.label"
          >
            <NuxtLink
              :to="item.to ?? item.href"
              :external="!!item.href"
              class="text-sm text-fg-muted transition-colors hover:text-primary-text"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
    <div class="border-t border-line">
      <p class="container-page py-5 text-xs text-fg-muted">
        © {{ year }} {{ brand }}
      </p>
    </div>
  </footer>
</template>

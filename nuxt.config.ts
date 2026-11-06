// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import type { components } from './shared/types/api'

type Sitemap = components['schemas']['SitemapResource']

// Конфиг читается до runtimeConfig, поэтому адрес API для списка страниц берём из env напрямую.
const apiBase = (process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8010').replace(/\/+$/, '')

export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }
      ],
      meta: [
        { name: 'theme-color', content: '#ffffff' }
      ]
    }
  },

  css: [
    '@fontsource-variable/inter',
    '@fontsource-variable/unbounded',
    '~/assets/css/main.css'
  ],

  // Значения по умолчанию — для локальной разработки. На сборке их задают
  // переменные NUXT_PUBLIC_*: nuxt generate вшивает их в статику.
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8010',
      siteUrl: 'http://localhost:3001',
      spaceCabinetUrl: 'https://space.creatorium.loc:5177',
      specialistCabinetUrl: 'https://app.creatorium.loc:5178'
    }
  },

  // Иначе Nitro оставляет @lucide/vue внешним CommonJS-пакетом, и на сборке
  // страницы с иконками падают с 500: useLucideProps() отдаёт undefined.
  build: {
    transpile: ['@lucide/vue']
  },

  // 3000 занят лендингом bk-alliance.
  devServer: {
    port: 3001
  },

  experimental: {
    // 404.html собирается настоящей страницей ошибки, а не пустой оболочкой.
    prerenderErrorPages: true
  },

  compatibilityDate: '2026-10-30',

  nitro: {
    prerender: {
      // Список страниц задаём сами: обход ссылок пошёл бы по фильтрам вида /spaces?type=…
      crawlLinks: false,
      routes: ['/', '/spaces', '/specialists', '/collectives', '/events', '/for-spaces', '/for-specialists', '/sitemap.xml', '/robots.txt'],
      // У API лимит 600 запросов в минуту с одного адреса.
      concurrency: 4
    },
    hooks: {
      // Страницы площадок, специалистов, коллективов, событий и организаторов — по списку из API на момент сборки.
      async 'prerender:routes'(routes) {
        const url = `${apiBase}/api/site/sitemap`
        let response: Response
        try {
          response = await fetch(url, { headers: { Accept: 'application/json' } })
        } catch (error) {
          throw new Error(`Сборка не получила список страниц: ${url} недоступен`, { cause: error })
        }
        if (!response.ok) {
          throw new Error(`Сборка не получила список страниц: ${url} ответил ${response.status}`)
        }
        const { data } = await response.json() as { data: Sitemap }
        for (const space of data.spaces) {
          routes.add(`/spaces/${space.id}`)
        }
        for (const specialist of data.specialists) {
          routes.add(`/specialists/${specialist.id}`)
        }
        for (const collective of data.collectives) {
          routes.add(`/collectives/${collective.id}`)
        }
        for (const event of data.events) {
          routes.add(`/events/${event.id}`)
        }
        for (const organizer of data.organizers) {
          routes.add(`/organizers/${organizer.id}`)
        }
      }
    }
  },

  vite: {
    plugins: [tailwindcss()]
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})

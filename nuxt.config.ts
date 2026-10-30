// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // 3000 занят лендингом bk-alliance.
  devServer: {
    port: 3001
  },

  compatibilityDate: '2026-10-30',

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

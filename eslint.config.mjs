// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // Типы API генерирует openapi-typescript (pnpm api:types), руками их не правят.
  ignores: ['shared/types/api.ts']
})

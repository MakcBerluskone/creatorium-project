/**
 * Города, виды пространств и специализации. На сборке попадают в страницу,
 * поэтому фильтры и плитки видны сразу, без запроса из браузера.
 *
 * Без справочников сборка падает, как и главная: иначе в статику уйдут пустые
 * фильтры, а браузер справочник с собранной страницы не перезапрашивает.
 */
export async function useCatalog() {
  const api = useSiteApi()
  const result = await useAsyncData('catalog', () => api.catalog(), {
    default: () => ({ cities: [], space_types: [], specializations: [] })
  })

  if (import.meta.server && result.error.value) {
    throw createError({ statusCode: 502, statusMessage: 'Site API error', fatal: true })
  }

  return result
}

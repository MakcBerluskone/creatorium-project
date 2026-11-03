/**
 * Города, виды пространств и специализации. На сборке попадают в страницу,
 * поэтому фильтры и плитки видны сразу, без запроса из браузера.
 */
export function useCatalog() {
  const api = useSiteApi()
  return useAsyncData('catalog', () => api.catalog(), {
    default: () => ({ cities: [], space_types: [], specializations: [] })
  })
}

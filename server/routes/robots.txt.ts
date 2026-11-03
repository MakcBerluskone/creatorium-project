// Генерируется при сборке: адрес sitemap зависит от NUXT_PUBLIC_SITE_URL.
// Стенд закрыт от поисковиков целиком.
export default defineEventHandler((event) => {
  const { siteUrl, indexable } = useRuntimeConfig(event).public
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  if (!indexable) {
    return 'User-agent: *\nDisallow: /\n'
  }
  const site = String(siteUrl).replace(/\/+$/, '')
  return `User-agent: *\nDisallow:\n\nSitemap: ${site}/sitemap.xml\n`
})

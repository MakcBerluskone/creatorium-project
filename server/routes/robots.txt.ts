// Генерируется при сборке: адрес sitemap зависит от NUXT_PUBLIC_SITE_URL.
export default defineEventHandler((event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl).replace(/\/+$/, '')
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return `User-agent: *\nDisallow:\n\nSitemap: ${site}/sitemap.xml\n`
})

import type { Sitemap, Wrapped } from '#shared/types/site'

const STATIC_PAGES = ['/', '/spaces', '/specialists', '/for-spaces', '/for-specialists']

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function entry(loc: string, lastmod?: string): string {
  const date = lastmod ? `<lastmod>${escapeXml(lastmod.slice(0, 10))}</lastmod>` : ''
  return `<url><loc>${escapeXml(loc)}</loc>${date}</url>`
}

// Собирается при nuxt generate и ложится в статику как sitemap.xml.
export default defineEventHandler(async (event) => {
  const { apiBase, siteUrl } = useRuntimeConfig(event).public
  const site = String(siteUrl).replace(/\/+$/, '')
  const { data } = await $fetch<Wrapped<Sitemap>>(`${String(apiBase).replace(/\/+$/, '')}/api/site/sitemap`, {
    headers: { Accept: 'application/json' }
  })

  const urls = [
    ...STATIC_PAGES.map(path => entry(`${site}${path}`)),
    ...data.spaces.map(space => entry(`${site}/spaces/${space.id}`, space.updated_at)),
    ...data.specialists.map(specialist => entry(`${site}/specialists/${specialist.id}`, specialist.updated_at))
  ]

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
})

import type { MaybeRefOrGetter } from 'vue'

interface PageSeo {
  /** Без « · Креаториум»: его добавляет titleTemplate. */
  title: MaybeRefOrGetter<string | undefined>
  description: MaybeRefOrGetter<string | undefined>
  image?: MaybeRefOrGetter<string | null | undefined>
  type?: 'website' | 'article' | 'profile'
}

/** Метатеги страницы и канонический адрес — путь без query. */
export function usePageSeo(seo: PageSeo) {
  const route = useRoute()
  const links = useSiteLinks()
  const canonical = computed(() => links.absolute(route.path))

  useSeoMeta({
    title: seo.title,
    ogTitle: seo.title,
    description: seo.description,
    ogDescription: seo.description,
    ogType: seo.type ?? 'website',
    ogUrl: canonical,
    ogImage: () => toValue(seo.image) || undefined,
    twitterCard: () => (toValue(seo.image) ? 'summary_large_image' : 'summary')
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }]
  })
}

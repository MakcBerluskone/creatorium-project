function trimSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

/** Адреса кабинетов и канонические ссылки сайта из runtimeConfig. */
export function useSiteLinks() {
  const config = useRuntimeConfig().public
  const siteUrl = trimSlash(String(config.siteUrl))
  const spaceCabinet = trimSlash(String(config.spaceCabinetUrl))
  const specialistCabinet = trimSlash(String(config.specialistCabinetUrl))

  return {
    siteUrl,
    absolute: (path: string) => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`,
    spaceCabinet,
    spaceRegister: `${spaceCabinet}/register`,
    specialistCabinet,
    specialistRegister: `${specialistCabinet}/register`,
    bookSpace: (spaceId: number) => `${specialistCabinet}/bookings/new/${spaceId}`
  }
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

/** Чей кабинет: технику проката заказывают специалист, организатор и площадка. */
type OrderCabinet = 'specialist' | 'organizer' | 'space'

/** Адреса кабинетов и канонические ссылки сайта из runtimeConfig. */
export function useSiteLinks() {
  const config = useRuntimeConfig().public
  const siteUrl = trimSlash(String(config.siteUrl))
  const spaceCabinet = trimSlash(String(config.spaceCabinetUrl))
  const specialistCabinet = trimSlash(String(config.specialistCabinetUrl))
  const organizerCabinet = trimSlash(String(config.organizerCabinetUrl))
  const cabinets: Record<OrderCabinet, string> = {
    specialist: specialistCabinet,
    organizer: organizerCabinet,
    space: spaceCabinet
  }

  return {
    siteUrl,
    absolute: (path: string) => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`,
    spaceCabinet,
    spaceRegister: `${spaceCabinet}/register`,
    specialistCabinet,
    specialistRegister: `${specialistCabinet}/register`,
    organizerCabinet,
    bookSpace: (spaceId: number) => `${specialistCabinet}/bookings/new/${spaceId}`,
    orderRental: (cabinet: OrderCabinet, rentalId: number) => `${cabinets[cabinet]}/rentals/${rentalId}`
  }
}

import type { Photo } from '#shared/types/site'

/** Позиция техники проката или доп. оборудования площадки — то, что нужно для просмотра фото. */
interface EquipmentWithPhoto {
  display_name: string
  photo_url: string | null
  photo_thumb_url: string | null
}

/**
 * Просмотр фото позиции в UiLightbox. Фото у позиции одно и квадратное — своё,
 * а нет его — модели: thumb 160 px, большое 512 px.
 */
export function useEquipmentLightbox() {
  const opened = ref<EquipmentWithPhoto | null>(null)
  const photos = computed<Photo[]>(() => {
    const item = opened.value
    if (!item?.photo_url) {
      return []
    }
    return [{ url: item.photo_url, thumb_url: item.photo_thumb_url ?? item.photo_url, width: 512, height: 512 }]
  })
  const index = computed({
    get: () => (photos.value.length ? 0 : null),
    set: (value: number | null) => {
      if (value === null) {
        opened.value = null
      }
    }
  })
  const title = computed(() => opened.value?.display_name ?? '')

  return { opened, photos, index, title }
}

import type { Component } from 'vue'
import { Cable, Drum, Guitar, KeyboardMusic, Package, Projector, Speaker, Spotlight, Theater } from '@lucide/vue'

// Категории моделей заданы в API кодом, а не справочником: коды не меняются.
const icons: Record<string, Component> = {
  sound: Speaker,
  light: Spotlight,
  drums: Drum,
  keys: KeyboardMusic,
  guitar: Guitar,
  stage: Theater,
  video: Projector,
  other: Cable
}

/** Иконка категории техники — для позиции без фото; для новой категории — общая. */
export function equipmentCategoryIcon(slug: string | undefined): Component {
  return (slug && icons[slug]) || Package
}

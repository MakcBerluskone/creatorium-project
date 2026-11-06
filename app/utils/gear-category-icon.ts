import type { Component } from 'vue'
import { Cable, Package, Projector, Speaker, Spotlight, Theater } from '@lucide/vue'

// Категории техники заданы в API кодом, а не справочником: коды не меняются.
const icons: Record<string, Component> = {
  sound: Speaker,
  light: Spotlight,
  stage: Theater,
  video: Projector,
  other: Cable
}

/** Иконка категории техники проката — для позиции без фото; для новой категории — общая. */
export function gearCategoryIcon(slug: string | undefined): Component {
  return (slug && icons[slug]) || Package
}

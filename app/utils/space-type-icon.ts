import type { Component } from 'vue'
import { Building, Camera, Drum, Mic, PartyPopper } from '@lucide/vue'

// Коды видов не меняются после создания (см. «Справочники» в решениях), на них можно опираться.
const icons: Record<string, Component> = {
  rehearsal_base: Drum,
  recording_studio: Mic,
  photo_studio: Camera,
  event_hall: PartyPopper
}

/** Иконка вида пространства; для нового вида из админки — общая. */
export function spaceTypeIcon(slug: string | undefined): Component {
  return (slug && icons[slug]) || Building
}

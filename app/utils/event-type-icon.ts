import type { Component } from 'vue'
import { GraduationCap, Guitar, MicVocal, PartyPopper, Ticket } from '@lucide/vue'

// Коды видов не меняются после создания, как у видов пространств.
const icons: Record<string, Component> = {
  concert: MicVocal,
  jam: Guitar,
  workshop: GraduationCap,
  party: PartyPopper
}

/** Иконка вида события для заглушки без афиши; для нового вида — общая. */
export function eventTypeIcon(slug: string | undefined): Component {
  return (slug && icons[slug]) || Ticket
}

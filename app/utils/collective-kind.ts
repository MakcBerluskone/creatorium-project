import type { CollectiveKind } from '#shared/types/site'

// Виды коллективов заданы в API кодом, а не справочником. Record требует все коды:
// появится новый вид в api.ts — typecheck напомнит дописать его сюда.
const kinds: Record<CollectiveKind, true> = {
  band: true,
  team: true,
  production: true
}

/** Вид из адреса страницы. Чужой код API отклонил бы с 422 — такой фильтр просто не применяем. */
export function collectiveKind(value: string): CollectiveKind | undefined {
  return Object.hasOwn(kinds, value) ? value as CollectiveKind : undefined
}

/** HTTP-статус ошибки $fetch или useAsyncData; 0 — ответа не было вовсе. */
export function apiErrorStatus(error: unknown): number {
  if (error && typeof error === 'object') {
    const e = error as { statusCode?: number, status?: number, response?: { status?: number } }
    return e.statusCode ?? e.status ?? e.response?.status ?? 0
  }
  return 0
}

/** Текст для человека. Подробности ошибки ему не нужны, нужен следующий шаг. */
export function apiErrorMessage(error: unknown): string {
  const status = apiErrorStatus(error)
  if (status === 429) {
    return 'Слишком много запросов, попробуйте через минуту'
  }
  if (status === 0) {
    return 'Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз'
  }
  if (status === 422) {
    return 'Сервер не принял параметры запроса. Сбросьте фильтры и попробуйте ещё раз'
  }
  if (status >= 500) {
    return 'Сервер сейчас не отвечает. Попробуйте ещё раз через пару минут'
  }
  return 'Не удалось загрузить данные. Попробуйте ещё раз'
}

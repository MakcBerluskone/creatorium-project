# Creatorium — сайт

Сайт creatorium.ru: Nuxt 4, TypeScript, Tailwind CSS 4. Что на нём будет — вопрос 7 в [creatorium-docs](https://github.com/MakcBerluskone/creatorium-docs). Кабинеты живут в `creatorium-admin`, API — в `creatorium-api`.

## Запуск

Нужны Node.js 22.12+ и pnpm 12.

```bash
pnpm install
```

```bash
pnpm dev
```

Сайт откроется на http://localhost:3001: порт 3000 занят лендингом bk-alliance.

| Команда | Что делает |
|---|---|
| `pnpm dev` | dev-сервер |
| `pnpm build` | прод-сборка в `.output` |
| `pnpm preview` | посмотреть прод-сборку |
| `pnpm typecheck` | `vue-tsc` через `nuxt typecheck` |
| `pnpm lint` | ESLint |

## OSPanel

Проект `creatorium.loc` описан в `.osp/project.ini` в корне `creatorium`: OSPanel даёт домену запись в hosts и сертификат и отдаёт только `public/`. Сам сайт в разработке — на dev-сервере.

<template>
  <div class="flex min-h-dvh flex-col">
    <a
      href="#main"
      class="sr-only z-50 rounded-control bg-primary px-4 py-2 text-primary-contrast focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >Перейти к содержанию</a>
    <AppHeader />
    <main
      id="main"
      class="flex-1"
    >
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

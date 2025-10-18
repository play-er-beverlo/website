<!-- eslint-disable vue/no-multiple-template-root -->
<template>
  <nuxt-loading-indicator color="#00adee" />
  <main class="flex-auto flex flex-col">
    <slot />
  </main>
  <app-footer class="flex-initial" />
</template>

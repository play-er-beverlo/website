<script lang="ts" setup></script>

<template>
  <footer class="w-full py-6">
    <div
      class="flex flex-col sm:flex-row gap-4 mx-auto max-w-6xl px-8 sm:justify-between items-center text-center"
    >
      <div class="copyright">
        &copy; {{ new Date().getFullYear() }} Play-ER. Alle rechten voorbehouden.
      </div>
      <div class="website-by">
        Website door
        <a href="https://steffbeckers.com/nl" target="_blank" rel="noopener noreferrer"
          >Steff Beckers</a
        >
      </div>
    </div>
  </footer>
</template>

<style scoped>
@reference "./../assets/css/main.css";

footer {
  @apply bg-neutral-500 text-white;
}
</style>

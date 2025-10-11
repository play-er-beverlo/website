export default defineNuxtConfig({
  $development: {
    vite: {
      server: {
        allowedHosts: ["wired-informally-chicken.ngrok-free.app"],
      },
    },
  },
  compatibilityDate: "2025-07-15",
  css: ["~/assets/css/main.css"],
  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
    },
    families: [
      {
        name: "Roboto",
        provider: "google",
      },
    ],
  },
  hub: {
    database: true,
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxthub/core",
    "@nuxtjs/seo",
    "@vueuse/nuxt",
  ],
  runtimeConfig: {
    public: {
      stripePublishableApiKey: "", // NUXT_PUBLIC_STRIPE_PUBLISHABLE_API_KEY
    },
    calApiKeySnooker1: "", // NUXT_CAL_API_KEY_SNOOKER_1
    calApiKeySnooker2: "", // NUXT_CAL_API_KEY_SNOOKER_2
    calWebhookSecret: "", // NUXT_CAL_WEBHOOK_SECRET
    stripeSecretApiKey: "", // NUXT_STRIPE_SECRET_API_KEY
    stripeWebhookSecret: "", // NUXT_STRIPE_WEBHOOK_SECRET
  },
  site: {
    defaultLocale: "nl",
    name: "Play-ER",
    url: "https://www.play-er.be",
  },
  ui: {
    colorMode: false,
  },
});

export default defineNuxtConfig({
  $development: {
    vite: {
      server: {
        allowedHosts: ["wired-informally-chicken.ngrok-free.app"],
      },
    },
  },
  compatibilityDate: "2026-05-03",
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
    db: "sqlite",
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
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
  ogImage: {
    zeroRuntime: true,
  },
  runtimeConfig: {
    public: {
      stripePublishableApiKey: "", // NUXT_PUBLIC_STRIPE_PUBLISHABLE_API_KEY
    },
    calApiKeys: JSON.parse(process.env.NUXT_CAL_API_KEYS ?? "{}"),
    calBookingGuests: JSON.parse(process.env.NUXT_CAL_BOOKING_GUESTS ?? "[]"),
    calWebhookSecret: "", // NUXT_CAL_WEBHOOK_SECRET
    stripeSecretApiKey: "", // NUXT_STRIPE_SECRET_API_KEY
    stripeWebhookSecret: "", // NUXT_STRIPE_WEBHOOK_SECRET
  },
  site: {
    defaultLocale: "nl",
    name: "Play-ER",
    url: "https://www.play-er.be",
  },
  sitemap: {
    zeroRuntime: true,
  },
  ui: {
    colorMode: false,
  },
});

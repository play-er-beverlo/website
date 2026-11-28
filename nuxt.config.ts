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
  routeRules: {
    "/2026/6-reds-summer-cup/uitschrijven/**": { headers: { "Referrer-Policy": "strict-origin" } },
    "/api/bookings/stripe/callback": { headers: { "Referrer-Policy": "strict-origin" } },
    // The 2026 edition used to live at the unversioned path. Confirmation emails still link
    // there (uitschrijven, betaal-QR), so keep those URLs working. Temporary redirects on purpose:
    // a next edition may reclaim /6-reds-summer-cup.
    "/6-reds-summer-cup": { redirect: "/2026/6-reds-summer-cup" },
    "/6-reds-summer-cup/**": { redirect: "/2026/6-reds-summer-cup/**" },
    "/api/6-reds-summer-cup/**": { redirect: "/api/2026/6-reds-summer-cup/**" },
  },
  runtimeConfig: {
    public: {
      gaMeasurementId: "", // NUXT_PUBLIC_GA_MEASUREMENT_ID
      stripePublishableApiKey: "", // NUXT_PUBLIC_STRIPE_PUBLISHABLE_API_KEY
    },
    calApiKeys: JSON.parse(process.env.NUXT_CAL_API_KEYS ?? "{}"),
    calBookingGuests: JSON.parse(process.env.NUXT_CAL_BOOKING_GUESTS ?? "[]"),
    brevoApiKey: "", // NUXT_BREVO_API_KEY
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

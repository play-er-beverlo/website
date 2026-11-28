import { useStorage } from "@vueuse/core";

export default defineNuxtPlugin(() => {
  const id = useRuntimeConfig().public.gaMeasurementId;
  if (!id) return;

  const consent = useStorage("analytics-consent", "");
  const router = useRouter();
  let loaded = false;

  // Let GA4 Enhanced Measurement handle navigation between public pages.
  // Enter private links in a fresh document so its history listener cannot see them.
  function isPublicPage(route) {
    return route.matched.length > 0
      && !("token" in route.params)
      && Object.keys(route.query).every(key => /^utm_(source|medium|campaign|term|content|id)$/.test(key));
  }
  router.beforeEach((to, from) => {
    if (from.matched.length && (loaded || consent.value === "accepted") && isPublicPage(to) !== isPublicPage(from)) {
      window.location.assign(location.origin + to.fullPath);
      return false;
    }
  });

  function enable() {
    window[`ga-disable-${id}`] = false;
    if (loaded || !isPublicPage(router.currentRoute.value)) return;
    loaded = true;
    const queue = (window.dataLayer ??= []);
    function gtag() {
      // The Google tag consumes arguments objects from the data layer.
      queue.push(arguments);
    }
    gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    gtag("js", new Date());
    gtag("config", id, {
      page_referrer: document.referrer ? new URL(document.referrer).origin : "",
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
  }

  function disable() {
    window[`ga-disable-${id}`] = true;
    // GA's automatic cookie domain can be either the current host or its parent.
    const domains = new Set(["", location.hostname, location.hostname.replace(/^www\./, "")]);
    for (const cookie of document.cookie.split("; ")) {
      const name = cookie.split("=")[0];
      if (name !== "_ga" && name !== `_ga_${id.slice(2)}`) continue;
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ""}`;
      }
    }
  }

  watch([consent, router.currentRoute], () => {
    if (consent.value === "accepted") enable();
    else if (consent.value === "declined") disable();
  }, { immediate: true, flush: "sync" });

  return { provide: { analyticsConsent: consent } };
});

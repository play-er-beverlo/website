<script setup lang="ts">
// const route = useRoute();

useHead({
  meta: [
    {
      name: "description",
      content:
        "Heb je zin om te darten, snookeren, poolen, golfbiljarten, tafelvoetballen, ... of wil je gezellig een kaartje komen leggen, wat lekkers drinken en/of een babbeltje komen slaan: we hopen spoedig uw gastheer te zijn in Beverlo centrum!",
    },
    {
      name: "keywords",
      content:
        "Play-ER, Beverlo, Beringen, Snooker, Darts, Pool, Golfbiljart, Tafelvoetbal, Kicker, Kaarten",
    },
  ],
});
</script>

<!-- eslint-disable vue/no-multiple-template-root -->
<template>
  <section id="home" class="w-full shadow-lg">
    <app-header />
    <!-- TODO: Static header -->
    <!-- <div class="mx-auto max-w-6xl px-6 py-20 flex justify-center h-[656px]"> -->
    <div class="mx-auto max-w-6xl px-8 pb-20 flex justify-center h-[400px] md:h-[656px]">
      <div class="flex flex-col items-center justify-center gap-8">
        <img class="ps-10" src="~/assets/images/Play-ER_Dark.svg" alt="Play-ER logo" width="660" />
        <div class="text-lg text-white text-center px-8 text-shadow-xl">
          <h3 class="font-medium">OPENINGSUREN</h3>
          <div>maandag - donderdag vanaf <span class="text-primary">17:00</span></div>
          <div>vrijdag - zondag vanaf <span class="text-primary">13:00</span></div>
          <div class="mt-4">Van harte welkom!</div>
        </div>
      </div>
    </div>
  </section>
  <section id="reserveren" class="w-full shadow-lg">
    <div class="mx-auto max-w-6xl px-8 py-20 flex flex-col gap-8">
      <h1>RESERVEREN</h1>
      <app-booking />
    </div>
  </section>
  <section id="events" class="w-full shadow-lg">
    <div class="mx-auto max-w-6xl px-8 py-20 flex flex-col gap-8">
      <h1>EVENTS</h1>
      <div class="grid grid-cols-1 gap-8">
        <nuxt-link
          to="/6-reds-summer-cup"
          class="event-card group flex flex-col md:flex-row gap-8 border-4 border-gray-700 p-8 text-white"
        >
          <div class="flex items-center justify-center md:basis-2/5">
            <img
              src="/images/6-reds-summer-cup-logo-dark.svg"
              alt="6 Reds SummER Cup 2026 logo"
              class="w-full max-w-xs h-auto drop-shadow-lg"
            />
          </div>
          <div class="flex flex-1 flex-col gap-4">
            <div class="flex flex-wrap items-center gap-3">
              <h2>6 Reds SummER Cup 2026</h2>
              <span
                class="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary"
              >
                <u-icon name="i-lucide-lock" /> Enkel voor leden
              </span>
            </div>
            <p class="text-white">
              Een recreatieve zomercompetitie in 6 Reds snookerformat bij Play-ER. Vier toernooien
              van woensdag 17 juni t.e.m. vrijdag 31 juli, met finaledag op vrijdag 14 augustus 2026.
            </p>
            <span
              class="mt-auto inline-flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-white transition group-hover:bg-blue-600"
            >
              Meer info &amp; inschrijven
              <u-icon name="i-lucide-arrow-right" class="transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </nuxt-link>
      </div>
    </div>
  </section>
  <section id="contact" class="w-full shadow-lg">
    <div class="mx-auto max-w-6xl px-8 py-20 flex flex-col gap-8">
      <h1 class="text-shadow-lg">CONTACT</h1>
      <div class="flex gap-10">
        <div class="flex flex-1 flex-col border-4 border-gray-700 bg-white">
          <div class="basis-[210px] flex flex-col justify-center overflow-hidden">
            <nuxt-img
              src="/images/play-er-store-front.jpg"
              alt="Voorgevel gebouw Play-ER"
              fit="cover"
            />
          </div>
          <div class="flex flex-col gap-8 p-8">
            <div class="flex flex-wrap gap-4">
              <div class="flex flex-1 flex-col">
                <div class="text-sm">Telefoonnummer</div>
                <a class="text-lg" href="tel:+32469649875">+32 469 64 98 75</a>
              </div>
              <div class="flex flex-1 flex-col">
                <div class="text-sm">E-mailadres</div>
                <a class="text-lg" href="mailto:info@play-er.be">info@play-er.be</a>
              </div>
            </div>
            <div class="flex flex-wrap gap-4">
              <div class="flex flex-1 flex-col">
                <div class="text-sm">Adres</div>
                <a
                  class="text-lg"
                  href="https://www.google.com/maps/place/Beverlo-Dorp+14,+3581+Beringen/@51.0877722,5.2255537,16.75z/data=!4m6!3m5!1s0x47c1305cb79abb61:0x409459a39482b087!8m2!3d51.0879745!4d5.2218059!16s%2Fg%2F11c2bsn6ss?entry=ttu&g_ep=EgoyMDI1MDczMC4wIKXMDSoASAFQAw%3D%3D"
                  >Beverlo-Dorp 14<br />3581 Beringen</a
                >
              </div>
              <div class="flex flex-1 flex-col">
                <div class="text-sm">btw-nummer</div>
                <div class="text-lg">BE 1024.080.468</div>
              </div>
            </div>
          </div>
        </div>
        <div class="hidden sm:flex flex-1"></div>
      </div>
    </div>
  </section>
  <section id="games" class="w-full shadow-lg">
    <div class="mx-auto max-w-6xl px-8 py-20 flex flex-col gap-8">
      <h1>GAMES</h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <div class="flex flex-col gap-4">
          <img src="/images/games/snooker.png" alt="Snooker afbeelding" />
          <h2>SNOOKER</h2>
          <p>
            Voor de strategen onder ons. Onze 3 full-size snookertafels bieden de perfecte setting
            voor een rustige maar intense game.
          </p>
        </div>
        <div class="flex flex-col gap-4">
          <img src="/images/games/darts.png" alt="Darts afbeelding" />
          <h2>DARTS</h2>
          <p>
            Speel zoals het hoort: op onze 8 vaste dartsblokken, met echte pijlen. Ideaal voor een
            stevig duel met vrienden of een gezellige mini-competitie.
          </p>
        </div>
        <div class="flex flex-col gap-4">
          <img src="/images/games/pool.png" alt="Pool afbeelding" />
          <h2>POOL</h2>
          <p>
            Dé klassieker. Onze 2 professionele pooltafels zijn perfect voor zowel beginners als
            doorgewinterde spelers.
          </p>
        </div>
        <div class="flex flex-col gap-4">
          <img src="/images/games/golfbiljart.jpg" alt="Golfbiljart afbeelding" />
          <h2>GOLFBILJART</h2>
          <p>
            Een spel met traditie, dat nog altijd even leuk blijft. Makkelijk op te pikken, moeilijk
            om te stoppen.
          </p>
        </div>
        <div class="flex flex-col gap-4">
          <img src="/images/games/tafelvoetbal.jpg" alt="Tafelvoetbal afbeelding" />
          <h2>TAFELVOETBAL</h2>
          <p>
            Een klassieker die nooit verveelt. Speel een snelle match met vrienden en ontdek wie het
            snelst scoort. Perfect voor een intens duel vol adrenaline.
          </p>
        </div>
        <!-- <div class="flex flex-col gap-4">
            <img src="/images/games/bingo.png" alt="Bingo afbeelding" />
            <h2>BINGO (18+)</h2>
            <p>
              Probeer je geluk aan onze legendarische Tony Rus Bingokast. Spannend, nostalgisch én
              verslavend leuk.
            </p>
          </div> -->
      </div>
    </div>
  </section>
  <!-- TODO: Add image slider -->
  <!-- <section id="image-slider" class="w-full shadow-lg">
      <p class="text-white">TODO: Image slider</p>
    </section> -->
  <!-- TODO: Add clubs -->
  <!-- <section id="clubs" class="w-full shadow-lg">
      <div class="mx-auto max-w-6xl px-6 py-20 flex flex-col gap-10">
        <h1>CLUBS</h1>
        <p>TODO: Clubs overview</p>
      </div>
    </section> -->
</template>

<style scoped>
@reference "./../assets/css/main.css";

section#home {
  @apply bg-neutral-500;
  background: radial-gradient(circle, rgba(102, 102, 102, 1) 0%, rgba(50, 48, 49, 1) 75%);
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.4) 10%, rgba(0, 0, 0, 0.9) 100%),
    url("~/assets/images/home_banner.jpg");
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

section#contact {
  background-color: #f7f6f6; /* Google maps background color */
  background-image: url("~/assets/images/google_maps.png");
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

section#image-slider {
  @apply bg-neutral-500;
  height: 450px;
}

/* Dark section, matching the summer cup "resultaten" section. */
section#events {
  @apply bg-neutral-500 text-white;
}

/* Mini summer-cup hero: the dark-background logo needs a dark card. */
.event-card {
  @apply bg-neutral-500 no-underline transition;
  background: radial-gradient(circle, rgba(102, 102, 102, 1) 0%, rgba(50, 48, 49, 1) 75%);
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.4) 10%, rgba(0, 0, 0, 0.9) 100%),
    url("~/assets/images/home_banner.jpg");
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

.event-card:hover {
  @apply border-primary;
}

/* The global h2 colour matches this card's dark background, so force white. */
.event-card h2 {
  @apply text-white;
}
</style>

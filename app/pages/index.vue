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
  <main>
    <section id="home" class="w-full shadow-lg">
      <!-- TODO: Static header -->
      <!-- <header class="w-full fixed z-10"> -->
      <header class="w-full">
        <div class="mx-auto max-w-6xl px-6 flex justify-between h-20">
          <a href="#" class="flex pe-8">
            <img src="~/assets/images/P_Dark.svg" alt="Play-ER icon" width="56" />
          </a>
          <nav class="hidden md:flex text-white items-center gap-6">
            <!-- TODO: Static header -->
            <!-- TODO: This route.hash is not working initially -->
            <!-- <a href="#" class="p-4" :class="route.hash === '' ? 'active' : ''">HOME</a>
        <a href="#reserveren" class="p-4" :class="route.hash === '#reserveren' ? 'active' : ''"
          >RESERVEREN</a
        >
        <a href="#contact" class="p-4" :class="route.hash === '#contact' ? 'active' : ''"
          >CONTACT</a
        >
        <a href="#games" class="p-4" :class="route.hash === '#games' ? 'active' : ''">GAMES</a> -->
            <!-- <a href="#" class="p-4">HOME</a> -->
            <a href="#reserveren" class="p-4">RESERVEREN</a>
            <a href="#contact" class="p-4">CONTACT</a>
            <a href="#games" class="p-4">GAMES</a>
            <!-- TODO: Add clubs -->
            <!-- <a href="#clubs" class="p-4" :class="route.hash === '#clubs' ? 'active' : ''">CLUBS</a> -->
          </nav>
          <div class="social-media flex items-center gap-6">
            <!-- TODO: Better FB url? -->
            <a
              href="https://www.facebook.com/profile.php?id=61578975490198"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_37_45)">
                  <path
                    class="colored"
                    d="M32 16C32 7.16352 24.8365 0 16 0C7.16352 0 0 7.16352 0 16C0 23.5034 5.16608 29.7997 12.135 31.529V20.8896H8.83584V16H12.135V13.8931C12.135 8.44736 14.5997 5.9232 19.9462 5.9232C20.96 5.9232 22.7091 6.12224 23.4246 6.32064V10.7526C23.047 10.713 22.391 10.6931 21.5763 10.6931C18.953 10.6931 17.9392 11.687 17.9392 14.2707V16H23.1654L22.2675 20.8896H17.9392V31.8829C25.8618 30.9261 32.0006 24.1805 32.0006 16H32Z"
                    fill="white"
                  />
                  <path
                    d="M22.2666 20.8896L23.1646 16H17.9383V14.2707C17.9383 11.687 18.9521 10.6931 21.5754 10.6931C22.3902 10.6931 23.0462 10.7129 23.4238 10.7526V6.32063C22.7082 6.12159 20.9591 5.92319 19.9454 5.92319C14.5988 5.92319 12.1342 8.44735 12.1342 13.8931V16H8.83496V20.8896H12.1342V31.5289C13.3719 31.8361 14.6666 32 15.9991 32C16.6551 32 17.3022 31.9597 17.9377 31.8829V20.8896H22.266H22.2666Z"
                    fill="none"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_37_45">
                    <rect width="32" height="32" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/player_beverlo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_37_46)">
                  <path
                    class="colored"
                    d="M16 2.88125C20.275 2.88125 20.7813 2.9 22.4625 2.975C24.025 3.04375 24.8688 3.30625 25.4313 3.525C26.175 3.8125 26.7125 4.1625 27.2688 4.71875C27.8313 5.28125 28.175 5.8125 28.4625 6.55625C28.6813 7.11875 28.9438 7.96875 29.0125 9.525C29.0875 11.2125 29.1063 11.7188 29.1063 15.9875C29.1063 20.2625 29.0875 20.7688 29.0125 22.45C28.9438 24.0125 28.6813 24.8563 28.4625 25.4188C28.175 26.1625 27.825 26.7 27.2688 27.2563C26.7063 27.8188 26.175 28.1625 25.4313 28.45C24.8688 28.6688 24.0188 28.9313 22.4625 29C20.775 29.075 20.2688 29.0938 16 29.0938C11.725 29.0938 11.2188 29.075 9.5375 29C7.975 28.9313 7.13125 28.6688 6.56875 28.45C5.825 28.1625 5.2875 27.8125 4.73125 27.2563C4.16875 26.6938 3.825 26.1625 3.5375 25.4188C3.31875 24.8563 3.05625 24.0063 2.9875 22.45C2.9125 20.7625 2.89375 20.2563 2.89375 15.9875C2.89375 11.7125 2.9125 11.2063 2.9875 9.525C3.05625 7.9625 3.31875 7.11875 3.5375 6.55625C3.825 5.8125 4.175 5.275 4.73125 4.71875C5.29375 4.15625 5.825 3.8125 6.56875 3.525C7.13125 3.30625 7.98125 3.04375 9.5375 2.975C11.2188 2.9 11.725 2.88125 16 2.88125ZM16 0C11.6563 0 11.1125 0.01875 9.40625 0.09375C7.70625 0.16875 6.5375 0.44375 5.525 0.8375C4.46875 1.25 3.575 1.79375 2.6875 2.6875C1.79375 3.575 1.25 4.46875 0.8375 5.51875C0.44375 6.5375 0.16875 7.7 0.09375 9.4C0.01875 11.1125 0 11.6562 0 16C0 20.3438 0.01875 20.8875 0.09375 22.5938C0.16875 24.2938 0.44375 25.4625 0.8375 26.475C1.25 27.5313 1.79375 28.425 2.6875 29.3125C3.575 30.2 4.46875 30.75 5.51875 31.1562C6.5375 31.55 7.7 31.825 9.4 31.9C11.1063 31.975 11.65 31.9937 15.9938 31.9937C20.3375 31.9937 20.8813 31.975 22.5875 31.9C24.2875 31.825 25.4563 31.55 26.4688 31.1562C27.5188 30.75 28.4125 30.2 29.3 29.3125C30.1875 28.425 30.7375 27.5313 31.1438 26.4813C31.5375 25.4625 31.8125 24.3 31.8875 22.6C31.9625 20.8938 31.9813 20.35 31.9813 16.0063C31.9813 11.6625 31.9625 11.1188 31.8875 9.4125C31.8125 7.7125 31.5375 6.54375 31.1438 5.53125C30.75 4.46875 30.2063 3.575 29.3125 2.6875C28.425 1.8 27.5313 1.25 26.4813 0.84375C25.4625 0.45 24.3 0.175 22.6 0.1C20.8875 0.01875 20.3438 0 16 0Z"
                    fill="white"
                  />
                  <path
                    class="colored"
                    d="M16 7.78125C11.4625 7.78125 7.78125 11.4625 7.78125 16C7.78125 20.5375 11.4625 24.2188 16 24.2188C20.5375 24.2188 24.2188 20.5375 24.2188 16C24.2188 11.4625 20.5375 7.78125 16 7.78125ZM16 21.3312C13.0563 21.3312 10.6687 18.9438 10.6687 16C10.6687 13.0563 13.0563 10.6687 16 10.6687C18.9438 10.6687 21.3312 13.0563 21.3312 16C21.3312 18.9438 18.9438 21.3312 16 21.3312Z"
                    fill="white"
                  />
                  <path
                    class="colored"
                    d="M26.4625 7.45626C26.4625 8.51876 25.6 9.37501 24.5438 9.37501C23.4813 9.37501 22.625 8.51251 22.625 7.45626C22.625 6.39376 23.4875 5.53751 24.5438 5.53751C25.6 5.53751 26.4625 6.40001 26.4625 7.45626Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_37_46">
                    <rect width="32" height="32" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </a>
          </div>
        </div>
      </header>
      <!-- TODO: Static header -->
      <!-- <div class="mx-auto max-w-6xl px-6 py-20 flex justify-center h-[656px]"> -->
      <div class="mx-auto max-w-6xl px-8 pb-20 flex justify-center h-[400px] md:h-[656px]">
        <div class="flex flex-col items-center justify-center gap-8">
          <img
            class="ps-10"
            src="~/assets/images/Play-ER_Dark.svg"
            alt="Play-ER logo"
            width="660"
          />
          <div class="text-xl text-white text-center px-8 text-shadow-xl">
            Wij zijn <span class="text-primary">elke dag</span> open van
            <span class="text-primary">13:00</span> tot
            <span class="text-primary">23:00</span>.<br />Van harte welkom!
          </div>
        </div>
      </div>
    </section>
    <!-- TODO: Reserve -->
    <section id="reserveren" class="w-full shadow-lg">
      <div class="mx-auto max-w-6xl px-8 py-20 flex flex-col gap-8">
        <h1>RESERVEREN</h1>
        <p class="text-xl">Binnenkort hier online beschikbaar!</p>
        <!-- <div class="flex flex-col md:flex-row gap-8">
          <div
            class="flex flex-col lg:flex-row gap-8 flex-1 border-4 border-gray-700 relative p-8"
          >
            <h2 class="absolute bg-white px-2 top-[-1.25rem] left-8">CONTACTGEGEVENS</h2>
            <div class="flex flex-1 flex-col">
              <div>Telefoonnummer</div>
              <a class="text-primary text-xl" href="tel:+32469649875">+32 469 64 98 75</a>
            </div>
            <div class="flex flex-1 flex-col">
              <div>E-mailadres</div>
              <a class="text-primary text-xl" href="mailto:reserveren@play-er.be"
                >reserveren@play-er.be</a
              >
            </div>
          </div>
        </div> -->
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
                  <div>Telefoonnummer</div>
                  <a class="text-primary text-xl" href="tel:+32469649875">+32 469 64 98 75</a>
                </div>
                <div class="flex flex-1 flex-col">
                  <div>E-mailadres</div>
                  <a class="text-primary text-xl" href="mailto:info@play-er.be">info@play-er.be</a>
                </div>
              </div>
              <div class="flex flex-wrap gap-4">
                <div class="flex flex-1 flex-col">
                  <div>Adres</div>
                  <a
                    class="text-primary text-xl"
                    href="https://www.google.com/maps/place/Beverlo-Dorp+14,+3581+Beringen/@51.0877722,5.2255537,16.75z/data=!4m6!3m5!1s0x47c1305cb79abb61:0x409459a39482b087!8m2!3d51.0879745!4d5.2218059!16s%2Fg%2F11c2bsn6ss?entry=ttu&g_ep=EgoyMDI1MDczMC4wIKXMDSoASAFQAw%3D%3D"
                    >Beverlo-Dorp 14<br />3581 Beringen</a
                  >
                </div>
                <div class="flex flex-1 flex-col">
                  <div>btw-nummer</div>
                  <div class="text-xl">BE 1024.080.468</div>
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
              Een spel met traditie, dat nog altijd even leuk blijft. Makkelijk op te pikken,
              moeilijk om te stoppen.
            </p>
          </div>
          <div class="flex flex-col gap-4">
            <img src="/images/games/tafelvoetbal.jpg" alt="Tafelvoetbal afbeelding" />
            <h2>TAFELVOETBAL</h2>
            <p>
              Een klassieker die nooit verveelt. Speel een snelle match met vrienden en ontdek wie
              het snelst scoort. Perfect voor een intens duel vol adrenaline.
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
  </main>
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

<style lang="css">
html {
  scroll-behavior: smooth;
}

/* TODO: Cleanup colors, use tailwind classes */

.text-primary {
  color: #00adee;
}

h1 {
  color: #00adee;
  font-size: 32px;
  font-weight: 700;
}

h2 {
  color: #323031;
  font-size: 24px;
  font-weight: 600;
}

header .social-media svg:hover path.colored {
  fill: #00adee;
}

nav a {
  font-size: 20px;
  font-weight: 600;
}

nav a.active {
  color: #00adee;
}

nav a:hover {
  color: #00adee;
}

section#home {
  background-color: #323031;
  background: radial-gradient(circle, rgba(102, 102, 102, 1) 0%, rgba(50, 48, 49, 1) 75%);
}

section#contact {
  background-color: #f7f6f6;
  background-image: url("~/assets/images/google_maps.png");
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

section#image-slider {
  background-color: #323031;
  height: 450px;
}

footer {
  background-color: #323031;
  color: #dddddd;
}

footer a:hover {
  color: #00adee;
}
</style>

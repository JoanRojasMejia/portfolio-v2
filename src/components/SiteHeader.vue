<template>
  <header class="site-header">
    <div class="inner">
      <a :href="homeHref" class="brand jr-waves" aria-label="Joan Rojas — inicio">
        <span class="mark"><AsciiBuild :cell="2" :step-ms="90" :agent-size="10" finale="leave"><Logo /></AsciiBuild></span>
      </a>
      <div class="meta mono">
        <CityWeather />
        <div class="lang" role="group" aria-label="Idioma / Language" data-sound="toggle">
          <button :class="{ on: lang === 'es' }" :aria-pressed="lang === 'es'" @click="setLang('es')">ES</button>
          <button :class="{ on: lang === 'en' }" :aria-pressed="lang === 'en'" @click="setLang('en')">EN</button>
        </div>
        <button
          class="theme sound"
          data-sound="none"
          :title="soundOn ? t.soundOff : t.soundOn"
          :aria-label="soundOn ? t.soundOff : t.soundOn"
          :aria-pressed="soundOn"
          @click="setSound(!soundOn)"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2.5 6h2.5l3.5-3v10L5 10H2.5z" />
            <template v-if="soundOn">
              <path class="wave" d="M10.5 6a2.5 2.5 0 0 1 0 4" />
              <path class="wave" d="M12 4.2a5 5 0 0 1 0 7.6" />
            </template>
            <path v-else class="wave" d="M10.5 6.2 13.5 9.8M13.5 6.2 10.5 9.8" />
          </svg>
        </button>
        <button class="theme" data-sound="toggle" :title="t.theme" :aria-label="t.theme" @click="setTheme(theme === 'dark' ? 'light' : 'dark')">◐</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import AsciiBuild from './AsciiBuild.vue';
import CityWeather from './CityWeather.vue';
import Logo from './Logo.vue';
import { lang, setLang, setTheme, t, theme } from '../lib/site';
import { setSound, soundOn } from '../lib/sound';

withDefaults(defineProps<{ homeHref?: string }>(), { homeHref: '/' });
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg);
  border-bottom: 1px solid var(--rule);
}
.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px var(--gutter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.brand { display: flex; align-items: center; gap: 12px; }
.mark { display: block; color: var(--fg); }
/* overflow visible: el brazo levantado sale del viewBox del logo */
.mark :deep(svg) { display: block; overflow: visible; }

/* Al pasar el mouse, la mascota saluda (.jr-waves, en global.css). */
.meta {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 12px;
  color: var(--muted);
  flex-wrap: wrap;
}
.nowrap { white-space: nowrap; font-variant-numeric: tabular-nums; }
.lang { display: flex; border: 1px solid var(--rule); border-radius: 999px; overflow: hidden; }
.lang button {
  font-size: 11px;
  padding: 4px 10px;
  border: 0;
  cursor: pointer;
  background: transparent;
  color: var(--muted);
}
.lang button.on { background: var(--fg); color: var(--bg); }
.theme {
  font-size: 14px;
  width: 28px;
  height: 28px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: transparent;
  color: var(--fg);
  cursor: pointer;
}
.sound { display: grid; place-items: center; padding: 0; }
.sound svg { width: 14px; height: 14px; fill: currentColor; }
.sound .wave { fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; }
.sound[aria-pressed="true"] { border-color: var(--fg); }
</style>

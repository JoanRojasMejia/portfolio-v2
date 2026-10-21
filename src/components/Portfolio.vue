<template>
  <div class="page">
    <SiteHeader home-href="#top" />
    <div id="top"></div>
    <HeroTecnico v-if="hero === 'tecnico'" />
    <HeroEditorial v-else :track="track" />
    <WorkSection />
    <PlaygroundSection />
    <ActivitySection v-if="contrib" :cal="contrib" />
    <AlbumSection />
    <AboutSection :gym="gym" />
    <SiteFooter />
    <BottomNav home />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import SiteHeader from './SiteHeader.vue';
import HeroEditorial from './HeroEditorial.vue';
import HeroTecnico from './HeroTecnico.vue';
import WorkSection from './WorkSection.vue';
import PlaygroundSection from './PlaygroundSection.vue';
import ActivitySection from './ActivitySection.vue';
import AlbumSection from './AlbumSection.vue';
import AboutSection from './AboutSection.vue';
import SiteFooter from './SiteFooter.vue';
import BottomNav from './BottomNav.vue';
import type { RecentTrack } from '../lib/lastfm';
import type { Calendar } from '../lib/calendar';
import type { GymCalendar } from '../lib/hevy';
import { startSite } from '../lib/site';
import { startSound } from '../lib/sound';

withDefaults(
  defineProps<{ hero?: 'editorial' | 'tecnico'; track?: RecentTrack | null; contrib?: Calendar | null; gym?: GymCalendar | null }>(),
  { hero: 'editorial', track: null, contrib: null, gym: null },
);

let stop: (() => void) | undefined;
let stopSound: (() => void) | undefined;
onMounted(() => {
  stop = startSite();
  stopSound = startSound();
});
onBeforeUnmount(() => {
  stop?.();
  stopSound?.();
});
</script>

<style scoped>
.page { min-height: 100vh; padding-bottom: 120px; }
</style>

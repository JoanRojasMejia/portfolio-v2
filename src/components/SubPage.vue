<template>
  <div class="page">
    <SiteHeader />
    <slot />
    <footer class="sub-footer mono">
      <span class="nowrap">Bogotá {{ clock }} · 4°40′ N 74°03′ W</span>
      <span class="links">
        <a v-for="l in links" :key="l.href" :href="l.href">{{ l.label }}</a>
      </span>
    </footer>
    <BottomNav :active="active" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import SiteHeader from './SiteHeader.vue';
import BottomNav from './BottomNav.vue';
import { clock, startSite } from '../lib/site';
import { startSound } from '../lib/sound';

defineProps<{ links: { href: string; label: string }[]; active?: 'work' | 'album' }>();

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
.sub-footer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px var(--gutter);
  border: 1px solid var(--rule);
  border-bottom: 0;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--muted);
}
.nowrap { white-space: nowrap; }
.links { display: flex; gap: 16px; }
.links a { color: var(--muted); }
.links a:hover { color: var(--fg); }
</style>

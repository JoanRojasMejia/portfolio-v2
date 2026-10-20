<template>
  <nav class="dock" aria-label="Secciones">
    <a
      v-for="item in items"
      :key="item.key"
      :href="item.href"
      :class="{ active: active === item.key }"
      :aria-current="active === item.key ? 'page' : undefined"
    >{{ item.label }}</a>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { t } from '../lib/site';

// On the home page the links are in-page anchors; elsewhere they point back home
// (except the album, which has its own page).
const props = withDefaults(defineProps<{ home?: boolean; active?: 'work' | 'album' }>(), { home: false });

const items = computed(() => {
  const base = props.home ? '' : '/';
  return [
    { key: 'work', href: `${base}#trabajo`, label: t.value.nWork },
    { key: 'fun', href: `${base}#playground`, label: t.value.nFun },
    { key: 'album', href: props.home ? '#album' : '/album', label: t.value.nAlbum },
    { key: 'about', href: `${base}#sobre`, label: t.value.nAbout },
  ];
});
</script>

<style scoped>
.dock {
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  z-index: 60;
  display: flex;
  gap: 4px;
  padding: 6px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: var(--bg);
  box-shadow: 0 8px 30px rgba(0, 0, 0, .08);
  font-size: 14px;
  max-width: calc(100vw - 32px);
}
.dock a { padding: 8px 14px; border-radius: 999px; white-space: nowrap; }
.dock a:hover, .dock a.active { background: var(--rule); color: var(--fg); }
@media (max-width: 420px) {
  .dock a { padding: 8px 10px; font-size: 13px; }
}
</style>

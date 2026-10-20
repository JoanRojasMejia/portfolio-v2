<template>
  <section id="album" class="sheet" data-screen-label="Álbum">
    <SheetLabel no="05" :label="t.albumUp" />
    <div class="head">
      <p class="lead-serif">{{ t.albumLine }}</p>
      <a href="/album" class="pill solid mono">{{ t.fullAlbum }} →</a>
      <button class="pill mono" @click="collage?.reset()">↺ {{ t.reset }}</button>
    </div>

    <Collage ref="collage" :items="ALBUM" />

    <div class="rotation-head mono">
      <span class="nowrap">{{ t.rotation }}</span><span class="line"></span><span>{{ t.lastfm }}</span>
    </div>
    <Records />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SheetLabel from './SheetLabel.vue';
import Collage from './Collage.vue';
import Records from './Records.vue';
import { ALBUM } from '../lib/data';
import { t } from '../lib/site';

const collage = ref<InstanceType<typeof Collage> | null>(null);
</script>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.head .lead-serif { max-width: 20em; }
.rotation-head {
  margin: 48px 0 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  letter-spacing: .1em;
  color: var(--muted);
}
.nowrap { white-space: nowrap; flex: none; }
.line { flex: 1; height: 1px; background: var(--rule); display: block; }
</style>

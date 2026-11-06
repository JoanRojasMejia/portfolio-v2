<template>
  <section id="album" class="sheet" data-screen-label="Álbum">
    <SheetLabel no="05" :label="t.albumUp" />
    <div class="head">
      <p class="lead-serif">{{ t.albumLine }}</p>
      <a href="/album" class="pill solid mono">{{ t.fullAlbum }} →</a>
      <button class="pill mono" @click="collage?.reset()">↺ {{ t.reset }}</button>
    </div>

    <!-- Los discos en rotación viven solo en la página del álbum (/album). -->
    <Collage ref="collage" :items="ALBUM" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SheetLabel from './SheetLabel.vue';
import Collage from './Collage.vue';
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
</style>

<template>
  <div class="records" :style="{ gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: gap + 'px' }">
    <div
      v-for="(name, i) in ARTISTS"
      :key="name"
      class="record"
      :class="{ out: rec === i }"
      @pointerenter="rec = i"
      @pointerleave="rec = -1"
    >
      <div class="disc"><div class="label"><div class="spindle"></div></div></div>
      <div class="sleeve" :class="{ dark: i % 2 === 0 }">
        <span class="mono lp">LP {{ String(i + 1).padStart(2, '0') }}</span>
        <span class="serif title" :style="{ fontSize: titleSize + 'px' }">{{ name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ARTISTS } from '../lib/data';

withDefaults(defineProps<{ min?: number; gap?: number; titleSize?: number }>(), { min: 140, gap: 20, titleSize: 22 });
const rec = ref(-1);
</script>

<style scoped>
.records { display: grid; }
.record { position: relative; padding-right: 18%; cursor: default; }
.disc {
  position: absolute;
  top: 4%;
  right: 0;
  width: 82%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: repeating-radial-gradient(circle, #111 0 2px, #262624 2px 3px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform .5s cubic-bezier(.2, .8, .2, 1);
}
.record.out .disc { transform: translateX(18%) rotate(120deg); }
.label {
  width: 30%;
  height: 30%;
  border-radius: 50%;
  background: #EDEBE6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spindle { width: 14%; height: 14%; border-radius: 50%; background: #111; }
.sleeve {
  position: relative;
  aspect-ratio: 1;
  background: var(--card);
  color: var(--fg);
  border: 1px solid var(--rule);
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.sleeve.dark { background: #111111; color: #EDEBE6; }
.lp { font-size: 10px; letter-spacing: .08em; }
.title { line-height: 1; }
</style>

<template>
  <div class="board-scroll">
    <div ref="board" class="board" :style="{ aspectRatio: aspect }">
      <div
        v-for="(a, i) in items"
        :key="i"
        class="piece"
        :style="{ left: pos[i].x + '%', top: pos[i].y + '%', width: a.w + '%', zIndex: pos[i].z, transform: `rotate(${a.r}deg)` }"
        @pointerdown="startDrag($event, i)"
      >
        <div v-if="a.k === 'tattoo'" class="flash">
          <div class="flash-top mono"><span>{{ a.no }}</span><span>FLASH</span></div>
          <div
            class="flash-img"
            :class="{ inked: inked === i }"
            :style="{ backgroundImage: `url(${a.src})` }"
            @pointerenter="inked = i"
            @pointerleave="inked = -1"
          ></div>
          <div class="flash-foot">
            <span class="serif name">{{ L(a.name, lang) }}</span>
            <span class="mono place">{{ L(a.place, lang) }}</span>
          </div>
        </div>
        <div v-else-if="a.k === 'photo'" class="polaroid shadow">
          <div class="photo" :style="{ aspectRatio: a.ar || '3/4', backgroundImage: `url(${a.src})` }"></div>
          <div class="caption">{{ L(a.caption, lang) }}</div>
        </div>
        <div v-else-if="a.k === 'sticker'" class="sticker" :style="{ backgroundImage: `url(${a.src})` }"></div>
        <div v-else class="note">{{ L(a.text, lang) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import type { AlbumItem } from '../lib/data';
import { L } from '../lib/i18n';
import { lang } from '../lib/site';

const props = withDefaults(defineProps<{ items: AlbumItem[]; aspect?: string; maxY?: number }>(), {
  aspect: '16 / 11',
  maxY: 90,
});

const initial = () => props.items.map((a, i) => ({ x: a.x, y: a.y, z: i + 1 }));
const pos = ref(initial());
let topZ = props.items.length + 1;
const inked = ref(-1);
const board = ref<HTMLElement | null>(null);
let stopDrag: (() => void) | null = null;

function reset() {
  pos.value = initial();
  topZ = props.items.length + 1;
}
defineExpose({ reset });

function startDrag(e: PointerEvent, i: number) {
  const box = board.value;
  if (!box) return;
  e.preventDefault();
  const rect = box.getBoundingClientRect();
  const start = { px: e.clientX, py: e.clientY, x: pos.value[i].x, y: pos.value[i].y };
  pos.value[i].z = topZ++;
  const move = (ev: PointerEvent) => {
    const dx = ((ev.clientX - start.px) / rect.width) * 100;
    const dy = ((ev.clientY - start.py) / rect.height) * 100;
    pos.value[i].x = Math.max(-5, Math.min(95, start.x + dx));
    pos.value[i].y = Math.max(-5, Math.min(props.maxY, start.y + dy));
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    stopDrag = null;
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  stopDrag = up;
}

onBeforeUnmount(() => stopDrag?.());
</script>

<style scoped>
.board-scroll { overflow-x: auto; overflow-y: hidden; }
.board { position: relative; min-width: 760px; touch-action: none; }
.piece { position: absolute; cursor: grab; user-select: none; }
.piece:active { cursor: grabbing; }

.flash {
  background: #FBFAF7;
  color: #111;
  padding: 8px 8px 10px;
  border: 1px solid #d9d7d0;
  box-shadow: 0 10px 24px rgba(0, 0, 0, .14);
}
.flash-top { display: flex; justify-content: space-between; font-size: 10px; letter-spacing: .06em; padding: 0 2px 6px; }
.flash-img {
  width: 100%;
  aspect-ratio: 4 / 5;
  background-size: cover;
  background-position: center;
  filter: grayscale(1) contrast(1.5) brightness(1.08);
  transition: filter .5s;
}
.flash-img.inked { filter: grayscale(0) contrast(1.05); }
.flash-foot { display: flex; justify-content: space-between; align-items: baseline; padding: 8px 2px 0; }
.name { font-size: 20px; }
.place { font-size: 10px; color: #6E6D68; }

.shadow { box-shadow: 0 10px 24px rgba(0, 0, 0, .16); }
.photo { width: 100%; background-size: cover; background-position: center; }
.sticker {
  width: 100%;
  aspect-ratio: 1;
  background-size: contain;
  background-repeat: no-repeat;
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, .22));
}
.note {
  background: #F6EFD9;
  color: #1a1a1a;
  padding: 18px 16px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, .12);
  font-family: var(--hand);
  font-size: 24px;
  line-height: 1.15;
}
</style>

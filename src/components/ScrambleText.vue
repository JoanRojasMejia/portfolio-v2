<template>
  <span class="scramble">
    <span class="sr">{{ text }}</span>
    <span aria-hidden="true"><span v-for="(c, i) in chars" :key="i" :class="{ noise: !c.done }">{{ c.ch }}</span></span>
  </span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

// Cuando cambia `text`, cada letra pasa por caracteres aleatorios (los mismos
// del fondo ASCII) y se fija de izquierda a derecha en la palabra nueva.
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const START_MS = 180; // tiempo en que todas las letras solo son ruido
const STAGGER_MS = 70; // separación entre letras al fijarse
const JITTER_MS = 90;
const SWAP_MS = 45; // cada cuánto cambia un carácter aleatorio

const props = defineProps<{ text: string }>();

interface Cell { ch: string; done: boolean }
const chars = ref<Cell[]>([...props.text].map((ch) => ({ ch, done: true })));
let raf = 0;

const random = () => CHARS[Math.floor(Math.random() * CHARS.length)];

watch(
  () => props.text,
  (next) => {
    cancelAnimationFrame(raf);
    const target = [...next];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      chars.value = target.map((ch) => ({ ch, done: true }));
      return;
    }
    // Se anima sobre el largo mayor; las letras sobrantes se resuelven en vacío.
    const len = Math.max(target.length, chars.value.length);
    const settle = Array.from({ length: len }, (_, i) => START_MS + i * STAGGER_MS + Math.random() * JITTER_MS);
    const start = performance.now();
    let lastSwap = 0;

    const step = (now: number) => {
      const elapsed = now - start;
      const swap = now - lastSwap >= SWAP_MS;
      if (swap) lastSwap = now;
      const cells: Cell[] = [];
      for (let i = 0; i < len; i++) {
        if (elapsed >= settle[i]) {
          if (i < target.length) cells.push({ ch: target[i], done: true });
        } else {
          cells.push({ ch: swap || !chars.value[i] ? random() : chars.value[i].ch, done: false });
        }
      }
      chars.value = cells;
      if (cells.some((c) => !c.done)) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  },
);

onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<style scoped>
.scramble { white-space: pre; }
.noise { opacity: .55; }
.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>

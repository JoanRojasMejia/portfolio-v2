<template>
  <!-- Bordes de la columna como ejes de un plano (reemplazan a los de .sheet y del hero) -->
  <div class="frame" :style="{ '--frame-top': `${top}px` }" aria-hidden="true">
    <span class="edge left"></span>
    <span class="edge right"></span>
  </div>

  <!-- Anotaciones al inicio de la página: se van con el scroll, como el rótulo de un plano -->
  <div class="marks" :style="{ '--frame-top': `${top}px` }" aria-hidden="true">
    <span class="bubble left mono">A</span>
    <span class="bubble right mono">B</span>
    <span v-if="dim" class="dim mono" :style="{ left: `${dim.x}px`, top: `${dim.y}px`, width: `${dim.size}px` }">
      <span class="dim-label">{{ dim.label }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

// Marco de la columna dibujado como plano arquitectónico: los bordes son ejes de
// trazo y punto con sus burbujas (A, B) arriba, y bajo la foto del hero hay una
// cota con su ancho real. Los títulos de sección usan línea de cota (global.css).

const top = ref(64); // borde inferior del header
const dim = ref<{ x: number; y: number; size: number; label: string } | null>(null);
const fmt = (n: number) => Math.round(n).toLocaleString('es-CO').replace(/\./g, ' ');

// Mide en coordenadas de la página (la cota se va con el scroll).
const measure = () => {
  const header = document.querySelector('.site-header');
  top.value = header ? Math.round(header.getBoundingClientRect().height) : 64;
  const r = document.querySelector('.figure img')?.getBoundingClientRect();
  dim.value = r
    ? { x: r.left + scrollX, y: r.top + scrollY + r.height + 18, size: r.width, label: fmt(r.width) }
    : null;
};

let raf = 0;
const remeasure = () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(measure);
};
let layoutObserver: ResizeObserver | undefined;

onMounted(() => {
  measure();
  window.addEventListener('resize', remeasure);
  // Imágenes y fuentes que cargan tarde cambian el layout: volver a medir.
  layoutObserver = new ResizeObserver(remeasure);
  layoutObserver.observe(document.body);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', remeasure);
  layoutObserver?.disconnect();
  cancelAnimationFrame(raf);
});
</script>

<style scoped>
.frame,
.marks {
  --edge-l: max(0px, calc(50% - 600px));
  --edge-r: min(100%, calc(50% + 600px));
  --ink: var(--muted);
  z-index: 40; /* bajo el header (50), sobre el contenido */
  pointer-events: none;
}
.frame { position: fixed; inset: 0; }
.marks { position: absolute; top: 0; left: 0; right: 0; height: 0; }

/* Ejes: trazo largo, espacio, punto, espacio */
.edge {
  position: absolute;
  top: var(--frame-top);
  bottom: 0;
  width: 1px;
  background: repeating-linear-gradient(to bottom, var(--rule) 0 18px, transparent 18px 22px, var(--rule) 22px 24px, transparent 24px 28px);
}
.edge.left { left: var(--edge-l); }
.edge.right { left: calc(var(--edge-r) - 1px); }

/* Burbujas de eje */
.bubble {
  position: absolute;
  top: calc(var(--frame-top) + 8px);
  width: 24px;
  height: 24px;
  margin-left: -12px;
  border: 1px solid var(--ink);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11px;
  color: var(--ink);
  background: var(--bg);
}
.bubble.left { left: var(--edge-l); }
.bubble.right { left: var(--edge-r); }

/* Cota bajo la foto, con marcas a 45° en los extremos */
.dim { position: absolute; height: 1px; background: var(--rule); }
.dim::before,
.dim::after {
  content: '';
  position: absolute;
  top: -5px;
  width: 1px;
  height: 11px;
  background: var(--ink);
  transform: rotate(45deg);
}
.dim::before { left: 0; }
.dim::after { right: 0; }
.dim-label {
  position: absolute;
  left: 50%;
  top: -16px;
  transform: translateX(-50%);
  padding: 0 8px;
  font-size: 10px;
  letter-spacing: .1em;
  color: var(--ink);
  background: var(--bg);
  white-space: nowrap;
}

/* En pantallas angostas solo quedan los ejes. */
@media (max-width: 900px) {
  .bubble, .dim { display: none; }
}
</style>

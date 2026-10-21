<template>
  <!-- Calendario del último año: una columna por semana, el número del día en cada
       celda y la tinta más oscura cuanto más hubo. Sirve para una o varias fuentes
       (Actividad: GitHub + AWS; gimnasio: Hevy). -->
  <div ref="root" class="contrib">
    <div ref="scroller" class="scroller" @scroll="hide">
      <div class="graph" :style="{ '--weeks': cal.weeks.length }">
        <div class="months mono" aria-hidden="true">
          <span v-for="m in months" :key="m.col" :style="{ gridColumn: `${m.col + 1} / span 4`, gridRow: 1 }">{{ m.label }}</span>
        </div>
        <div class="cells" role="img" :aria-label="summary" @pointerover="show" @pointerleave="hide">
          <template v-for="(week, w) in cal.weeks" :key="w">
            <span
              v-for="(d, i) in week"
              :key="d.date"
              class="cell mono"
              :class="[`l${level(d)}`, { hot: tip.on && tip.day?.date === d.date }]"
              :style="{ gridColumn: w + 1, gridRow: dayRow(w, i) }"
              :data-w="w"
              :data-i="i"
              aria-hidden="true"
            >{{ cellText ? cellText(d) : count(d) || '' }}</span>
          </template>
        </div>
      </div>
    </div>
    <!-- Un solo tooltip que se desliza de celda en celda: el conteo de cada fuente ese
         día y, si hay más de una, la barra con la proporción entre ellas. -->
    <div
      class="tip mono"
      :class="{ on: tip.on }"
      :style="{ left: `${tip.x}px`, top: `${tip.y}px`, '--arrow': `${tip.arrow}px` }"
      aria-hidden="true"
    >
      <template v-if="tip.day">
        <span class="tip-date">{{ when(tip.day) }}</span>
        <!-- Contenido por defecto: el conteo de cada fuente. Quien use el calendario
             puede reemplazarlo con el slot "tip" (p. ej. el entreno del día). -->
        <slot name="tip" :day="tip.day">
          <span v-for="(label, s) in series" :key="label" class="tip-row">
            <i class="dot" :class="`s${s}`"></i>{{ label }}<b>{{ tip.day.counts[s] }}</b>
          </span>
          <span v-if="series.length > 1" class="tip-bar">
            <span v-for="(label, s) in series" :key="label" :class="`s${s}`" :style="{ width: `${share(tip.day, s)}%` }"></span>
          </span>
        </slot>
      </template>
    </div>
    <div class="foot mono">
      <span class="total">{{ summary }}</span>
      <span class="legend" aria-hidden="true">
        {{ t.less }}<span v-for="l in 5" :key="l" class="cell sw" :class="`l${l - 1}`"></span>{{ t.more }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { Calendar, CalendarDay } from '../lib/calendar';
import { lang, t } from '../lib/site';

const props = defineProps<{
  cal: Calendar;
  /** Etiqueta de cada fuente, en el mismo orden que CalendarDay.counts. */
  series: string[];
  /** Unidad para el total y el resumen: [singular, plural]. */
  unit: [string, string];
  /** Texto de cada celda; por defecto, el total del día (vacío si es 0). */
  cellText?: (d: CalendarDay) => string;
}>();

type CalendarDay = CalendarDay;
const count = (d: CalendarDay) => d.counts.reduce((a, b) => a + b, 0);

// Nivel de tinta (0–4) relativo al día con más contribuciones del año.
const max = computed(() => Math.max(1, ...props.cal.weeks.flat().map(count)));
const level = (d: CalendarDay) => {
  const c = count(d);
  if (!c) return 0;
  const r = c / max.value;
  return r <= 0.25 ? 1 : r <= 0.5 ? 2 : r <= 0.75 ? 3 : 4;
};

// La primera semana puede empezar a mitad de semana: cada día va en su fila (dom = 1).
const dayRow = (w: number, i: number) => (w === 0 ? 8 - props.cal.weeks[0].length + i : i + 1);

const locale = computed(() => (lang.value === 'es' ? 'es-CO' : 'en-US'));
const dateFmt = computed(() => new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }));
const monthFmt = computed(() => new Intl.DateTimeFormat(locale.value, { month: 'short', timeZone: 'UTC' }));

const cap = (m: string) => m.charAt(0).toUpperCase() + m.slice(1);

// Nombre del mes sobre la primera semana que lo contiene (sin cortar el borde izquierdo).
const months = computed(() => {
  const out: { col: number; label: string }[] = [];
  let prev = -1;
  props.cal.weeks.forEach((week, col) => {
    const first = week.find((d) => d.date.endsWith('-01')) ?? (col === 0 ? week[0] : undefined);
    if (!first) return;
    const m = Number(first.date.slice(5, 7));
    if (m === prev || col > props.cal.weeks.length - 2) return;
    prev = m;
    out.push({ col, label: cap(monthFmt.value.format(new Date(`${first.date}T00:00:00Z`)).replace('.', '')) });
  });
  // Si el primer mes queda pegado al siguiente, se omite.
  if (out.length > 1 && out[1].col - out[0].col < 3) out.shift();
  return out;
});

const word = (n: number) => (n === 1 ? props.unit[0] : props.unit[1]);
const summary = computed(() => `${props.cal.total.toLocaleString(locale.value)} ${word(props.cal.total)} ${t.value.lastYear}`);

// ---- Tooltip ----
const TIP_W = 164; // ancho fijo del tooltip, para centrarlo sin medirlo
const EDGE = 6; // margen mínimo contra los bordes del calendario
const root = ref<HTMLElement | null>(null);
// day se conserva al ocultar, así el contenido no desaparece antes del fundido.
const tip = reactive<{ on: boolean; day: CalendarDay | null; x: number; y: number; arrow: number }>({ on: false, day: null, x: 0, y: 0, arrow: 0 });

const when = (d: CalendarDay) => dateFmt.value.format(new Date(`${d.date}T00:00:00Z`));
// Porcentaje de la fuente s sobre el total del día, para la barra del tooltip.
const share = (d: CalendarDay, s: number) => {
  const c = count(d);
  return c ? (d.counts[s] / c) * 100 : 0;
};

const show = (e: PointerEvent) => {
  const cell = (e.target as HTMLElement).closest<HTMLElement>('.cell');
  if (!cell || !root.value) return;
  const day = props.cal.weeks[Number(cell.dataset.w)]?.[Number(cell.dataset.i)];
  // Solo los días con actividad tienen tooltip; al pasar por uno vacío se oculta.
  if (!day || !count(day)) return hide();
  const box = root.value.getBoundingClientRect();
  const r = cell.getBoundingClientRect();
  const center = r.left - box.left + r.width / 2;
  // Centrado sobre la celda, sin salirse del calendario; la flecha sigue apuntando a la celda.
  const x = Math.min(Math.max(center, TIP_W / 2 + EDGE), box.width - TIP_W / 2 - EDGE);
  Object.assign(tip, { on: true, day, x, y: r.top - box.top, arrow: center - x });
};
const hide = () => {
  tip.on = false;
};

// Empieza mostrando lo más reciente (a la derecha).
const scroller = ref<HTMLElement | null>(null);
onMounted(() => {
  if (scroller.value) scroller.value.scrollLeft = scroller.value.scrollWidth;
});
</script>

<style scoped>
.contrib {
  --cell: 22px;
  --gap: 4px;
  position: relative;
  border: 1px dashed var(--rule);
  border-radius: 12px;
  padding: 18px 18px 14px;
}
.scroller { overflow-x: auto; padding-bottom: 8px; }
.graph { width: max-content; }
.months,
.cells {
  display: grid;
  grid-template-columns: repeat(var(--weeks), var(--cell));
  column-gap: var(--gap);
}
.months { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
.months span { white-space: nowrap; }
.cells { grid-template-rows: repeat(7, var(--cell)); row-gap: var(--gap); }
.cell {
  width: var(--cell);
  height: var(--cell);
  border-radius: 4px;
  display: grid;
  place-items: center;
  font-size: 10px;
  line-height: 1;
  color: var(--fg);
  background: color-mix(in srgb, var(--fg) 5%, transparent);
}
.l1 { background: color-mix(in srgb, var(--fg) 14%, transparent); }
.l2 { background: color-mix(in srgb, var(--fg) 28%, transparent); }
.l3 { background: color-mix(in srgb, var(--fg) 50%, transparent); color: var(--bg); }
.l4 { background: color-mix(in srgb, var(--fg) 78%, transparent); color: var(--bg); }
.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 12px;
  font-size: 13px;
}
.legend { display: flex; align-items: center; gap: 4px; color: var(--muted); font-size: 12px; }
.legend .sw { --cell: 12px; border-radius: 3px; }
.legend .sw:first-child { margin-left: 4px; }
.legend .sw:last-of-type { margin-right: 4px; }

/* Celda bajo el cursor: un anillo de tinta, sin mover la cuadrícula. */
.cell { transition: box-shadow .15s ease; }
.cell.hot { box-shadow: 0 0 0 1.5px var(--bg), 0 0 0 3px var(--fg); }

/* Tooltip en tinta invertida: sirve igual en claro y en oscuro. Aparece subiendo
   con un leve rebote y, mientras está abierto, se desliza entre celdas. */
.tip {
  --ease-out: cubic-bezier(.2, .8, .2, 1);
  --spring: cubic-bezier(.34, 1.56, .64, 1);
  position: absolute;
  z-index: 5;
  width: 164px;
  padding: 10px 12px 11px;
  display: grid;
  gap: 5px;
  border-radius: 10px;
  background: var(--fg);
  color: var(--bg);
  font-size: 12px;
  box-shadow: 0 14px 32px -14px color-mix(in srgb, var(--fg) 55%, transparent);
  pointer-events: none;
  transform-origin: calc(50% + var(--arrow)) 100%;
  transform: translate(-50%, calc(-100% - 6px)) scale(.94);
  opacity: 0;
  transition:
    opacity .14s ease,
    transform .26s var(--spring),
    left .2s var(--ease-out),
    top .2s var(--ease-out);
}
.tip.on {
  opacity: 1;
  transform: translate(-50%, calc(-100% - 10px)) scale(1);
}
/* Flecha que apunta a la celda aunque el tooltip esté pegado a un borde. */
.tip::after {
  content: '';
  position: absolute;
  left: calc(50% + var(--arrow) - 5px);
  bottom: -5px;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: inherit;
  rotate: 45deg;
  transition: left .2s var(--ease-out);
}
.tip-date {
  font-size: 11px;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--bg) 60%, transparent);
}
.tip-row { display: flex; align-items: center; gap: 7px; }
.tip-row b { margin-left: auto; font-weight: 500; font-variant-numeric: tabular-nums; }
.dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }
.s0 { background: var(--bg); }
.s1 { background: color-mix(in srgb, var(--bg) 40%, transparent); }
.tip-bar {
  display: flex;
  height: 4px;
  margin-top: 3px;
  border-radius: 2px;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg) 14%, transparent);
}
.tip-bar span { transition: width .3s var(--ease-out); }

@media (prefers-reduced-motion: reduce) {
  .tip,
  .tip.on { transform: translate(-50%, calc(-100% - 10px)); transition: opacity .14s ease; }
  .tip::after,
  .tip-bar span { transition: none; }
}
</style>

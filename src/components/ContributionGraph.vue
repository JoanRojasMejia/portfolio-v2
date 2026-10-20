<template>
  <!-- Calendario de contribuciones: una columna por semana, el número del día en
       cada celda y la tinta más oscura cuantas más contribuciones. -->
  <div class="contrib">
    <div ref="scroller" class="scroller">
      <div class="graph" :style="{ '--weeks': cal.weeks.length }">
        <div class="months mono" aria-hidden="true">
          <span v-for="m in months" :key="m.col" :style="{ gridColumn: `${m.col + 1} / span 4`, gridRow: 1 }">{{ m.label }}</span>
        </div>
        <div class="cells" role="img" :aria-label="summary">
          <template v-for="(week, w) in cal.weeks" :key="w">
            <span
              v-for="(d, i) in week"
              :key="d.date"
              class="cell mono"
              :class="`l${level(d)}`"
              :style="{ gridColumn: w + 1, gridRow: dayRow(w, i) }"
              :title="tip(d)"
              aria-hidden="true"
            >{{ count(d) || '' }}</span>
          </template>
        </div>
      </div>
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
import { computed, onMounted, ref } from 'vue';
import type { ContribCalendar, ContribDay } from '../lib/contributions';
import { lang, t } from '../lib/site';

const props = defineProps<{ cal: ContribCalendar }>();

const count = (d: ContribDay) => d.gh + d.extra;

// Nivel de tinta (0–4) relativo al día con más contribuciones del año.
const max = computed(() => Math.max(1, ...props.cal.weeks.flat().map(count)));
const level = (d: ContribDay) => {
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

const word = (n: number) => (lang.value === 'es' ? (n === 1 ? 'contribución' : 'contribuciones') : n === 1 ? 'contribution' : 'contributions');
const tip = (d: ContribDay) => {
  const c = count(d);
  const when = dateFmt.value.format(new Date(`${d.date}T00:00:00Z`));
  const parts = d.extra && d.gh ? ` (${d.extra} Global66 · ${d.gh} GitHub)` : '';
  return `${c || (lang.value === 'es' ? 'Sin' : 'No')} ${word(c)}${parts} · ${when}`;
};
const summary = computed(() => `${props.cal.total.toLocaleString(locale.value)} ${word(props.cal.total)} ${t.value.lastYear}`);

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
  border: 1px dashed var(--rule);
  border-radius: 12px;
  padding: 18px 18px 14px;
}
.scroller { overflow-x: auto; scrollbar-width: thin; padding-bottom: 6px; }
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
</style>

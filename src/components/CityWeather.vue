<template>
  <span class="city">
    <!-- Croquis de Bogotá: solo el contorno exterior, simplificado -->
    <svg class="icon map" viewBox="0 0 100 72" aria-hidden="true">
      <polygon points="3.5,5.5 9.5,1.2 22.5,2.8 30,6.8 36.5,9 39,12.8 45,17.8 53,21.2 56.5,24.5 63,27.2 69,29.2 72.5,27 76.5,29 83,32.5 85.8,35.8 90,35 94,34.2 99.5,33.5 98.5,40.5 97.2,44 95,46.8 89.5,49.2 81.2,47.6 80,54 76.5,58.5 70.5,58 66,59.5 59.5,64 56.2,70.5 47,70 44.2,66.2 44.8,62 42.5,58.5 40.8,46.5 37.8,47.5 36.5,54.5 31.8,57.5 26.2,56 23.2,51 19,50.5 17.6,46.5 18.5,41.2 15,39.8 12.2,40 12.2,33.5 7.2,29.6 3.5,26.2 8.5,23.2 15.8,23.8 14.2,21.2 6.8,19.8 5.2,17.8 5.6,12.2 3.5,10.5" />
    </svg>
    <span class="place" tabindex="0" :aria-describedby="tipId">
      Bogotá
      <!-- Tooltip: a cuánto está el visitante y las coordenadas -->
      <span :id="tipId" class="tip" role="tooltip">
        <span v-if="nearLine" class="tip-main">{{ nearLine }}</span>
        <span class="tip-coords mono">{{ coords }}</span>
      </span>
    </span><span class="sep">,</span>
    <span class="nowrap">{{ clock }}</span>
    <span v-if="weather" class="weather" :title="label">
      <svg class="icon" viewBox="0 0 16 16" role="img" :aria-label="label">
        <!-- sol -->
        <template v-if="weather.sky === 'clear' && weather.day">
          <circle cx="8" cy="8" r="2.8" />
          <path d="M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M3.5 12.5l1.1-1.1M11.4 4.6l1.1-1.1" />
        </template>
        <!-- luna -->
        <path v-else-if="weather.sky === 'clear'" d="M12.8 10.2A5.2 5.2 0 0 1 5.8 3.2a5.2 5.2 0 1 0 7 7Z" />
        <!-- parcialmente nublado: sol o luna arriba a la izquierda y la nube delante,
             rellena con el color del fondo para que tape lo que queda detrás -->
        <template v-else-if="weather.sky === 'partly'">
          <template v-if="weather.day">
            <circle cx="6" cy="6" r="2.6" />
            <path d="M6 1.2v1.1M1.2 6h1.1M2.6 2.6l.8.8M9.4 2.6l-.8.8M2.6 9.4l.8-.8" />
          </template>
          <path v-else d="M8.4 2.3A3.7 3.7 0 1 0 9.6 8.4 2.9 2.9 0 0 1 8.4 2.3Z" />
          <path class="front" d="M6.2 14h6.3a2.3 2.3 0 0 0 .3-4.6 3.2 3.2 0 0 0-6.1.5A2.05 2.05 0 0 0 6.2 14Z" />
        </template>
        <!-- nubes -->
        <template v-else>
          <path
            v-if="weather.sky !== 'fog'"
            d="M4.6 11.2h7a2.4 2.4 0 0 0 .3-4.8 3.4 3.4 0 0 0-6.5.6 2.1 2.1 0 0 0-.8 4.2Z"
          />
          <path v-if="weather.sky === 'rain'" d="M6 12.9l-.6 1.5M8.6 12.9 8 14.4M11.2 12.9l-.6 1.5" />
          <path v-if="weather.sky === 'storm'" d="M8.8 12 7.4 13.8h2l-1.4 1.8" />
          <path v-if="weather.sky === 'snow'" d="M6 13.4h.01M8.4 14.4h.01M10.8 13.4h.01" class="dots" />
          <path v-if="weather.sky === 'fog'" d="M2.5 6.5h11M1.5 9h13M3.5 11.5h9" />
        </template>
      </svg>
      <span class="nowrap">{{ weather.temp }}°C</span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue';
import { formatFlight, formatKm, visitorDistance, type Nearness } from '../lib/geo';
import { clock, isEs } from '../lib/site';
import { WEATHER_TTL_MS, getWeather, type Sky, type Weather } from '../lib/weather';

// Ciudad, hora local y clima de Bogotá para el header. Las coordenadas quedan
// en el tooltip de "Bogotá"; el clima se actualiza cada 15 min.
const weather = ref<Weather | null>(null);
const coords = '4°40′ N  74°03′ W';
const tipId = useId();

// A cuánto está el visitante de Bogotá (se calcula en el navegador, por zona horaria).
const near = ref<Nearness>(null);
const nearLine = computed(() => {
  const n = near.value;
  if (!n) return '';
  const es = isEs.value;
  if (n.kind === 'same') return es ? 'Estás en Colombia, como yo' : "You're in Colombia too";
  const km = formatKm(n.km, es);
  if (n.km < 300) return es ? `A ${km} de ti` : `${km} from you`;
  const fly = formatFlight(n.flightMin);
  return es ? `A ${km} de ti · ${fly} en avión` : `${km} from you · ${fly} by air`;
});

const SKY_LABEL: Record<Sky, [string, string]> = {
  clear: ['Despejado', 'Clear'],
  partly: ['Parcialmente nublado', 'Partly cloudy'],
  cloudy: ['Nublado', 'Cloudy'],
  fog: ['Niebla', 'Fog'],
  rain: ['Lluvia', 'Rain'],
  snow: ['Nieve', 'Snow'],
  storm: ['Tormenta', 'Thunderstorm'],
};
const label = computed(() => {
  if (!weather.value) return '';
  const [es, en] = SKY_LABEL[weather.value.sky];
  const t = `${weather.value.temp}°C`;
  return isEs.value ? `${es} en Bogotá · ${t}` : `${en} in Bogotá · ${t}`;
});

let timer = 0;
const refresh = async () => {
  weather.value = (await getWeather()) ?? weather.value;
};
onMounted(() => {
  near.value = visitorDistance();
  void refresh();
  timer = window.setInterval(refresh, WEATHER_TTL_MS);
});
onBeforeUnmount(() => clearInterval(timer));
</script>

<style scoped>
.city { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.icon {
  width: 14px;
  height: 14px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.icon .dots { stroke-width: 1.8; }
.icon .front { fill: var(--bg); }
.icon.map { width: 19px; height: 14px; }
/* El contorno se dibuja a 100×72 y se ve a ~19 px: el trazo no escala para quedar fino. */
.icon.map polygon { stroke-width: 1.1; vector-effect: non-scaling-stroke; }
.place { position: relative; cursor: default; }
.place:hover, .place:focus-visible { color: var(--fg); outline: none; }
.tip {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  z-index: 70;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  background: var(--fg);
  color: var(--bg);
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .18);
  opacity: 0;
  visibility: hidden;
  transform: translate(-50%, -4px);
  transition: opacity .18s ease, transform .18s ease, visibility .18s;
  pointer-events: none;
}
/* Pequeño trazo que une el tooltip con la palabra */
.tip::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 50%;
  width: 1px;
  height: 12px;
  background: var(--fg);
}
.place:hover .tip,
.place:focus-visible .tip { opacity: 1; visibility: visible; transform: translate(-50%, 0); }
.tip-main { font-size: 13px; }
.tip-coords { font-size: 11px; opacity: .6; letter-spacing: .04em; }
.sep { margin-left: -6px; }
.nowrap { font-variant-numeric: tabular-nums; }
.weather { display: inline-flex; align-items: center; gap: 5px; margin-left: 6px; }
</style>

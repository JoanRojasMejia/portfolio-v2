import { computed, ref } from 'vue';
import { PAGE_T, T, type Lang } from './i18n';
import { ARTISTS, GREET } from './data';

export const ls = (k: string, v?: string): string | null => {
  try {
    if (v === undefined) return localStorage.getItem(k);
    localStorage.setItem(k, v);
  } catch {}
  return null;
};

// Shared reactive state for the whole page (one Vue island).
export const lang = ref<Lang>('es');
export const theme = ref<'light' | 'dark'>('light');
export const now = ref<Date | null>(null);
const gi = ref(0);
const ai = ref(0);

export const t = computed(() => T[lang.value]);
export const pt = computed(() => PAGE_T[lang.value]);
export const isEs = computed(() => lang.value === 'es');
export const greeting = computed(() => GREET[gi.value]);
export const nowArtist = computed(() => ARTISTS[ai.value]);

const tz = 'America/Bogota';
// Hora de Bogotá (sin segundos), sin importar la zona horaria del visitante.
const clockFmt = new Intl.DateTimeFormat('es-CO', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
const dayFmt = new Intl.DateTimeFormat('es-CO', { timeZone: tz, day: '2-digit', month: '2-digit', year: 'numeric' });
export const clock = computed(() => (now.value ? clockFmt.format(now.value) : '--:--'));
export const today = computed(() => (now.value ? dayFmt.format(now.value).replace(/\//g, '.') : ''));

export function setLang(l: Lang) {
  ls('jr_lang', l);
  lang.value = l;
  document.documentElement.lang = l;
}

export function setTheme(th: 'light' | 'dark') {
  ls('jr_theme', th);
  document.documentElement.dataset.theme = th;
  theme.value = th;
}

export function startSite() {
  const storedLang = ls('jr_lang');
  if (storedLang === 'es' || storedLang === 'en') setLang(storedLang);
  theme.value = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  now.value = new Date();
  const tick = setInterval(() => (now.value = new Date()), 1000);
  const rot = setInterval(() => {
    gi.value = (gi.value + 1) % GREET.length;
    ai.value = (ai.value + 1) % ARTISTS.length;
  }, 3200);
  return () => {
    clearInterval(tick);
    clearInterval(rot);
  };
}

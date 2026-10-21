<template>
  <main class="sheet lab">
    <a href="/" class="back mono">← Volver</a>
    <h1 class="serif">Sonidos</h1>
    <p class="intro">
      Escucha cada sonido y elige cuál va en cada interacción. Los cambios se aplican al instante en este navegador
      (solo en desarrollo); cuando te guste, copia la configuración en <code>src/lib/sound.ts</code>.
    </p>

    <section v-for="role in ROLE_INFO" :key="role.id" class="role">
      <header class="role-head">
        <div>
          <h2 class="mono">{{ role.label }}</h2>
          <p>{{ role.hint }}</p>
        </div>
        <span class="mono current">{{ LIBRARY[roles[role.id]].label }}</span>
      </header>
      <div class="chips" role="radiogroup" :aria-label="role.label">
        <button
          v-for="id in ids"
          :key="id"
          type="button"
          role="radio"
          class="chip"
          :class="{ on: roles[role.id] === id, suggested: role.suggested.includes(id) }"
          :aria-checked="roles[role.id] === id"
          :title="LIBRARY[id].hint"
          data-sound="none"
          @click="assign(role.id, id)"
        >
          <span class="play" aria-hidden="true">▶</span>{{ LIBRARY[id].label }}
        </button>
      </div>
    </section>

    <section class="try">
      <h2 class="mono">Pruébalo</h2>
      <p>Pasa el mouse y haz clic, como en el sitio.</p>
      <div class="try-row" data-sound="none">
        <a href="#" class="try-link" @pointerenter="hover" @click.prevent="preview(roles.tap)">Un enlace</a>
        <button type="button" class="try-btn" @pointerenter="hover" @click="preview(roles.tap)">Un botón</button>
        <button type="button" class="try-btn" @pointerenter="hover" @click="preview(roles.toggle)">◐ Cambiar tema</button>
        <button type="button" class="try-btn" @pointerenter="hover" @click="preview(roles.success)">🔊 Activar sonido</button>
      </div>
    </section>

    <section class="config">
      <div class="config-head">
        <h2 class="mono">Configuración</h2>
        <div class="actions" data-sound="none">
          <button type="button" class="try-btn" @click="copy">{{ copied ? 'Copiado ✓' : 'Copiar' }}</button>
          <button type="button" class="try-btn" @click="reset">Restablecer</button>
        </div>
      </div>
      <pre class="mono"><code>{{ snippet }}</code></pre>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { LIBRARY, ROLES, ROLES_DEV_KEY, currentRoles, preview, type SoundId, type SoundRole } from '../lib/sound';
import { ls } from '../lib/site';

// Página de prueba (solo en `pnpm dev`): escuchar la biblioteca y asignar un
// sonido a cada rol. La asignación se guarda en localStorage para probarla en el
// sitio; para publicarla hay que copiarla en ROLES (src/lib/sound.ts).

const ROLE_INFO: { id: SoundRole; label: string; hint: string; suggested: SoundId[] }[] = [
  { id: 'hover', label: 'Hover', hint: 'Al pasar el mouse por enlaces y botones. Mejor si es muy corto.', suggested: ['tick', 'blip', 'breath', 'glint'] },
  { id: 'tap', label: 'Clic', hint: 'Al hacer clic en enlaces y botones.', suggested: ['tap', 'pop', 'wood', 'chirp'] },
  { id: 'toggle', label: 'Toggle', hint: 'Al cambiar tema o idioma.', suggested: ['toggle', 'flip', 'swell'] },
  { id: 'success', label: 'Activar sonido', hint: 'Cuando el visitante enciende los sonidos.', suggested: ['success', 'chime'] },
];

const ids = Object.keys(LIBRARY) as SoundId[];
const roles = reactive<Record<SoundRole, SoundId>>({ ...currentRoles() });
const copied = ref(false);

const save = () => ls(ROLES_DEV_KEY, JSON.stringify(roles));

const assign = (role: SoundRole, id: SoundId) => {
  roles[role] = id;
  preview(id);
  save();
};

const hover = (e: PointerEvent) => {
  if (e.pointerType === 'mouse') preview(roles.hover);
};

const reset = () => {
  Object.assign(roles, ROLES);
  try {
    localStorage.removeItem(ROLES_DEV_KEY);
  } catch {}
};

const snippet = computed(
  () =>
    `export const ROLES: Record<SoundRole, SoundId> = {\n` +
    (Object.keys(roles) as SoundRole[]).map((r) => `  ${r}: '${roles[r]}',`).join('\n') +
    `\n};`,
);

const copy = async () => {
  try {
    await navigator.clipboard.writeText(snippet.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1600);
  } catch {}
};
</script>

<style scoped>
.lab { max-width: 880px; padding-bottom: 96px; display: flex; flex-direction: column; gap: 40px; }
.back { font-size: 12px; color: var(--muted); }
h1 { margin: 0; font-size: clamp(56px, 9vw, 104px); line-height: .9; }
.intro { margin: 0; max-width: 40em; color: var(--muted); font-size: 17px; line-height: 1.5; }
code { font-family: var(--mono); font-size: .9em; }
h2 { margin: 0; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; font-weight: 500; }
section p { margin: 4px 0 0; color: var(--muted); font-size: 14px; }

.role { display: flex; flex-direction: column; gap: 14px; padding-top: 24px; border-top: 1px solid var(--rule); }
.role-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.current { font-size: 12px; padding: 4px 10px; border-radius: 999px; background: var(--fg); color: var(--bg); white-space: nowrap; }

.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: var(--card);
  color: var(--muted);
  font: 13px var(--sans);
  cursor: pointer;
  transition: border-color .2s, color .2s, background .2s;
}
.chip.suggested { color: var(--fg); }
.chip:hover { border-color: var(--fg); }
.chip.on { background: var(--fg); border-color: var(--fg); color: var(--bg); }
.chip:focus-visible, .try-btn:focus-visible, .try-link:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; }
.play { font-size: 8px; opacity: .7; }

.try, .config { display: flex; flex-direction: column; gap: 14px; padding-top: 24px; border-top: 1px solid var(--rule); }
.try-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.try-link { text-decoration: underline; text-underline-offset: 4px; }
.try-btn {
  padding: 9px 16px;
  border: 1px solid var(--fg);
  border-radius: 999px;
  background: transparent;
  color: var(--fg);
  font: 13px var(--sans);
  cursor: pointer;
}
.try-btn:hover { background: var(--fg); color: var(--bg); }

.config-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.actions { display: flex; gap: 8px; }
pre {
  margin: 0;
  padding: 18px 20px;
  border: 1px solid var(--rule);
  border-radius: 12px;
  background: var(--card);
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}
</style>

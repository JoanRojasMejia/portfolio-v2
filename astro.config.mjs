import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import vercel from '@astrojs/vercel';

// El sitio sigue siendo estático. El adapter solo hace falta para las rutas con
// `prerender = false` (hoy, /api/now-playing), que corren como funciones de Vercel.
export default defineConfig({
  integrations: [vue()],
  adapter: vercel(),
});

# Portafolio v2

Sitio estático con Astro 7 y islas de Vue 3.5. No tiene base de datos. Node 20 o superior y pnpm 12 (versión fijada en `packageManager`).

## Cómo correrlo

```bash
pnpm install --frozen-lockfile
cp .env.example .env   # luego pega LASTFM_KEY y GITHUB_TOKEN a mano
pnpm dev               # http://localhost:4321
pnpm build             # genera dist/ (13 páginas)
```

- El gestor es pnpm: no uses npm ni generes `package-lock.json`; el lockfile es `pnpm-lock.yaml`.

- `.env` está en `.gitignore`: nunca se sube ni se muestra su contenido.
- Sin claves el sitio igual funciona: la canción del hero muestra "Last.fm no disponible" y la sección Actividad se oculta si tampoco hay datos en `src/data/contributions-extra.json`.
- `/sonidos` existe solo en desarrollo (en producción redirige a `/`).

## Dónde vive cada cosa

- `src/pages/`: rutas (`index`, `caso/[id]`, `album`, `colophon`, `sonidos`).
- `src/components/`: secciones de la portada (`*Section.vue`, orquestadas por `Portfolio.vue`) y páginas (`CasePage.vue`, `AlbumPage.vue`, `ColophonPage.vue`).
- `src/lib/data.ts`: proyectos, experimentos y bandas sonoras que se muestran en tarjetas y fichas.
- `src/lib/work-content.ts`: relatos completos de cada proyecto (fuente de los resúmenes).
- `src/lib/case-summary.ts`: textos cortos de cada página de caso.
- `src/lib/work-media.ts` y `public/assets/work/video/{id}/`: videos (teaser claro/oscuro, demo, recorrido) y sus pósters.
- `src/lib/i18n.ts`: todos los textos visibles en ES/EN.
- `src/lib/contributions.ts` y `src/data/contributions-extra.json`: calendario de Actividad (GitHub + conteos extra).
- `scripts/export-codecommit.mjs`: exporta contribuciones de CodeCommit como `{ "AAAA-MM-DD": n }`, sin nombres de repos ni mensajes.
- `src/styles/global.css`: tokens de color y tipografía.

## Convenciones

- Todo texto visible va en español e inglés en `src/lib/i18n.ts`.
- Los comentarios del código se escriben en español.
- Los colores son tokens en `:root` de `src/styles/global.css`, con su versión en `:root[data-theme="dark"]`. El tema se cambia con `setTheme` en `src/lib/site.ts`.
- Las API keys se leen solo en build time, en el frontmatter de Astro (`import.meta.env` en `src/lib/lastfm.ts` y `src/lib/contributions.ts`). Al cliente solo llegan los datos ya resueltos, nunca la clave.

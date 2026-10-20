// Videos de los proyectos de Global66, grabados con datos de prueba
// (~/portfolio-videos) y comprimidos para la web en public/assets/work/video/{id}/.
// - teaser: bucle de 10 s para la tarjeta (4:3), en versión clara y oscura.
// - demo: momentos clave con zoom, solo la ventana de la app (16:10).
// - walk: recorrido completo del flujo, solo la ventana de la app (16:10).
// - compare: misma pantalla en B2C y B2B, para el comparador del caso.

export interface Clip {
  src: string;
  poster: string;
  /** Duración en segundos, para el pie de figura. */
  secs: number;
}

export interface WorkMedia {
  teaser: { light: Clip; dark: Clip };
  demo: Clip;
  walk: Clip;
  compare?: { before: string; after: string };
}

const base = (id: string, demoSecs: number, walkSecs: number): WorkMedia => {
  const dir = `/assets/work/video/${id}`;
  return {
    teaser: {
      light: { src: `${dir}/teaser-light.mp4`, poster: `${dir}/teaser-light.webp`, secs: 10 },
      dark: { src: `${dir}/teaser-dark.mp4`, poster: `${dir}/teaser-dark.webp`, secs: 10 },
    },
    demo: { src: `${dir}/demo.mp4`, poster: `${dir}/demo.webp`, secs: demoSecs },
    walk: { src: `${dir}/recorrido.mp4`, poster: `${dir}/recorrido.webp`, secs: walkSecs },
  };
};

export const WORK_MEDIA: Record<string, WorkMedia> = {
  multi: base('multi', 21, 59),
  onb: base('onb', 20, 69),
  ds: {
    ...base('ds', 15, 60),
    compare: { before: '/assets/work/video/ds/b2c.webp', after: '/assets/work/video/ds/b2b.webp' },
  },
};

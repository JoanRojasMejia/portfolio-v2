// Trazo del logo en pixel art: Striky, la mascota del sitio. Lo usan el SVG del
// header (Logo.vue) y los personajes que arman las imágenes (AsciiBuild.vue),
// que lo dibujan con Path2D.
export const LOGO_W = 742;
export const LOGO_H = 534;
export const LOGO_PATH =
  'M57 0H97V41H57ZM645 0H685V41H645ZM57 41H137V67H57ZM605 41H685V67H605ZM91 67H137V83H91ZM605 67H651V83H605ZM91 83H183V115H91ZM559 83H651V115H559ZM122 115H183V128H122ZM559 115H620V128H559ZM122 128H620V174H122ZM80 174H663V244H80ZM80 244H225V331H80ZM267 244H477V331H267ZM519 244H663V331H519ZM34 331H225V358H34ZM267 331H477V358H267ZM519 331H708V358H519ZM0 358H742V389H0ZM0 389H287V404H0ZM456 389H742V404H456ZM0 404H59V415H0ZM80 404H287V415H80ZM456 404H663V415H456ZM683 404H742V415H683ZM0 415H59V426H0ZM80 415H302V426H80ZM319 415H424V426H319ZM441 415H663V426H441ZM683 415H742V426H683ZM80 426H302V448H80ZM319 426H424V448H319ZM441 426H663V448H441ZM80 448H663V491H80ZM151 491H221V534H151ZM521 491H591V534H521Z';

// Saludo por fotogramas, como un sprite de pixel art. Lo usan el logo del header
// (Logo.vue + CSS de SiteHeader) y las mascotas que arman la foto (AsciiBuild.vue).
// Poses del brazo izquierdo: [x, y, ancho, alto] en unidades del viewBox; un pixel
// del logo mide ~44. Brazo en L: sale hacia el costado a la altura del hombro y el
// antebrazo sube un pixel antes de la mano, separado de la cabeza (empieza en x = 80).
export type ArmPose = 'raise' | 'up' | 'out' | 'open';
export const ARM_POSES: Record<ArmPose, [number, number, number, number][]> = {
  raise: [[0, 331, 80, 44], [-40, 287, 44, 44]],
  up: [[0, 331, 80, 44], [0, 287, 44, 44], [-4, 243, 52, 44]],
  out: [[0, 331, 80, 44], [-22, 287, 44, 44], [-44, 243, 52, 44]],
  open: [[0, 331, 80, 44], [0, 287, 44, 44], [-18, 235, 80, 52]],
};
export const WAVE_STEP_MS = 90; // cada paso al subir o bajar el brazo
export const WAVE_FRAME_MS = 150; // cada pose del bucle
const WAVE_LOOP: ArmPose[] = ['up', 'out', 'up', 'open'];

// Pose del brazo a los `ms` de empezar un saludo que dura `total` ms: sube en arco
// (diagonal → arriba), se mece en bucle y baja pasando otra vez por la diagonal.
// null = brazo en reposo.
export function wavePose(ms: number, total: number): ArmPose | null {
  if (ms < 0) return null;
  if (ms < WAVE_STEP_MS) return 'raise';
  if (ms < WAVE_STEP_MS * 2) return 'up';
  if (ms < total) return WAVE_LOOP[Math.floor((ms - WAVE_STEP_MS * 2) / WAVE_FRAME_MS) % WAVE_LOOP.length];
  if (ms < total + WAVE_STEP_MS) return 'raise';
  return null;
}
